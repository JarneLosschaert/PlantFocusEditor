using Library.Helpers;

namespace Library.Data.DTO
{
    public record TemplateDto
    {
        public string Name { get; set; }
        public DesignType DesignType { get; set; }
        public LabelType Label { get; set; }
        public double WidthMillimeters { get; set; }
        public double HeightMillimeters { get; set; }
        public string JsonToRender { get; set; }

        public TemplateDto(string name, DesignType designType, LabelType label, double widthMillimeters, double heightMillimeters, string jsonToRender)
        {
            Name = name;
            DesignType = designType;
            Label = label;
            WidthMillimeters = widthMillimeters;
            HeightMillimeters = heightMillimeters;
            JsonToRender = jsonToRender;
        }
    }

}
