using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using zum.Models;

namespace zum.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class PostsController : Controller
    {
        private string url = "https://api.hatchways.io/assessment/blog/posts";

        private readonly List<string> validSortByFields = new List<string> { "id", "reads", "likes", "popularity", ""};
        private readonly List<string> validDirectionFields = new List<string> { "asc", "desc", ""};

        private readonly HttpClient _client;

        public PostsController(HttpClient client)
        {
            _client = client;
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery(Name = "tag")] string tags,
                                                  [FromQuery(Name = "sortBy")] string? sortBy = "",
                                                  [FromQuery(Name = "direction")] string? direction = "")
        {

            List<Post> posts = new List<Post>();

            var parsedTags = ParsedTags(tags);

            if (parsedTags.Length == 0)
                return BadRequest("tags parameter is required");

            if (!ValidateSortBy(sortBy))
                return BadRequest("sortBy parameter is invalid");

            if (!ValidateDirection(direction))
                return BadRequest("direction parameter is invalid");

            try
            {
                foreach (string tag in parsedTags)
                {
                    var response = await _client.GetAsync(url + $"?tag={tag}");

                    if (!response.IsSuccessStatusCode)
                    {
                        return BadRequest();
                    }

                    var postresponse = await response.Content.ReadAsStringAsync();
                    posts = posts.Concat(JsonConvert.DeserializeObject<PostListModel>(postresponse).Posts).ToList();
                }
            }
            catch (Exception ex)
            {

                return StatusCode(500, ex.Message);
            }


            Func<Post, dynamic> sortByLambda = GetSortByLambda(sortBy);

            if (direction == "desc")
                posts = posts.Distinct().OrderByDescending(sortByLambda).ToList();
            else
                posts = posts.Distinct().OrderBy(sortByLambda).ToList();

            return Ok(posts);


        }

        private string[] ParsedTags(string tags)
        {
            if (string.IsNullOrEmpty(tags))
            {
                return new string[0];
            }

            return tags.Split(',');
        }

        private bool ValidateSortBy(string sortBy)
        {
            return validSortByFields.Contains(sortBy);
        }

        private bool ValidateDirection(string direction)
        {
            return validDirectionFields.Contains(direction);
        }

        private Func<Post, dynamic> GetSortByLambda(string sortBy)
        {
            Func<Post, dynamic> orderBySelector;
            switch (sortBy)
            {
                case "id":
                    orderBySelector = p => p.Id;
                    break;
                case "likes":
                    orderBySelector = p => p.Likes;
                    break;
                case "reads":
                    orderBySelector = p => p.Reads;
                    break;
                case "popularity":
                    orderBySelector = p => p.Popularity;
                    break;
                default:
                    orderBySelector = p => p.Id;
                    break;
            }
            return orderBySelector;
        }
    }
}
