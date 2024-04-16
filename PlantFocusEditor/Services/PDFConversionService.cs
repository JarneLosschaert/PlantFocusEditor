﻿using iText.Kernel.Pdf;
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
using iText.Svg.Processors;
using iText.Svg.Processors.Impl;
using iText.Svg.Converter;
using Path = iText.Kernel.Geom.Path;
using iText.Kernel.Pdf.Colorspace;
using iText.Kernel.Pdf.Function;
using iText.Kernel.Colors.Gradients;
using Org.BouncyCastle.Asn1.Ocsp;
using iText.Kernel.Pdf.Xobject;
using System.Xml;

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
            float x = (float) root.attrs.x;
            float y = (float) root.attrs.y;
            foreach (Child child in root.children)
            {                
                if (child.attrs.name == "passepartout")
                {
                    string[] commands = PathUtils.ParsePathData(child.attrs.data);
                    AddPath(commands, child, x, y, dimensions[1]);
                    _canvas.Stroke();
                }
                else if (child.className == "Text")
                {
                    AddText(child, (float) child.attrs.x, dimensions[1] - ((float) child.attrs.y + y));
                }
                else if (child.className == "Path")
                {                                       
                    string[] commands = PathUtils.ParsePathData(child.attrs.data);
                    Rectangle bbox = AddPath(commands, child, x, y, dimensions[1]);                    
                    if (child.attrs.fillLinearGradientColorStops.Count() >= 2)
                    {
                        SetCanvasLinearGradient(child, bbox);
                    }
                    _canvas.FillStroke();
                }
                else if (child.className == "Image")
                {
                    AddImage(child);
                }
            }
            return GetPdfBytes();
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
            List<string> colors = [];
            foreach (object el in child.attrs.fillLinearGradientColorStops)
            {
                if (el.ToString().StartsWith('#'))
                {
                    colors.Add(el.ToString());
                } else
                {
                    relativePoints.Add(el.ToString());
                }
            }
            AbstractLinearGradientBuilder gradientBuilder = new StrategyBasedLinearGradientBuilder();
            foreach (string color in colors)
            {
                Color Rgb = HexToColor(color);
                gradientBuilder.AddColorStop(new GradientColorStop(Rgb.GetColorValue()));
            }
            Color gradient = gradientBuilder.BuildColor(bbox, null, _pdf);
            _canvas.SetFillColor(gradient);
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

        private void AddText(Child child, float x, float y)
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
            Console.WriteLine(textWidth);

            text.SetFixedPosition(x, y - textHeight, textWidth);

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

        private Rectangle AddPath(string[] commands, Child child, float x, float y, float stageHeight)
        {
            _canvas.SetLineWidth(1f);
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
                    coords = TransformCoords(command, (float) child.attrs.x + x, (float) child.attrs.y + y + 10, stageHeight, child);
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
            Console.WriteLine($"width: {width}");
            Console.WriteLine($"height: {height}");
            Console.WriteLine(minX);
            Console.WriteLine(minY);
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
            else if (firstChar == 'C')
            {
                _canvas.CurveTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
                UpdateBoundingBox(coords[0], coords[1], ref minX, ref maxX, ref minY, ref maxY);
                UpdateBoundingBox(coords[2], coords[3], ref minX, ref maxX, ref minY, ref maxY);
                UpdateBoundingBox(coords[4], coords[5], ref minX, ref maxX, ref minY, ref maxY);
            }
            else if (firstChar == 'S')
            {                
                _canvas.CurveFromTo(coords[0], coords[1], coords[2], coords[3]);
                UpdateBoundingBox(coords[0], coords[1], ref minX, ref maxX, ref minY, ref maxY);
                UpdateBoundingBox(coords[2], coords[3], ref minX, ref maxX, ref minY, ref maxY);
                if (coords.Length == 8)
                {
                    _canvas.CurveFromTo(coords[2], coords[3], coords[4], coords[5]);
                    _canvas.CurveFromTo(coords[4], coords[5], coords[6], coords[7]);
                    UpdateBoundingBox(coords[4], coords[5], ref minX, ref maxX, ref minY, ref maxY);
                    UpdateBoundingBox(coords[6], coords[7], ref minX, ref maxX, ref minY, ref maxY);
                }
            }
            else if (firstChar == 'H')
            {
                Console.WriteLine($"H x: {coords[0]}, y: {prevY}");
                _canvas.LineTo(coords[0], prevY);
                UpdateBoundingBox(coords[0], prevY, ref minX, ref maxX, ref minY, ref maxY);
            }
            else if (firstChar == 'V')
            {
                Console.WriteLine($"V x: {prevX}, y: {coords[0]}");
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
