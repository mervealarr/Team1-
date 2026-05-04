using System.ComponentModel.DataAnnotations;

namespace SwapSell.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "User";

        public string? ResetPasswordToken { get; set; }
        
        public DateTime? ResetPasswordTokenExpiry { get; set; }

        public bool IsEmailConfirmed { get; set; } = false;
        
        public string? EmailActivationToken { get; set; }
        
        public DateTime? EmailActivationTokenExpiry { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
    }
}
