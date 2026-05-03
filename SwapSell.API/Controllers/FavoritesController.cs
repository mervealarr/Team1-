using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwapSell.API.Data;
using SwapSell.API.DTOs;
using SwapSell.API.Models;

namespace SwapSell.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{listingId}")]
        public async Task<IActionResult> ToggleFavorite(int listingId)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var listingExists = await _context.Listings.AnyAsync(l => l.Id == listingId);
            if (!listingExists)
            {
                return NotFound(new { message = "Listing not found." });
            }

            var existingFavorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ListingId == listingId);

            if (existingFavorite != null)
            {
                _context.Favorites.Remove(existingFavorite);
                await _context.SaveChangesAsync();
                return Ok(new { isFavorite = false });
            }
            else
            {
                var newFavorite = new Favorite
                {
                    UserId = userId,
                    ListingId = listingId
                };
                _context.Favorites.Add(newFavorite);
                await _context.SaveChangesAsync();
                return Ok(new { isFavorite = true });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListingResponseDto>>> GetFavorites()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var favoriteListings = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Listing)
                .ThenInclude(l => l.User)
                .Select(f => new ListingResponseDto
                {
                    Id = f.Listing.Id,
                    Title = f.Listing.Title,
                    Description = f.Listing.Description,
                    Category = f.Listing.Category,
                    Price = f.Listing.Price,
                    ImageUrl = f.Listing.ImageUrl,
                    CreatedAt = f.Listing.CreatedAt,
                    IsApproved = f.Listing.IsApproved,
                    SellerId = f.Listing.UserId,
                    SellerEmail = f.Listing.User.Email
                })
                .ToListAsync();

            return Ok(favoriteListings);
        }

        [HttpGet("ids")]
        public async Task<ActionResult<IEnumerable<int>>> GetFavoriteIds()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var favoriteIds = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => f.ListingId)
                .ToListAsync();

            return Ok(favoriteIds);
        }
    }
}
