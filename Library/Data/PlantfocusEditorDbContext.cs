using Library.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Library.Data
{
    public class PlantfocusEditorDbContext : DbContext
    {
        public PlantfocusEditorDbContext(DbContextOptions<PlantfocusEditorDbContext> options) : base(options)
        {

        }

        public DbSet<Template> Templates { get; set; }
    }
}


