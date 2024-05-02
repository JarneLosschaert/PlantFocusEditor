using iText.IO.Font;
using iText.Kernel.Font;
using Microsoft.JSInterop;

namespace PlantFocusEditor.Helpers
{
    public class FontManager(IJSRuntime js)
    {
        private readonly IJSRuntime _runtime = js;
        private readonly Dictionary<string, PdfFont> _fonts = [];

        public static string GetFont(string? fontFamily, string? fontStyle)
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
            return font;
        }

        public async Task<byte[]> GetFontBytes(string font)
        {
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

        public PdfFont SaveFont(string fontName, byte[] fontBytes)
        {
            FontProgram fontProgram = FontProgramFactory.CreateFont(fontBytes);
            PdfFont font = PdfFontFactory.CreateFont(fontProgram);
            _fonts.Add(fontName, font);
            return font;
        }

        public PdfFont? GetPdfFont(string fontName)
        {
            if (_fonts.TryGetValue(fontName, out PdfFont? value))
            {
                return value;
            }
            return null;
        }

        public void Clear()
        {
            _fonts.Clear();
        }
    }
}
