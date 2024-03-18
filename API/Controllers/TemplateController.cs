using Library.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;
using Library.Data.Entities;
using Library.Data.DTO;
using AutoMapper;

namespace API.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("[controller]")]
    //[RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]
    public class TemplateController : ControllerBase
    {
        private readonly DataService _dataService;
        private readonly IMapper _mapper;

        public TemplateController(DataService dataService, IMapper mapper)
        {
            _dataService = dataService;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("/templates")]
        public async Task<IActionResult> List(string? designType, string? labelType)
        {
            if (designType != null || labelType != null)
            {
                List<Template> templates = await _dataService.FilterTemplatesByDesignAndLabelType(designType, labelType);
                return Ok(templates);
            }
            var output = await _dataService.GetAllTemplates();
            return Ok(output);
        }

        [HttpGet]
        [Route("/templates/{id}")]
        public async Task<IActionResult> GetTemplate(int id)
        {
            Template? template = await _dataService.GetTemplate(id);
            if (template == null)
            {
                return NotFound();
            }
            return Ok(template);
        }

        [HttpPost]
        [Route("/templates")]
        public async Task<IActionResult> AddTemplate(TemplateDto templateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Template template = _mapper.Map<Template>(templateDto);
            var output = await _dataService.AddTemplate(template);
            return Created(string.Empty, output);
        }

        [HttpPut]
        [Route("/templates/{id}")]
        public async Task<IActionResult> ReplaceTemplate(int id, Template template)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Template? newTemplate = await _dataService.ReplaceTemplate(id, template);
            if (newTemplate == null)
            {
                return NotFound();
            }
            return Ok(newTemplate);
        }

        [HttpDelete]
        [Route("/templates/{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            bool result = await _dataService.RemoveTemplate(id);
            if (result)
            {
                return Ok();
            }
            return BadRequest();
        }

        [HttpDelete]
        [Route("/templates/all")]
        public async Task<IActionResult> DeleteAllTemplates()
        {
            await _dataService.DeleteAllTemplates();
            return Ok();
        }
    }
}
