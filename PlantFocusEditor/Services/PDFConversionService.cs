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
using iText.Kernel.Colors.Gradients;
using Microsoft.JSInterop;
using iText.Layout.Borders;

namespace PlantFocusEditor.Services
{
    public class PDFConversionService
    {
        private readonly IJSRuntime _runtime;
        private MemoryStream _memoryStream;
        private PdfWriter _writer;
        private PdfDocument _pdf;
        private Document _document;
        private PdfCanvas _canvas;

        public PDFConversionService(IJSRuntime runtime)
        {
            _runtime = runtime;
        }

        public async Task<byte[]> SaveToPdf(string jsonString, float[] dimensions)
        {
            _memoryStream = new MemoryStream();
            _writer = new PdfWriter(_memoryStream);
            _pdf = new PdfDocument(_writer);
            _document = new Document(_pdf);
            RootObject root = ConvertFromJson(jsonString);
            _canvas = new PdfCanvas(_pdf.AddNewPage(new PageSize(dimensions[0], dimensions[1])));
            float x = (float)root.attrs.x;
            float y = (float)root.attrs.y;
            foreach (Child child in root.children)
            {
                await AddNode(child, x, y, dimensions[1]);
            }
            return GetPdfBytes();
        }

        private async Task AddNode(Child child, float x, float y, float stageHeight)
        {
            if (child.attrs.name == "passepartout")
            {
                string[] commands = PathUtils.ParsePathData(child.attrs.data);
                AddPath(commands, child, x, y, stageHeight);
                _canvas.Clip();
                _canvas.Stroke();
            }
            else if (child.className == "Text")
            {
                byte[] fontBytes = await GetFont(child.attrs.fontFamily, child.attrs.fontStyle);
                AddText(child, (float)child.attrs.x + x, stageHeight - ((float)child.attrs.y + y), fontBytes);
            }
            else if (child.className == "Path")
            {
                /*string[] commands = PathUtils.ParsePathData(child.attrs.data);
                Rectangle bbox = AddPath(commands, child, x, y, dimensions[1]);
                if (child.attrs.fillLinearGradientColorStops.Count() >= 2)
                {
                    SetCanvasLinearGradient(child, bbox);
                }
                _canvas.FillStroke();*/
                AddImage(child, x, y, stageHeight);
            }
            else if (child.className == "Image")
            {
                //AddImage(child, x, y, dimensions[1]);
            }
            else if (child.className == "Rect")
            {
                if (child.attrs.strokeWidth > 0)
                {
                    AddRectangle(child, x, y, stageHeight);
                }
            }
            else if (child.className == "Line")
            {
                AddLine(child, x, y + 10, stageHeight);
            }
            else if (child.className == "Group")
            {
                foreach (Child childNode in child.children)
                {
                    await AddNode(childNode, (float)child.attrs.x + x, (float)child.attrs.y + y, stageHeight);
                }
            }
        }

        private async Task<byte[]> GetFont(string? fontFamily, string? fontStyle)
        {
            string font;
            if (fontFamily != null)
            {
                if (fontStyle != null)
                {
                    bool isBold = fontStyle.Contains("bold");
                    bool isItalic = fontStyle.Contains("italic");
                    font = GetFontFileName(fontFamily, isBold, isItalic);
                }
                else
                {
                    font = GetFontFileName(fontFamily, false, false);
                }
            }
            else if (fontStyle != null)
            {
                bool isBold = fontStyle.Contains("bold");
                bool isItalic = fontStyle.Contains("italic");
                font = GetFontFileName("Arial", isBold, isItalic);
            }
            else
            {
                font = GetFontFileName("Arial", false, false);
            }
            return await _runtime.InvokeAsync<byte[]>("getFont", font);
        }

        private static string GetFontFileName(string fontName, bool isBold, bool isItalic)
        {
            fontName = fontName.Replace(" ", "");
            if (isBold)
            {
                fontName = $"{fontName}Bold";
            }
            if (isItalic)
            {
                fontName = $"{fontName}Italic";
            }
            return $"{fontName}.ttf";
        }

        /*private void AddSvg(string pathData)
        {
            string svg = CreateSvgFromPathCommands(pathData);
            SvgConverter.DrawOnCanvas(svg, _canvas);
        }

        static string CreateSvgFromPathCommands(string pathCommands)
        {
            // Create an XmlDocument and append an SVG element with the path data
            XmlDocument doc = new XmlDocument();
            XmlElement svgElement = doc.CreateElement("svg");
            //svgElement.SetAttribute("xmlns", "http://www.w3.org/2000/svg");
            svgElement.SetAttribute("viewBox", "0 0 24 24");
            XmlElement pathElement = doc.CreateElement("path");
            pathElement.SetAttribute("d", pathCommands);
            svgElement.AppendChild(pathElement);
            doc.AppendChild(svgElement);

            // Convert XmlDocument to string
            using (StringWriter sw = new StringWriter())
            {
                using (XmlTextWriter tw = new XmlTextWriter(sw))
                {
                    doc.WriteTo(tw);
                    return sw.ToString();
                }
            }
        }*/

        private void SetCanvasLinearGradient(Child child, Rectangle bbox)
        {
            List<string> relativePoints = [];
            List<Color> colors = [];
            foreach (object el in child.attrs.fillLinearGradientColorStops)
            {
                if (el.ToString().StartsWith('#'))
                {
                    Color rgb = HexToColor(el.ToString());
                    colors.Add(rgb);
                }
                else
                {
                    relativePoints.Add(el.ToString());
                }
            }
            AbstractLinearGradientBuilder gradientBuilder = new LinearGradientBuilder()
                .SetGradientVector(bbox.GetX(), bbox.GetY(), bbox.GetRight(), bbox.GetY());
            foreach (Color color in colors)
            {
                gradientBuilder.AddColorStop(new GradientColorStop(color.GetColorValue()));
            }
            Color gradient = gradientBuilder.BuildColor(bbox, null, _pdf);
            _canvas.SetFillColor(gradient);
        }

        private byte[] GetPdfBytes()
        {
            _pdf.Close();
            return _memoryStream.ToArray();
        }

        private void AddRectangle(Child child, float x, float y, float stageHeight)
        {
            float[] widthHeight = GetNodeWidthHeight(child);
            float width, height;
            (width, height) = (widthHeight[0], widthHeight[1]);
            float left = (float)child.attrs.x + x;
            float bottom = stageHeight - ((float)child.attrs.y + y + height);
            Rectangle rect = new(left, bottom, width, height);
            if (child.attrs.fill.Contains("#"))
            {
                Color rgb = HexToColor(child.attrs.fill);
                _canvas.SetFillColor(rgb);
            }
            _canvas.SetLineWidth((float)child.attrs.strokeWidth);
            _canvas.Rectangle(rect);
            _canvas.Stroke();
            _canvas.SetLineWidth(1);
            
        }

        private void AddLine(Child child, float x, float y, float stageHeight)
        {
            Console.WriteLine(y);
            float width = (float)child.attrs.strokeWidth;
            Color stroke = ColorConstants.BLACK;
            if (child.attrs.stroke.Contains('#'))
            {
                stroke = HexToColor(child.attrs.stroke);
            }
            DrawLine(child.attrs.points, width, x, y, stageHeight, stroke);
        }

        private void DrawLine(double[] points, float width, float x, float y, float stageHeight, Color strokeColor)
        {
            _canvas.SetLineWidth(width);
            _canvas.SetStrokeColor(strokeColor);
            _canvas.MoveTo(points[0] + x, stageHeight - (points[1] + y));
            _canvas.LineTo(points[2] + x, stageHeight - (points[3] + y));
            _canvas.Stroke();
        }

        private void AddImage(Child child, float x, float y, float stageHeight)
        {
            string base64 = child.attrs.src.Substring(child.attrs.src.IndexOf(",") + 1);
            byte[] data = Convert.FromBase64String(base64);
            ImageData imgData = ImageDataFactory.Create(data);
            Image image = new(imgData);

            float[] widthHeight = GetNodeWidthHeight(child);
            float width, height;
            (width, height) = (widthHeight[0], widthHeight[1]);

            float left = (float)child.attrs.x + x;
            float bottom = stageHeight - (float)(child.attrs.y + height + y + 10);
            image
                .SetWidth(width)
                .SetHeight(height);
            if (child.attrs.opacity != null)
            {
                image.SetOpacity((float)child.attrs.opacity);
            }
            if (child.attrs.rotation != 0)
            {
                Point center = GetCenterOfRotatedObjectFromLeftBottom(width, height, left, bottom, child.attrs.rotation);
                Point corner = new(center.GetX() - width / 2, center.GetY() - height / 2);
                Point actualBottomLeft = GetRotatedCornerCoords(center, corner, child.attrs.rotation);
                left = (float)actualBottomLeft.GetX();
                bottom = (float)actualBottomLeft.GetY();
                Console.WriteLine($"left rot: {left}, bottom rot: {bottom}");
                image.SetRotationAngle(-child.attrs.rotation * (Math.PI / 180));
            }
            else
            {
                Console.WriteLine($"bottom left: {left}, {bottom}");
                Console.WriteLine($"upper right: {child.attrs.x + x}, {stageHeight - (child.attrs.y + y)}");
            }
            image.SetFixedPosition(left, bottom);
            if (child.attrs.strokeWidth != 0)
            {
                DeviceRgb color = HexToColor(child.attrs.stroke);
                if (child.attrs.rotation != 0)
                {
                    AffineTransform transform = AffineTransform.GetRotateInstance(child.attrs.rotation * (Math.PI / 180));
                    _canvas.ConcatMatrix(transform);
                }
                _canvas.Rectangle(left, bottom, width, height);
                _canvas.SetStrokeColor(color);
                _canvas.SetLineWidth((float)child.attrs.strokeWidth);
                _canvas.Stroke();
                _canvas.SetStrokeColor(ColorConstants.BLACK);
                _canvas.SetLineWidth(1);
            }

            _document.Add(image);
        }

        private float[] GetNodeWidthHeight(Child child)
        {
            float width = (float)child.attrs.width;
            float height = (float)child.attrs.height;

            if (child.attrs.scaleX != 0)
            {
                width *= (float)child.attrs.scaleX;
            }
            if (child.attrs.scaleY != 0)
            {
                height *= (float)child.attrs.scaleY;
            }
            return [width, height];
        }

        private static Point GetCenterOfRotatedObjectFromLeftBottom(double width, double height, double rotatedX, double rotatedY, double degrees)
        {
            double rotationAngleRadians = DegreesToRadians(degrees);

            // Calculate the center of the rotated node
            double centerX = rotatedX + (width / 2) * Math.Cos(rotationAngleRadians) - (height / 2) * Math.Sin(rotationAngleRadians);
            double centerY = rotatedY + height - (width / 2) * Math.Sin(rotationAngleRadians) - (height / 2) * Math.Cos(rotationAngleRadians);

            return new Point(centerX, centerY);
        }

        private static double DegreesToRadians(double degrees)
        {
            return degrees * (Math.PI / 180);
        }

        private static Point GetRotatedCornerCoords(Point center, Point point, double rotationAngle)
        {
            double angleRadians = -rotationAngle * (Math.PI / 180);
            Point p = new(point.GetX() - center.GetX(), point.GetY() - center.GetY());
            double xNew = p.GetX() * Math.Cos(angleRadians) - p.GetY() * Math.Sin(angleRadians);
            double yNew = p.GetX() * Math.Sin(angleRadians) + p.GetY() * Math.Cos(angleRadians);
            p.SetLocation(xNew + center.GetX(), yNew + center.GetY());
            return p;
        }

        private void AddText(Child child, float x, float y, byte[] fontBytes)
        {
            FontProgram fontProgram = FontProgramFactory.CreateFont(fontBytes);
            PdfFont font = PdfFontFactory.CreateFont(fontProgram);
            TextAlignment align = HandleAlignment(child.attrs.align);
            Paragraph paragraph = new Paragraph(child.attrs.text)
                .SetFont(font)
                .SetFontSize(child.attrs.fontSize)
                .SetWidth((float)child.attrs.width);

            HandleTextStyle(paragraph, child.attrs.textDecoration, child.attrs.fontStyle, child.attrs.opacity);
            IRenderer renderer = paragraph.CreateRendererSubTree();
            LayoutResult result = renderer.SetParent(_document.GetRenderer()).Layout(new LayoutContext(new LayoutArea(1, new Rectangle(1000, 1000))));
            float textHeight = result.GetOccupiedArea().GetBBox().GetHeight();
            float textWidth = ((ParagraphRenderer)renderer).GetMinMaxWidth().GetMaxWidth();

            if (align == TextAlignment.RIGHT)
            {
                // x minus 10 to account for padding
                paragraph.SetFixedPosition(x - 10, y - textHeight, (float)child.attrs.width);
            }
            else if (align == TextAlignment.LEFT)
            {
                // x plus 10 to account for padding
                paragraph.SetFixedPosition(x + 10, y - textHeight, (float)child.attrs.width);
            }
            else
            {
                paragraph.SetFixedPosition(x, y - textHeight, (float)child.attrs.width);
            }
            paragraph.SetTextAlignment(align);
            SetTextColor(paragraph, child.attrs.fill);
            _document.Add(paragraph);
        }

        private static TextAlignment HandleAlignment(string align)
        {
            var alignment = align switch
            {
                "center" => TextAlignment.CENTER,
                "right" => TextAlignment.RIGHT,
                "left" => TextAlignment.LEFT,
                _ => TextAlignment.LEFT,
            };
            return alignment;
        }

        private static void SetTextColor(Paragraph paragraph, string? hex)
        {
            if (hex != null)
            {
                if (hex.StartsWith("#"))
                {
                    DeviceRgb color = HexToColor(hex);
                    paragraph.SetFontColor(color);
                }
            }
            else
            {
                paragraph.SetFontColor(new DeviceRgb(0, 0, 0));
            }
        }

        private static void HandleTextStyle(Paragraph paragraph, string? decoration, string? style, double? opacity)
        {
            if (decoration != null)
            {
                if (decoration.Contains("underline"))
                {
                    paragraph.SetUnderline();
                }
            }
            if (opacity != null)
            {
                paragraph.SetOpacity((float)opacity);
            }
        }

        private Rectangle AddPath(string[] commands, Child child, float x, float y, float stageHeight)
        {
            _canvas.SetLineWidth(0.5f);
            float prevX = 0.0F;
            float prevY = 0.0F;
            float minX = float.MaxValue;
            float minY = float.MaxValue;
            float maxX = float.MinValue;
            float maxY = float.MinValue;
            for (int i = 0; i < commands.Length; i++)
            {
                string command = commands[i];
                char firstChar = command[0];
                firstChar = char.ToUpper(firstChar);
                float[] coords = null;

                if (char.ToUpper(firstChar) != 'Z')
                {
                    coords = TransformCoords(command, (float)child.attrs.x + x, (float)child.attrs.y + y + 10, stageHeight, child);
                    DrawPathFromCommands(command, coords, prevX, prevY, ref minX, ref maxX, ref minY, ref maxY);
                    if (firstChar == 'M' || firstChar == 'L')
                    {
                        prevX = coords[0];
                        prevY = coords[1];
                    }
                    else if (firstChar == 'C')
                    {
                        prevX = coords[4];
                        prevY = coords[5];
                    }
                    else if (firstChar == 'S')
                    {
                        if (coords.Length == 4)
                        {
                            prevX = coords[2];
                            prevY = coords[3];
                        }
                        else
                        {
                            prevX = coords[4];
                            prevY = coords[5];
                        }
                    }
                    else if (firstChar == 'H')
                    {
                        prevX = coords[0];
                    }
                    else if (firstChar == 'V')
                    {
                        prevY = coords[0];
                    }
                }
            }
            float width = maxX - minX;
            float height = maxY - minY;
            _canvas.ClosePath();
            return new Rectangle(minX, minY, width, height).SetBbox(minX, minY, maxX, maxY);
        }

        private float[] TransformCoords(string command, float x, float y, float stageHeight, Child child)
        {
            string stringCoords = command.Substring(1, command.Length - 1);
            float[] coords = null;
            if (stringCoords.Contains(','))
            {
                coords = Array.ConvertAll(stringCoords.Split(','), float.Parse);
            }
            else if (stringCoords.Contains(' '))
            {
                coords = Array.ConvertAll(stringCoords.Split(' '), float.Parse);
            }
            else
            {
                coords = [float.Parse(stringCoords)];
            }
            if (coords.Length > 1)
            {
                return TransformCoords(coords, child, x, y, stageHeight);
            }
            if (command.StartsWith('H') || command.StartsWith('h'))
            {
                if (child.attrs.scaleX == 0.0)
                {
                    coords[0] = coords[0] + x;
                }
                else
                {
                    coords[0] = coords[0] * (float)child.attrs.scaleX + x;
                }
                return coords;
            }
            if (command.StartsWith('V') || command.StartsWith('v'))
            {
                if (child.attrs.scaleY == 0.0)
                {
                    coords[0] = stageHeight - (coords[0] + y);
                }
                else
                {
                    coords[0] = stageHeight - (coords[0] * (float)child.attrs.scaleY + y);
                }
            }
            return coords;
        }

        private float[] TransformCoords(float[] coords, Child child, float x, float y, float stageHeight)
        {
            for (int i = 0; i < coords.Length; i++)
            {
                if (i % 2 == 0)
                {
                    if (child.attrs.scaleX == 0.0)
                    {
                        coords[i] = coords[i] + x;
                    }
                    else
                    {
                        coords[i] = coords[i] * (float)child.attrs.scaleX + x;
                    }

                }
                else
                {
                    if (child.attrs.scaleY == 0.0)
                    {
                        coords[i] = stageHeight - (coords[i] + y);
                    }
                    else
                    {
                        coords[i] = stageHeight - (coords[i] * (float)child.attrs.scaleY + y);
                    }
                }
            }
            return coords;
        }

        static void UpdateBoundingBox(float x, float y, ref float minX, ref float maxX, ref float minY, ref float maxY)
        {
            minX = Math.Min(minX, x);
            minY = Math.Min(minY, y);
            maxX = Math.Max(maxX, x);
            maxY = Math.Max(maxY, y);
        }

        private void DrawPathFromCommands(string command, float[] coords, float prevX, float prevY, ref float minX, ref float maxX, ref float minY, ref float maxY)
        {

            char firstChar = char.ToUpper(command[0]);
            if (firstChar == 'M')
            {
                _canvas.MoveTo(coords[0], coords[1]);
                UpdateBoundingBox(coords[0], coords[1], ref minX, ref maxX, ref minY, ref maxY);
            }
            else if (firstChar == 'L')
            {
                _canvas.LineTo(coords[0], coords[1]);
                UpdateBoundingBox(coords[0], coords[1], ref minX, ref maxX, ref minY, ref maxY);
            }
            else if (firstChar == 'C' || firstChar == 'S')
            {
                if (coords.Length == 6)
                {
                    _canvas.CurveTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
                    UpdateBoundingBox(coords[0], coords[1], ref minX, ref maxX, ref minY, ref maxY);
                    UpdateBoundingBox(coords[2], coords[3], ref minX, ref maxX, ref minY, ref maxY);
                    UpdateBoundingBox(coords[4], coords[5], ref minX, ref maxX, ref minY, ref maxY);
                }
                else
                {
                    for (int i = 0; i < coords.Length - 3; i += 4)
                    {
                        _canvas.CurveTo(coords[i], coords[i + 1], coords[i + 2], coords[i + 3]);
                        UpdateBoundingBox(coords[i], coords[i + 1], ref minX, ref maxX, ref minY, ref maxY);
                        UpdateBoundingBox(coords[i + 2], coords[i + 3], ref minX, ref maxX, ref minY, ref maxY);
                    }
                }

            }
            else if (firstChar == 'H')
            {
                _canvas.LineTo(coords[0], prevY);
                UpdateBoundingBox(coords[0], prevY, ref minX, ref maxX, ref minY, ref maxY);
            }
            else if (firstChar == 'V')
            {
                _canvas.LineTo(prevX, coords[0]);
                UpdateBoundingBox(prevX, coords[0], ref minX, ref maxX, ref minY, ref maxY);
            }
            else if (firstChar == 'Z')
            {
                _canvas.ClosePath();
            }
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
