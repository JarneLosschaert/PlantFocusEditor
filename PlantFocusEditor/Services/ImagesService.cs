namespace PlantFocusEditor.Services
{
    public class ImagesService
    {
        private readonly Dictionary<string, string> _images = [];

        public void AddImage(string id, string source)
        {
            _images.Add(id, source);
        }

        public Dictionary<string, string> GetImages()
        {
            return _images;
        }

        public string GetImageById(string id)
        {
            if (_images.TryGetValue(id, out string? value))
            {
                return value;
            }
            return "";
        }
    }
}
