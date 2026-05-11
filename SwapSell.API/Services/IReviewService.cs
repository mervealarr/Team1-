using System.Collections.Generic;
using System.Threading.Tasks;
using SwapSell.API.DTOs;

namespace SwapSell.API.Services
{
    public interface IReviewService
    {
        Task<ReviewResponseDto?> AddReviewAsync(CreateReviewDto dto, int userId);
        Task<IEnumerable<ReviewResponseDto>> GetListingReviewsAsync(int listingId);
        Task<ReviewResponseDto?> UpdateReviewAsync(int id, UpdateReviewDto dto, int userId);
        Task<bool> DeleteReviewAsync(int id, int userId);
    }
}
