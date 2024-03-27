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
        private static PdfWriter _writer = new PdfWriter("./doc.pdf");
        private static PdfDocument _pdf = new PdfDocument(_writer);
        private static Document _document = new Document(_pdf);
        private PdfCanvas _canvas;

        public void SaveToPdf(string jsonString, float[] dimensions)
        {            
            RootObject root = ConvertFromJson(jsonString);
            _canvas = new PdfCanvas(_pdf.AddNewPage(new PageSize(dimensions[0], dimensions[1])));
            Console.WriteLine($"root class: {root.className}");
            double x = root.attrs.x;
            double y = root.attrs.y;
            foreach (Child child in root.children)
            {
                if (child.className == "Path")
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
        }

        private void AddPath(Child child, double x, double y)
        {

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
                .SetFontSize(child.attrs.fontSize);
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
    }
}
