using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwapSell.API.DTOs;
using SwapSell.API.Services;
using System.Security.Claims;

namespace SwapSell.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("listing/{listingId}")]
        public async Task<IActionResult> GetListingReviews(int listingId)
        {
            var reviews = await _reviewService.GetListingReviewsAsync(listingId);
            return Ok(reviews);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized();

            var review = await _reviewService.AddReviewAsync(dto, userId);
            if (review == null)
            {
                return BadRequest("Yorum eklenemedi. Sadece ilanı satın alanlar bir kez yorum yapabilir.");
            }

            return Ok(review);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized();

            var review = await _reviewService.UpdateReviewAsync(id, dto, userId);
            if (review == null)
            {
                return Forbid();
            }

            return Ok(review);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized();

            var success = await _reviewService.DeleteReviewAsync(id, userId);
            if (!success)
            {
                return Forbid();
            }

            return NoContent();
        }
    }
}
