using Library.Data.Entities;
using System.Net.Http.Json;

namespace PlantFocusEditor.Services
{
    public class ApiConnectorService
    {
        private HttpClient _client;
        private HttpClient _imagesClient;

        public ApiConnectorService(IHttpClientFactory httpClientFactory)
        {
            _client = httpClientFactory.CreateClient("Plantfocus Editor API");
            _imagesClient = httpClientFactory.CreateClient();
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

        public async Task<Stream> GetImageAsync(string url)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            HttpResponseMessage response = await _imagesClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("success");
                return await response.Content.ReadAsStreamAsync();
            } else
            {
                Console.WriteLine("request failed");
                Console.WriteLine(response.ReasonPhrase);
                return null;
            }
        }
    }
}