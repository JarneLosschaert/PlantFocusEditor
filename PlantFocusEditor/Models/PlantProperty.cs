namespace PlantFocusEditor.Models
{
    public class PlantProperty
    {
        public string Name { get; set; } = "";
        public string Icon { get; set; } = "https://plantfocus.blob.core.windows.net/icons/toepassing.png";
        public List<Translation> Translations { get; set; } = new List<Translation>();
    }
}
