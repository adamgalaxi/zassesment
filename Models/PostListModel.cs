using Newtonsoft.Json;

namespace zum.Models
{
    public class PostListModel
    {
        [JsonProperty("posts")]
        public List<Post> Posts { get; set; }

    }
}
