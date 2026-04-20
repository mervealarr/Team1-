using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwapSell.API.DTOs;
using SwapSell.API.Repositories;

namespace SwapSell.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IListingRepository _listingRepository;

        public UserController(IUserRepository userRepository, IListingRepository listingRepository)
        {
            _userRepository = userRepository;
            _listingRepository = listingRepository;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var listings = await _listingRepository.GetListingsByUserIdAsync(userId);
            var listingDtos = listings.Select(l => new ListingResponseDto
            {
                Id = l.Id,
                Title = l.Title,
                Description = l.Description,
                Category = l.Category,
                Price = l.Price,
                ImageUrl = l.ImageUrl,
                CreatedAt = l.CreatedAt,
                IsApproved = l.IsApproved,
                SellerId = l.UserId,
                SellerEmail = l.User?.Email ?? ""
            }).ToList();

            var profile = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                TotalListings = listingDtos.Count,
                Listings = listingDtos
            };

            return Ok(profile);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            await _userRepository.DeleteUserAsync(user);

            return Ok(new { message = "Account deleted successfully." });
        }
    }
}
