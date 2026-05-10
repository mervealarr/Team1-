using System.ComponentModel.DataAnnotations;

namespace SwapSell.API.DTOs
{
    public class CreateListingDto
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        [Required]
[MaxLength(100)]
public string Location { get; set; } = string.Empty;

[Required]
[MaxLength(50)]
public string Condition { get; set; } = "İkinci El";
    }

    public class UpdateListingDto
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        [Required]
[MaxLength(100)]
public string Location { get; set; } = string.Empty;

[Required]
[MaxLength(50)]
public string Condition { get; set; } = "İkinci El";
    }

    public class ListingResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
        public int SellerId { get; set; }
        public string SellerEmail { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
public string Condition { get; set; } = "İkinci El";
    
    }
}
