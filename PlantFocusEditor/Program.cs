using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using PlantFocusEditor;
using PlantFocusEditor.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddHttpClient("Plantfocus Editor API",
    c => c.BaseAddress = new Uri("https://localhost:7203"));

builder.Services.AddScoped<ApiConnectorService>();
builder.Services.AddScoped<TemplatesService>();
builder.Services.AddScoped<ImagesService>();
builder.Services.AddScoped<PDFConversionService>();
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

await builder.Build().RunAsync();
