using System.ComponentModel.DataAnnotations;

namespace SwapSell.API.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
    }
}
