using Library.Data.Entities;
using System.Net.Http.Json;

namespace PlantFocusEditor.Services
{
    public class ApiConnectorService
    {
        private HttpClient _client;

        public ApiConnectorService(IHttpClientFactory httpClientFactory) 
        {
            _client = httpClientFactory.CreateClient("Plantfocus Editor API");
        }

        public async Task<List<Template>?> GetTemplatesAsync(string? designType, string? labelType)
        {
            HttpResponseMessage response = await _client.GetAsync($"/templates?designType={designType}&labelType={labelType}");

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<List<Template>>();
            }
            return [];
        }
    }
}
