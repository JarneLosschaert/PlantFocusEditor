using iText.Kernel.Pdf;
using iText.Layout;
using System.Text.Json;
using Library.Classes;
using System.Text.RegularExpressions;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Geom;
using iText.Layout.Element;
using iText.Layout.Properties;
using PlantFocusEditor.Helpers;
using iText.Kernel.Colors;
using iText.Layout.Renderer;
using iText.Kernel.Font;
using iText.IO.Font;
using iText.Layout.Layout;
using iText.IO.Image;
using iText.Layout.Borders;

namespace PlantFocusEditor.Services
{
    public class PDFConversionService
    {
        private string _fontsDirectory;
        private MemoryStream _memoryStream;
        private PdfWriter _writer;
        private PdfDocument _pdf;
        private Document _document;
        private PdfCanvas _canvas;

        public PDFConversionService()
        {
            _memoryStream = new MemoryStream();
            _writer = new PdfWriter(_memoryStream);
            _pdf = new PdfDocument(_writer);
            _document = new Document(_pdf);  
        }

        public byte[] SaveToPdf(string jsonString, float[] dimensions, string fontsDir)
        {
            _fontsDirectory = fontsDir;
            RootObject root = ConvertFromJson(jsonString);
            _canvas = new PdfCanvas(_pdf.AddNewPage(new PageSize(dimensions[0], dimensions[1])));
            double x = root.attrs.x;
            double y = root.attrs.y;
            foreach (Child child in root.children)
            {
                child.attrs.y = dimensions[1] - (child.attrs.y + y + 10);
                child.attrs.x = child.attrs.x + x;
                if (child.attrs.name == "passepartout")
                {
                    string[] commands = PathUtils.ParsePathData(child.attrs.data);
                    AddLabelShape(commands, x, y, dimensions[1]);
                }
                else if (child.className == "Text")
                {
                    AddText(child);
                }
                else if (child.className == "Path")
                {
                    AddPath(child);
                }
                else if (child.className == "Image")
                {
                    AddImage(child);
                }
            }
            return GetPdfBytes();
        }        

        private byte[] GetPdfBytes()
        {
            _pdf.Close();
            return _memoryStream.ToArray();
        }

        private void AddImage(Child child)
        {
            string base64 = child.attrs.src.Substring(child.attrs.src.IndexOf(",") + 1);
            byte[] data = Convert.FromBase64String(base64);
            ImageData imgData = ImageDataFactory.Create(data);
            Image image = new(imgData);            
            image
                .SetWidth((float) (child.attrs.width * child.attrs.scaleX))
                .SetHeight((float) (child.attrs.height * child.attrs.scaleY))
                .SetFixedPosition((float) child.attrs.x, (float) (child.attrs.y - (child.attrs.height * child.attrs.scaleY)));
            if (child.attrs.opacity != null)
            {
                image.SetOpacity((float)child.attrs.opacity);
            }
            if (child.attrs.strokeWidth != 0)
            {
                DeviceRgb color = HexToColor(child.attrs.stroke);
                Border border = new SolidBorder(color, child.attrs.strokeWidth);
                image.SetBorder(border);
            }
            _document.Add(image);
        }

        private void AddPath(Child child)
        {
            // ignore for now
        }

        private void AddText(Child child)
        {
            //string fontName = FontUtils.GetFontFileName(child.attrs.fontFamily, child.attrs.fontStyle);
            //string path = $"{_fontsDirectory}/{fontName}";
            //PdfFont font = PdfFontFactory.CreateFont(path);
            PdfFont font = PdfFontFactory.CreateFont();

            TextAlignment align;
            switch (child.attrs.align)
            {
                case "center":
                    align = TextAlignment.CENTER; break;
                case "right":
                    align = TextAlignment.RIGHT; break;
                case "left":
                    align = TextAlignment.LEFT; break;
                default:
                    align = TextAlignment.CENTER; break;
            }
            Paragraph text = new Paragraph(child.attrs.text)
                .SetTextAlignment(align)
                .SetFont(font)
                .SetFontSize(child.attrs.fontSize);

            IRenderer renderer = text.CreateRendererSubTree();
            LayoutResult result = renderer.SetParent(_document.GetRenderer()).Layout(new LayoutContext(new LayoutArea(1, new Rectangle(1000, 1000))));
            float textHeight = result.GetOccupiedArea().GetBBox().GetHeight();
            float textWidth = result.GetOccupiedArea().GetBBox().GetWidth();
            Console.WriteLine(textHeight);

            text.SetFixedPosition((float) child.attrs.x , (float) child.attrs.y - textHeight, textWidth);

            if (child.attrs.fill != null)
            {
                if (child.attrs.fill.StartsWith("#"))
                {
                    DeviceRgb color = HexToColor(child.attrs.fill);
                    text.SetFontColor(color);
                } else
                {
                    text.SetFontColor(new DeviceRgb(0, 0, 0));
                }
            }
            _document.Add(text);
        }

        private void AddLabelShape(string[] commands, double x, double y, double stageHeight)
        {            
            _canvas.SetLineWidth(1f);
            foreach (string command in commands)
            {
                double[] coords = null;
                if (!command.StartsWith('Z'))
                {
                    coords = TransformCoords(command, x, y, stageHeight);
                }                
                DrawPathFromCommands(command, coords);
            }
            _canvas.Stroke();
        }

        private double[] TransformCoords(string command, double x, double y, double stageHeight)
        {
            string stringCoords = command.Substring(1, command.Length - 1);
            double[] coords = Array.ConvertAll(stringCoords.Split(','), Double.Parse);
            for (int i = 0; i < coords.Length; i++)
            {
                if (i % 2 == 0)
                {
                    coords[i] = coords[i] + x;
                }
                else
                {
                    coords[i] = stageHeight - (coords[i] + y);
                }
            }
            return coords;
        }

        private void DrawPathFromCommands(string command, double[] coords)
        {
            if (command.StartsWith("M"))
            {
                _canvas.MoveTo(coords[0], coords[1]);
            }
            else if (command.StartsWith("L"))
            {
                _canvas.LineTo(coords[0], coords[1]);
            }
            else if (command.StartsWith("C"))
            {
                _canvas.CurveTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
            }
            else if (command.StartsWith("Z"))
            {
                _canvas.ClosePath();
            }
        }        

        private RootObject ConvertFromJson(string jsonString)
        {
            Console.WriteLine(jsonString);
            string json = RemoveBackslashesFromJson(jsonString);
            RootObject jsonObject = JsonSerializer.Deserialize<RootObject>(json);
            return jsonObject;
        }

        private static string RemoveBackslashesFromJson(string jsonString)
        {
            // Use regular expression to remove backslashes from the JSON string
            string result = Regex.Replace(jsonString, @"\\", "");
            return result.Substring(1, result.Length - 2);
        }

        private static DeviceRgb HexToColor(string hexValue)
        {
            // Remove '#' if present            
            hexValue = hexValue.Substring(1);

            // Parse hexadecimal values
            int r = int.Parse(hexValue.Substring(0, 2), System.Globalization.NumberStyles.HexNumber);
            int g = int.Parse(hexValue.Substring(2, 2), System.Globalization.NumberStyles.HexNumber);
            int b = int.Parse(hexValue.Substring(4, 2), System.Globalization.NumberStyles.HexNumber);

            // Create a new iText7 Color object
            return new DeviceRgb(r, g, b);
        }
    }
}
