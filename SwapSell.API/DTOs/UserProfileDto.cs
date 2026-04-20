namespace SwapSell.API.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public int TotalListings { get; set; }
        public List<ListingResponseDto> Listings { get; set; } = new();
    }
}
