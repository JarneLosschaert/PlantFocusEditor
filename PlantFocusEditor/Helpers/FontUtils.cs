using Microsoft.JSInterop;

namespace PlantFocusEditor.Helpers
{
    public class FontUtils
    {
        private readonly IJSRuntime _runtime;
        public FontUtils(IJSRuntime runtime) 
        {
            _runtime = runtime;            
        }


        public async Task<string> GetFontFileName(string? fontFamily, string? fontStyle)
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
            return await _runtime.InvokeAsync<string>("getFont", font);
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
