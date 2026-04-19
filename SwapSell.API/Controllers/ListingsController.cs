using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwapSell.API.DTOs;
using SwapSell.API.Services;

namespace SwapSell.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly IListingService _listingService;

        public ListingsController(IListingService listingService)
        {
            _listingService = listingService;
        }

        // Feature 2: Browse All Listings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListingResponseDto>>> GetAll()
        {
            var listings = await _listingService.GetAllListingsAsync();
            return Ok(listings);
        }

        // Feature 3: View Product Details
        [HttpGet("{id}")]
        public async Task<ActionResult<ListingResponseDto>> GetById(int id)
        {
            var listing = await _listingService.GetListingByIdAsync(id);
            if (listing == null)
                return NotFound(new { message = "Listing not found." });

            return Ok(listing);
        }

        // Feature 1: Create Product Listing
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ListingResponseDto>> Create([FromBody] CreateListingDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var result = await _listingService.CreateListingAsync(dto, userId);
            // Return 201 Created with a Location header pointing to GetById
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // Feature 4: Delete Own Listing
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var success = await _listingService.DeleteListingAsync(id, userId);
            if (!success)
            {
                return Forbid("You do not have permission to delete this listing or it does not exist.");
            }

            return NoContent();
        }

        // Feature 5: Update Own Listing
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<ListingResponseDto>> Update(int id, [FromBody] UpdateListingDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var result = await _listingService.UpdateListingAsync(id, dto, userId);
            if (result == null)
            {
                return Forbid("You do not have permission to edit this listing or it does not exist.");
            }

            return Ok(result);
        }
    }
}
