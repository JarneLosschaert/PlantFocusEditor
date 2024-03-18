using AutoMapper;
using Library.Data.DTO;
using Library.Data.Entities;

namespace API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile() 
        {
            CreateMap<TemplateDto, Template>();
        }
    }
}
