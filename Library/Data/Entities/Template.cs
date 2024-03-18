using Library.Helpers;

namespace Library.Data.Entities
{
    public class Template
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public DesignType DesignType { get; set; }
        public LabelType Label { get; set; }
        public double WidthMillimeters { get; set; }
        public double HeightMillimeters { get; set; }
        public string JsonToRender { get; set; }
    }
}
