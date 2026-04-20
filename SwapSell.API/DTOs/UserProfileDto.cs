namespace SwapSell.API.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int TotalListings { get; set; }
        public List<ListingResponseDto> Listings { get; set; } = new();
    }
}
