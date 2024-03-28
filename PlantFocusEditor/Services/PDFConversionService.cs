using iText.Kernel.Pdf;
using iText.Layout;
using System.Text.Json;
using Library.Classes;
using System.Text.RegularExpressions;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Geom;
using iText.Layout.Element;
using iText.Layout.Properties;
using System.Drawing;
using iText.Kernel.Colors;

namespace PlantFocusEditor.Services
{
    public class PDFConversionService
    {
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

        public byte[] SaveToPdf(string jsonString, float[] dimensions)
        {            
            RootObject root = ConvertFromJson(jsonString);
            _canvas = new PdfCanvas(_pdf.AddNewPage(new PageSize(dimensions[0], dimensions[1])));
            Console.WriteLine($"root class: {root.className}");
            double x = root.attrs.x;
            double y = root.attrs.y;
            foreach (Child child in root.children)
            {
                if (child.attrs.name == "passepartout")
                {
                    AddLabelShape(child, x, y);
                }
                else if (child.className == "Text")
                {
                    AddText(child, x, y);
                }
                else if (child.className == "Path")
                {
                    AddPath(child, x, y);
                }
            }
            return GetPdfBytes();
        }        

        private byte[] GetPdfBytes()
        {
            _pdf.Close();
            // Get the bytes from the memory stream
            return _memoryStream.ToArray();
        }

        private void AddPath(Child child, double x, double y)
        {
            // ignore for now
        }

        private void AddText(Child child, double x, double y)
        {
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
            Paragraph paragraph = new Paragraph(child.attrs.text)
                .SetTextAlignment(align)
                .SetFontSize(child.attrs.fontSize)
                .SetFixedPosition((float) x,(float) y,(float) child.attrs.width);
            if (child.attrs.fill != null)
            {
                if (child.attrs.fill.StartsWith("#"))
                {
                    DeviceRgb color = HexToColor(child.attrs.fill);
                    paragraph.SetFontColor(color);
                } else
                {
                    paragraph.SetFontColor(new DeviceRgb(0, 0, 0));
                }
            }
            _document.Add(paragraph);
        }

        private void AddLabelShape(Child child, double x, double y)
        {
            string[] commands = ParsePathData(child.attrs.data);
            _canvas.SetLineWidth(1f);
            foreach (var command in commands)
            {
                double[] coords = null;
                if (!command.StartsWith('Z'))
                {
                    coords = TransformCoords(command, x, y);
                }                
                DrawPathFromCommands(command, coords);
            }
            _canvas.Stroke();
        }

        private double[] TransformCoords(string command, double x, double y)
        {
            string stringCoords = command.Substring(1, command.Length - 1);
            double[] coords = Array.ConvertAll(stringCoords.Split(','), Double.Parse);
            for (int i = 0; i < coords.Length; i++)
            {
                if (i % 2 == 0)
                {
                    coords[i] = coords[i] + y;
                }
                else
                {
                    coords[i] = coords[i] + x;
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

        private string[] ParsePathData(string pathString)
        {
            string pattern = @"[MLCZ][^MLCZ]*";
            string[] matches = Regex.Matches(pathString, pattern).Cast<Match>().Select(m => m.Value).ToArray();
            return matches;
        }

        private RootObject ConvertFromJson(string jsonString)
        {
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
