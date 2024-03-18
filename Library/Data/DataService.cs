using Library.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Library.Data
{
    public class DataService
    {
        private IDbContextFactory<PlantfocusEditorDbContext> _dbContextFactory;

        public DataService(IDbContextFactory<PlantfocusEditorDbContext> contextFactory)
        {
            _dbContextFactory = contextFactory;
        }

        public async Task<List<Template>> GetAllTemplates()
        {
            using (var context = await _dbContextFactory.CreateDbContextAsync())
            {
                return await context.Templates.ToListAsync(); 
            }
        }

        public async Task<Template?> GetTemplate(int id)
        {
            using (PlantfocusEditorDbContext context = await _dbContextFactory.CreateDbContextAsync())
            {
                return await context.Templates.FindAsync(id);
            }
        }

        public async Task<List<Template>> FilterTemplatesByDesignAndLabelType(string? designType, string? labelType)
        {
            using (PlantfocusEditorDbContext context = await _dbContextFactory.CreateDbContextAsync())
            {
                List<Template> allTemplates = context.Templates.ToList();
                List<Template> filteredTemplates = [];
                if (designType != null && labelType != null)
                {
                    allTemplates.ForEach(template =>
                    {
                        if (
                        string.Equals(template.DesignType.ToString(), designType, StringComparison.OrdinalIgnoreCase)
                        && string.Equals(template.Label.ToString(), labelType, StringComparison.OrdinalIgnoreCase))
                        {
                            filteredTemplates.Add(template);
                        }
                    });
                    return filteredTemplates;
                }
                if (designType != null)
                {
                    allTemplates.ForEach(template =>
                    {
                        if (string.Equals(template.DesignType.ToString(), designType, StringComparison.OrdinalIgnoreCase))
                        {
                            filteredTemplates.Add(template);
                        }
                    });
                    return filteredTemplates;
                }
                if (labelType != null)
                {
                    allTemplates.ForEach(template =>
                    {
                        if (string.Equals(template.Label.ToString(), labelType, StringComparison.OrdinalIgnoreCase))
                        {
                            filteredTemplates.Add(template);
                        }
                    });
                    return filteredTemplates;
                }
                return [];
            }
        }

        public async Task<Template> AddTemplate(Template template)
        {
            using (var context = await _dbContextFactory.CreateDbContextAsync())
            {
                await context.Templates.AddAsync(template);
                await context.SaveChangesAsync();
                return template;
            }
        }

        public async Task<Template?> ReplaceTemplate(int id, Template newTemplate)
        {
            using (var context = await _dbContextFactory.CreateDbContextAsync())
            {
                Template? old = context.Templates.Find(id);
                if (old != null)
                {
                    newTemplate.ID = old.ID;
                    context.Entry(old).CurrentValues.SetValues(newTemplate);
                    await context.SaveChangesAsync();
                    return newTemplate;
                }
                return null;
            }
        }

        public async Task<bool> RemoveTemplate(int id)
        {
            using (PlantfocusEditorDbContext context = await _dbContextFactory.CreateDbContextAsync())
            {
                Template? template = context.Templates.Find(id);
                if (template != null)
                {
                    context.Templates.Remove(template);
                    await context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task DeleteAllTemplates()
        {
            using (PlantfocusEditorDbContext context = await _dbContextFactory.CreateDbContextAsync())
            {
                context.Templates.RemoveRange(context.Templates.ToList());
                await context.SaveChangesAsync();
            }
        }
    }
}
