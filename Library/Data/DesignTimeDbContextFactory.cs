using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Library.Data
{
    internal class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<PlantfocusEditorDbContext>
    {
        public PlantfocusEditorDbContext CreateDbContext(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var builder = new DbContextOptionsBuilder<PlantfocusEditorDbContext>();
            var connectionString = configuration.GetConnectionString("stagingDatabaseConnection");
            builder.UseSqlServer(connectionString, options => options.CommandTimeout((int)TimeSpan.FromMinutes(10).TotalSeconds));
            return new PlantfocusEditorDbContext(builder.Options);
        }
    }
}
