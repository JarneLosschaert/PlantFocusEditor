using iText.IO.Font;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Colors.Gradients;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Layout;
using iText.Layout.Properties;
using iText.Layout.Renderer;
using Library.Classes;
using Microsoft.JSInterop;
using PlantFocusEditor.Helpers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Image = iText.Layout.Element.Image;
using Text = iText.Layout.Element.Text;

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
        private readonly ApiConnectorService _apiService;
        private readonly FontManager _fontManager;

        public PDFConversionService(IJSRuntime runtime, ApiConnectorService service)
        {
            _runtime = runtime;
            _apiService = service;
            _fontManager = new(_runtime);
        }

        public async Task<byte[]> SaveToPdf(string jsonStringFront, string jsonStringBack, float[] dimensions, float[] dimensionsMillimeters)
        {
            RootObject front = UnitConverter.ConvertJsonPixelsToMillimeters(ConvertFromJson(jsonStringFront), dimensions, dimensionsMillimeters);
            RootObject back = UnitConverter.ConvertJsonPixelsToMillimeters(ConvertFromJson(jsonStringBack), dimensions, dimensionsMillimeters);
            double width = UnitConverter.ConvertMillimetersToPoints(dimensionsMillimeters[0]);
            double height = UnitConverter.ConvertMillimetersToPoints(dimensionsMillimeters[1]);
            byte[] firstPage = await AddPage(front, width, height);
            byte[] secondPage = await AddPage(back, width, height);
            using MemoryStream ms = new();
            using PdfDocument pdf = new(new PdfWriter(ms).SetSmartMode(true));

            using (MemoryStream memoryStream = new(firstPage))
            {
                using PdfReader reader = new(memoryStream);
                PdfDocument srcDoc = new(reader);
                srcDoc.CopyPagesTo(1, srcDoc.GetNumberOfPages(), pdf);
            }
            using (MemoryStream memoryStream = new(secondPage))
            {
                using PdfReader reader = new(memoryStream);
                PdfDocument srcDoc = new(reader);
                srcDoc.CopyPagesTo(1, srcDoc.GetNumberOfPages(), pdf);
            }
            pdf.Close();
            _fontManager.Clear();
            return ms.ToArray();
        }

        private async Task<byte[]> AddPage(RootObject root, double width, double height)
        {
            _memoryStream = new MemoryStream();
            _writer = new PdfWriter(_memoryStream);
            _pdf = new PdfDocument(_writer);
            _document = new Document(_pdf);
            _canvas = new PdfCanvas(_pdf.AddNewPage(new PageSize((float)width, (float)height)));
            foreach (Child child in root.children)
            {
                await AddNode(child, 0, 0, (float)height, 1, 1);
            }
            _fontManager.Clear();
            return GetPdfBytes();
        }

        private async Task AddNode(Child child, float x, float y, float pageHeight, double scaleX = 1, double scaleY = 1)
        {
            if (scaleX > 0)
            {
                child.attrs.width = child.attrs.width * scaleX;
                child.attrs.x = child.attrs.x * scaleX;
            }
            if (scaleY > 0)
            {
                child.attrs.height = child.attrs.height * scaleY;
                child.attrs.y = child.attrs.y * scaleY;
            }
            if (child.attrs.name == "passepartout")
            {
                string[] commands = PathUtils.ParsePathData(child.attrs.data);
                AddPath(commands, child, x, y, pageHeight);
                _canvas.Clip();
                _canvas.Stroke();
            }
            else if (child.className == "Text")
            {
                Text text = new Text(child.attrs.text);
                if (scaleX > 0 || scaleY > 0)
                {
                    double scale = Math.Min(scaleX, scaleY);
                    if (child.attrs.fontSizeDouble != 0)
                    {
                        child.attrs.fontSizeDouble = child.attrs.fontSizeDouble * scale;
                    }
                    else
                    {
                        child.attrs.fontSizeDouble = child.attrs.fontSize * scale;
                    }
                }
                if (scaleX > scaleY)
                {
                    text.SetHorizontalScaling((float)(scaleX / scaleY));
                }
                string fontName = FontManager.GetFont(child.attrs.fontFamily, child.attrs.fontStyle);
                PdfFont? font = _fontManager.GetPdfFont(fontName);
                if (font != null)
                {
                    AddText(child, x, y, font, pageHeight, text);
                }
                else
                {
                    byte[] fontBytes = await _fontManager.GetFontBytes(fontName);
                    font = _fontManager.SaveFont(fontName, fontBytes);
                    AddText(child, x, y, font, pageHeight, text);
                }                
            }
            else if (child.className == "Path")
            {
                await AddImage(child, x, y, pageHeight);
            }
            else if (child.className == "Image")
            {
                await AddImage(child, x, y, pageHeight);
            }
            else if (child.className == "Rect")
            {
                if (child.attrs.strokeWidth > 0)
                {
                    AddRectangle(child, x, y, pageHeight);
                }
            }
            else if (child.className == "Line")
            {
                AddLine(child, x, y, pageHeight, scaleX, scaleY);
            }
            else if (child.className == "Group")
            {
                if (child.attrs.scaleX > 0)
                {
                    scaleX = child.attrs.scaleX * scaleX;
                }
                if (child.attrs.scaleY > 0)
                {
                    scaleY = child.attrs.scaleY * scaleY;
                }
                foreach (Child childNode in child.children)
                {
                    await AddNode(childNode, (float)child.attrs.x + x, (float)child.attrs.y + y, pageHeight, scaleX, scaleY);
                }
            }
        }                

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

        private void AddRectangle(Child child, float x, float y, float pageHeight)
        {
            float[] widthHeight = GetNodeWidthHeight(child);
            float width, height;
            (width, height) = (widthHeight[0], widthHeight[1]);
            float left = (float)child.attrs.x + x;
            float bottom = pageHeight - ((float)child.attrs.y + y + height);
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

        private void AddLine(Child child, float x, float y, float pageHeight, double scaleX, double scaleY)
        {
            float width = (float)child.attrs.strokeWidth;
            Color stroke = ColorConstants.BLACK;
            if (child.attrs.stroke.Contains('#'))
            {
                stroke = HexToColor(child.attrs.stroke);
            }
            DrawLine(child.attrs.points, x, y, pageHeight, (float)scaleX, (float)scaleY, width, stroke);
        }

        private void DrawLine(double[] points, float x, float y, float pageHeight, float scaleX, float scaleY, float width, Color strokeColor)
        {
            _canvas.SetLineWidth(width);
            _canvas.SetStrokeColor(strokeColor);
            _canvas.MoveTo(points[0] * scaleX + x, pageHeight - (points[1] * scaleY + y));
            _canvas.LineTo(points[2] * scaleX + x, pageHeight - (points[3] * scaleY + y));
            _canvas.Stroke();
        }

        private async Task AddImage(Child child, float x, float y, float pageHeight)
        {
            ImageData imgData;
            if (child.attrs.src.Contains("http"))
            {
                imgData = await GetImageDataByUrl(child.attrs.src);
            }
            else
            {
                string base64 = child.attrs.src.Substring(child.attrs.src.IndexOf(",") + 1);
                byte[] data = Convert.FromBase64String(base64);
                imgData = ImageDataFactory.Create(data);
            }
            if (imgData == null)
            {
                Console.WriteLine("image data is null");
                return;
            }
            Image image = new(imgData);

            float[] dimensions = GetNodeWidthHeight(child);
            float width = dimensions[0];
            float height = dimensions[1];
            float left;
            float bottom;
            double rotationAngle = child.attrs.rotation;
            if (child.className == "Path")
            {
                left = (float)child.attrs.posX + x;
                bottom = pageHeight - (float)(child.attrs.posY + height + y);
                image.SetWidth(width).SetHeight(height);
                if (child.attrs.strokeWidth > 0)
                {
                    if (child.attrs.scaleX > 0)
                    {
                        float stroke = (float)(child.attrs.strokeWidth * child.attrs.scaleX);
                        width += stroke * 2;
                    }
                    else
                    {
                        width += (float)child.attrs.strokeWidth * 2;
                    }
                    if (child.attrs.scaleY > 0)
                    {
                        float stroke = (float)(child.attrs.strokeWidth * child.attrs.scaleY);
                        bottom -= stroke * 2;
                        height += stroke * 2;
                    }
                    else
                    {
                        bottom -= (float)child.attrs.strokeWidth * 2;
                        height += (float)child.attrs.strokeWidth * 2;
                    }
                }
            }
            else
            {
                left = (float)child.attrs.x + x;
                bottom = pageHeight - (float)(child.attrs.y + height + y);
                if (rotationAngle == 0)
                {
                    image.SetObjectFit(ObjectFit.COVER);
                }
            }
            image.SetWidth(width).SetHeight(height);

            if (child.attrs.opacity != null)
            {
                image.SetOpacity((float)child.attrs.opacity);
            }

            if (rotationAngle != 0)
            {
                Point center = GetCenterOfRotatedObjectFromLeftBottom(width, height, left, bottom, child.attrs.rotation);
                Point originalLeftBottom = new(center.GetX() - width / 2, center.GetY() - height / 2);
                Point originalLeftTop = new(originalLeftBottom.GetX(), originalLeftBottom.GetY() + height);
                Point originalRightBottom = new(originalLeftBottom.GetX() + width, originalLeftBottom.GetY());
                Point originalRightTop = new(originalLeftBottom.GetX() + width, originalLeftBottom.GetY() + height);

                Point rotatedLeftBottom = RotatePoint(center, originalLeftBottom, rotationAngle);
                Point rotatedLeftTop = RotatePoint(center, originalLeftTop, rotationAngle);
                Point rotatedRightBottom = RotatePoint(center, originalRightBottom, rotationAngle);
                Point rotatedRightTop = RotatePoint(center, originalRightTop, rotationAngle);

                Rectangle bbox = CalculateBoundingBox(rotatedLeftBottom, rotatedLeftTop, rotatedRightBottom, rotatedRightTop);
                if (child.className == "Path")
                {
                    //left = (float)bbox.GetX();
                    bottom = (float)originalLeftBottom.GetY();
                    image.SetWidth(bbox.GetWidth()).SetHeight(bbox.GetHeight());
                }
                else
                {
                    left = (float)bbox.GetX();
                    bottom = (float)rotatedLeftBottom.GetY();
                    image.SetRotationAngle(DegreesToRadians(-rotationAngle));
                }
            }
            image.SetFixedPosition(left, bottom);
            if (child.className != "Path" && child.attrs.strokeWidth > 0)
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

        private static Rectangle CalculateBoundingBox(Point leftBottom, Point leftUpper, Point rightBottom, Point rightUpper)
        {
            double minX = Math.Min(leftBottom.GetX(), Math.Min(leftUpper.GetX(), Math.Min(rightBottom.GetX(), rightUpper.GetX())));
            double minY = Math.Min(leftBottom.GetY(), Math.Min(leftUpper.GetY(), Math.Min(rightBottom.GetY(), rightUpper.GetY())));

            double maxX = Math.Max(leftBottom.GetX(), Math.Max(leftUpper.GetX(), Math.Max(rightBottom.GetX(), rightUpper.GetX())));
            double maxY = Math.Max(leftBottom.GetY(), Math.Max(leftUpper.GetY(), Math.Max(rightBottom.GetY(), rightUpper.GetY())));

            double width = maxX - minX;
            double height = maxY - minY;

            return new Rectangle((float)minX, (float)minY, (float)width, (float)height);
        }

        private Point RotatePoint(Point center, Point point, double rotation)
        {
            Point rotatedPoint = GetRotatedCornerCoords(center, point, rotation);
            return new Point(rotatedPoint.GetX(), rotatedPoint.GetY());
        }

        private async Task<ImageData?> GetImageDataByUrl(string url)
        {
            Stream stream = await _apiService.GetImageAsync(url);
            using (var memoryStream = new MemoryStream())
            {
                await stream.CopyToAsync(memoryStream);
                byte[] data = memoryStream.ToArray();
                return ImageDataFactory.Create(data);
            }
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

        private void AddText(Child child, float x, float y, PdfFont font, float pageHeight, Text text)
        {
            Console.WriteLine(child.attrs.fontSizeDouble);
            Paragraph paragraph = new Paragraph(text)
                .SetFont(font)
                .SetFontSize((float)child.attrs.fontSizeDouble)
                .SetWidth((float)child.attrs.width)
                .SetMargin(0)
                .SetPadding(0)
                .SetVerticalAlignment(VerticalAlignment.TOP);
            paragraph.SetProperty(Property.OVERFLOW_X, OverflowPropertyValue.VISIBLE);
            paragraph.SetProperty(Property.OVERFLOW_Y, OverflowPropertyValue.VISIBLE);
            HandleTextStyle(paragraph, child.attrs.textDecoration, child.attrs.opacity);

            float left = (float)(child.attrs.x + x);
            float bottom;
            if (child.attrs.height > 0)
            {
                paragraph.SetHeight((float)child.attrs.height);
                bottom = (float)(pageHeight - (child.attrs.y + y + child.attrs.height));
            }
            else
            {
                float textHeight = GetTextHeight(paragraph, pageHeight);
                bottom = (float)(pageHeight - (child.attrs.y + y + textHeight));
            }

            TextAlignment align = HandleAlignment(child.attrs.align);

            SetTextPosition(child, paragraph, align, left, bottom);
            paragraph.SetTextAlignment(align);

            SetTextColor(paragraph, child.attrs.fill);

            _document.Add(paragraph);
        }

        private float GetTextHeight(Paragraph paragraph, float stageHeight)
        {
            IRenderer renderer = paragraph.CreateRendererSubTree();
            LayoutResult result = renderer.SetParent(_document
            .GetRenderer())
                .Layout(new LayoutContext(new LayoutArea(1, new Rectangle(1000, stageHeight))));
            return result.GetOccupiedArea().GetBBox().GetHeight();
        }

        private static void SetTextPosition(Child child, Paragraph paragraph, TextAlignment align, float left, float bottom)
        {
            float padding = (float)child.attrs.padding;
            if (padding > 0)
            {
                if (align == TextAlignment.RIGHT)
                {
                    paragraph.SetFixedPosition(left - padding, bottom, (float)child.attrs.width);
                }
                else if (align == TextAlignment.LEFT)
                {
                    paragraph.SetFixedPosition(left + padding, bottom, (float)child.attrs.width);
                }
                else
                {
                    paragraph.SetFixedPosition(left, bottom, (float)child.attrs.width);
                }
            }
            else
            {
                paragraph.SetFixedPosition(left, bottom, (float)child.attrs.width);
            }
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

        private static void HandleTextStyle(Paragraph paragraph, string? decoration, double? opacity)
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
            _canvas.SetLineWidth(0.01f);
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
                float[] coords;

                if (char.ToUpper(firstChar) != 'Z')
                {
                    coords = GetCoordsFromCommand(command);
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

        private static float[] GetCoordsFromCommand(string command)
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
            return coords;
        }

        private static float[] TransformCoords(string command, float x, float y, float widthPixels, float heightPixels, float widthMillimeters, float heightMillimeters, Child child)
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
                return TransformCoords(coords, child, x, y, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
            }
            if (command.StartsWith('H') || command.StartsWith('h'))
            {
                if (child.attrs.scaleX == 0.0)
                {
                    coords[0] = (coords[0] / widthPixels) * widthMillimeters + x;
                    coords[0] = (coords[0] / widthPixels) * widthMillimeters;
                }
                else
                {
                    coords[0] = ((coords[0] * (float)child.attrs.scaleX) / widthPixels) * widthMillimeters + x;
                }
                return coords;
            }
            if (command.StartsWith('V') || command.StartsWith('v'))
            {
                if (child.attrs.scaleY == 0.0)
                {
                    coords[0] = heightMillimeters - ((coords[0] / heightPixels) * heightMillimeters + y);
                }
                else
                {
                    coords[0] = heightMillimeters - (((coords[0] * (float)child.attrs.scaleY) / heightPixels) * heightMillimeters + y);
                }
            }
            return coords;
        }

        private static float[] TransformCoords(float[] coords, Child child, float x, float y, float widthPixels, float heightPixels, float widthMillimeters, float heightMillimeters)
        {
            for (int i = 0; i < coords.Length; i++)
            {
                if (i % 2 == 0)
                {
                    if (child.attrs.scaleX == 0.0)
                    {
                        coords[i] = (coords[i] / widthPixels) * widthMillimeters + x;
                    }
                    else
                    {
                        coords[i] = (coords[i] * (float)child.attrs.scaleX) / widthPixels * widthMillimeters + x;
                    }

                }
                else
                {
                    if (child.attrs.scaleY == 0.0)
                    {
                        coords[i] = heightMillimeters - (coords[i] / heightPixels * heightMillimeters + y);
                    }
                    else
                    {
                        coords[i] = heightMillimeters - ((coords[i] * (float)child.attrs.scaleY) / heightPixels * heightMillimeters + y);
                    }
                }
            }
            return coords;
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
