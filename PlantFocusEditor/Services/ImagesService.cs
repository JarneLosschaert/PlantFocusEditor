namespace PlantFocusEditor.Services
{
    public class ImagesService
    {
        private readonly List<string> _images = [];
        public List<string> GetImages()
        {
            return _images;
        }

        public void AddImage(string source)
        {
            _images.Insert(0, source);
        }
    }
}
