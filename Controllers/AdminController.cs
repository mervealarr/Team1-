using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwapSell.API.DTOs;
using SwapSell.API.Repositories;

namespace SwapSell.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IListingRepository _listingRepository;

        public AdminController(IUserRepository userRepository, IListingRepository listingRepository)
        {
            _userRepository = userRepository;
            _listingRepository = listingRepository;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            var result = users.Select(u => new
            {
                id = u.Id,
                email = u.Email,
                role = u.Role
            }).ToList();

            return Ok(result);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Optional: Check if we are deleting another admin (could be restricted)
            // if (user.Role == "Admin") return Forbid();

            await _userRepository.DeleteUserAsync(user);
            return Ok(new { message = "User deleted successfully." });
        }

        [HttpGet("listings")]
        public async Task<IActionResult> GetAllListings()
        {
            var listings = await _listingRepository.GetAllListingsAdminAsync();
            var result = listings.Select(l => new ListingResponseDto
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
                SellerEmail = l.User?.Email ?? string.Empty
            }).ToList();

            return Ok(result);
        }

        [HttpDelete("listings/{id}")]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var listing = await _listingRepository.GetListingByIdAsync(id);
            if (listing == null)
            {
                return NotFound(new { message = "Listing not found." });
            }

            await _listingRepository.DeleteListingAsync(listing);
            return Ok(new { message = "Listing deleted successfully." });
        }

        public class ModerateListingDto
        {
            public bool IsApproved { get; set; }
        }

        [HttpPut("listings/{id}/moderate")]
        public async Task<IActionResult> ModerateListing(int id, [FromBody] ModerateListingDto dto)
        {
            var listing = await _listingRepository.GetListingByIdAsync(id);
            if (listing == null)
            {
                return NotFound(new { message = "Listing not found." });
            }

            listing.IsApproved = dto.IsApproved;
            await _listingRepository.UpdateListingAsync(listing);

            return Ok(new { message = dto.IsApproved ? "Listing approved." : "Listing rejected/hidden." });
        }
    }
}
