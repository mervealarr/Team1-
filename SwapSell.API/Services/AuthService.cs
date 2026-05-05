using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SwapSell.API.DTOs;
using SwapSell.API.Models;
using SwapSell.API.Repositories;

namespace SwapSell.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(IUserRepository userRepository, IConfiguration configuration, IEmailService emailService)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<User?> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser = await _userRepository.GetUserByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                return null;
            }

            var activationToken = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));

            var user = new User
            {
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = string.IsNullOrEmpty(registerDto.Role) ? "User" : registerDto.Role,
                IsEmailConfirmed = false,
                EmailActivationToken = activationToken,
                EmailActivationTokenExpiry = DateTime.UtcNow.AddDays(1)
            };

            var createdUser = await _userRepository.CreateUserAsync(user);

            // Send activation email
            var apiBaseUrl = _configuration["AppUrls:ApiBaseUrl"] ?? "http://localhost:5237";
            var activationLink = $"{apiBaseUrl}/api/auth/activate-email?email={user.Email}&token={Uri.EscapeDataString(activationToken)}";
            var emailBody = $@"
                <h2>Welcome to SwapSell!</h2>
                <p>Please activate your account by clicking the link below:</p>
                <p><a href='{activationLink}'>Activate Account</a></p>
                <p>If the link doesn't work, you can copy and paste this token in the activation page: <b>{activationToken}</b></p>
            ";
            await _emailService.SendEmailAsync(user.Email, "SwapSell - Activate Your Account", emailBody);

            return createdUser;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            // if (!user.IsEmailConfirmed)
            // {
            //     throw new UnauthorizedAccessException("Lütfen önce e-postanızı onaylayın.");
            // }

            var token = GenerateJwtToken(user);
            return new AuthResponseDto { Token = token };
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string?> ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
            {
                return null;
            }

            // Generate a secure random token
            var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _userRepository.UpdateUserAsync(user);

            // In a real application, send an email with the token
            // For now, return it so the API can provide it to the client
            return token;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await _userRepository.GetUserByEmailAsync(resetPasswordDto.Email);
            if (user == null)
            {
                return false;
            }

            if (user.ResetPasswordToken != resetPasswordDto.Token || 
                user.ResetPasswordTokenExpiry == null || 
                user.ResetPasswordTokenExpiry < DateTime.UtcNow)
            {
                return false;
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;

            await _userRepository.UpdateUserAsync(user);

            return true;
        }

        public async Task<bool> ActivateEmailAsync(string email, string token)
        {
            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
            {
                return false;
            }

            if (user.IsEmailConfirmed)
            {
                return true; // Already confirmed
            }

            if (user.EmailActivationToken != token || 
                user.EmailActivationTokenExpiry == null || 
                user.EmailActivationTokenExpiry < DateTime.UtcNow)
            {
                return false;
            }

            user.IsEmailConfirmed = true;
            user.EmailActivationToken = null;
            user.EmailActivationTokenExpiry = null;

            await _userRepository.UpdateUserAsync(user);

            return true;
        }
    }
}
