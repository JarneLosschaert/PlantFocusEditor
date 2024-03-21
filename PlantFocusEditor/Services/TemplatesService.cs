using Library.Data.Entities;

namespace PlantFocusEditor.Services
{
    public class TemplatesService
    {
        private List<Template> _templates = new();
        private Dictionary<int, string> _previews = new();

        public void SetTemplates(List<Template> templates)
        {
            this._templates = templates;
        }

        public void SetPreviews(Dictionary<int, string> previews)
        {
            this._previews = previews;
        }

        public List<Template> GetTemplates()
        {
            return this._templates;
        }

        public Dictionary<int, string> GetPreviews() {  return this._previews; }
    }
}
