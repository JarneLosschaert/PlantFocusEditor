using Azure;
using Microsoft.AspNetCore.Components.WebAssembly.Http;

namespace PlantFocusEditor.Services
{
    public class ImagesService
    {
        private readonly List<string> _images = [];
        public List<string> GetImages()
        {
            return _images;
        }

        public void AddImage(string source)
        {
            _images.Insert(0, source);
        }

        public async Task<string> ConvertImageUrlToBase64(string imageUrl)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, imageUrl);
                request.SetBrowserRequestMode(BrowserRequestMode.NoCors);
                request.SetBrowserRequestCache(BrowserRequestCache.NoStore);
                using (HttpClient httpClient = new())
                {
                    HttpResponseMessage response = await httpClient.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        // Read the content as a byte array
                        byte[] imageBytes = await response.Content.ReadAsByteArrayAsync();

                        // Convert the byte array to a base64 string
                        string base64String = Convert.ToBase64String(imageBytes);

                        // Append the appropriate image data URI prefix
                        string imageDataUri = $"data:image/jpeg;base64,{base64String}";

                        return imageDataUri;
                    }
                    else
                    {
                        Console.WriteLine($"Failed to download image. Status code: {response.StatusCode}");
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error converting image URL to base64: {ex.Message}");
                return null;
            }
        }
    }
}
