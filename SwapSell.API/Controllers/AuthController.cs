using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SwapSell.API.DTOs;
using SwapSell.API.Services;

namespace SwapSell.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var user = await _authService.RegisterAsync(registerDto);
            if (user == null)
            {
                return BadRequest(new { message = "User already exists with this email." });
            }

            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var response = await _authService.LoginAsync(loginDto);
            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(response);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var token = await _authService.ForgotPasswordAsync(forgotPasswordDto.Email);
            if (token == null)
            {
                // In a real app, don't reveal that the user does not exist
                return Ok(new { message = "If your email is registered, you will receive a password reset link." });
            }

            // Return the token for local development testing
            return Ok(new 
            { 
                message = "If your email is registered, you will receive a password reset link.",
                resetToken = token // WARNING: Only for local testing! Remove in production.
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var success = await _authService.ResetPasswordAsync(resetPasswordDto);
            if (!success)
            {
                return BadRequest(new { message = "Invalid token or token has expired." });
            }

            return Ok(new { message = "Password has been successfully reset." });
        }
    }
}
