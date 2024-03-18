using API.Mappings;
using AutoMapper;
using Library.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

string connectionString = "ConnectionStrings:stagingDatabaseConnection";

// Add services to the container.
builder.Services.AddDbContextFactory<PlantfocusEditorDbContext>(options =>
    options.UseSqlServer(builder.Configuration[connectionString]),
    ServiceLifetime.Transient);

builder.Services.AddTransient<DataService>();
builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AccessAsUserOrApp", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c =>
                (c.Type == "http://schemas.microsoft.com/identity/claims/scope"
    && c.Value.Contains("access_as_user")) ||
                (c.Type == "http://schemas.microsoft.com/identity/claims/roles"
    && c.Value == "access_as_process"))));
});


// Add services to the container.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// global cors policy
app.UseCors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(origin => true)
    .AllowCredentials());

app.UseHttpsRedirection();


app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
