using System.Threading.Tasks;
using SwapSell.API.DTOs;
using SwapSell.API.Models;

namespace SwapSell.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<User?> RegisterAsync(RegisterDto registerDto);
        string GenerateJwtToken(User user);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    }
}
