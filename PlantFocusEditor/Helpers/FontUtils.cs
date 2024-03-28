using iText.IO.Font;
using iText.Kernel.Font;
using Library.Classes;

namespace PlantFocusEditor.Helpers
{
    public class FontUtils
    {
        public static string GetFontFileName(string? fontFamily, string? fontStyle)
        {
            string font;
            if (fontFamily != null)
            {
                if (fontStyle != null)
                {
                    bool isBold = fontStyle.Contains("bold");
                    bool isItalic = fontStyle.Contains("italic");
                    font = CreateFont(fontFamily, isBold, isItalic);
                }
                else
                {
                    font = CreateFont(fontFamily, false, false);
                }
            }
            else if (fontStyle != null)
            {
                bool isBold = fontStyle.Contains("bold");
                bool isItalic = fontStyle.Contains("italic");
                font = CreateFont("Arial", isBold, isItalic);
            }
            else
            {
                font = CreateFont("Arial", false, false);
            }
            return font;
        }

        private static string CreateFont(string fontName, bool isBold, bool isItalic)
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
    }
}
