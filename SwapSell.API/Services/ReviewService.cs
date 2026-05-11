using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SwapSell.API.DTOs;
using SwapSell.API.Models;
using SwapSell.API.Repositories;

namespace SwapSell.API.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IOrderRepository _orderRepository;

        public ReviewService(IReviewRepository reviewRepository, IOrderRepository orderRepository)
        {
            _reviewRepository = reviewRepository;
            _orderRepository = orderRepository;
        }

        public async Task<ReviewResponseDto?> AddReviewAsync(CreateReviewDto dto, int userId)
        {
            // Sadece ilanı satın alanlar yorum yapabilir.
            bool hasPurchased = await _orderRepository.HasUserPurchasedListingAsync(userId, dto.ListingId);
            if (!hasPurchased) return null;

            // Zaten yorum yapmış mı?
            bool hasReviewed = await _reviewRepository.HasUserReviewedListingAsync(userId, dto.ListingId);
            if (hasReviewed) return null;

            var review = new Review
            {
                ListingId = dto.ListingId,
                ReviewerId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _reviewRepository.AddReviewAsync(review);

            // Reviewer nav property won't be fully loaded, need to fetch it to get Name, or just return basic info
            var fetchedReview = await _reviewRepository.GetReviewByIdAsync(created.Id);

            return MapToDto(fetchedReview!);
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetListingReviewsAsync(int listingId)
        {
            var reviews = await _reviewRepository.GetReviewsByListingIdAsync(listingId);
            return reviews.Select(MapToDto);
        }

        public async Task<ReviewResponseDto?> UpdateReviewAsync(int id, UpdateReviewDto dto, int userId)
        {
            var review = await _reviewRepository.GetReviewByIdAsync(id);
            if (review == null || review.ReviewerId != userId) return null;

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;
            review.UpdatedAt = DateTime.UtcNow;

            var success = await _reviewRepository.UpdateReviewAsync(review);
            if (!success) return null;

            return MapToDto(review);
        }

        public async Task<bool> DeleteReviewAsync(int id, int userId)
        {
            var review = await _reviewRepository.GetReviewByIdAsync(id);
            if (review == null || review.ReviewerId != userId) return false;

            return await _reviewRepository.DeleteReviewAsync(review);
        }

        private ReviewResponseDto MapToDto(Review review)
        {
            return new ReviewResponseDto
            {
                Id = review.Id,
                ReviewerId = review.ReviewerId,
                ReviewerName = review.Reviewer?.FirstName ?? review.Reviewer?.Email ?? "Kullanıcı",
                ListingId = review.ListingId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            };
        }
    }
}
