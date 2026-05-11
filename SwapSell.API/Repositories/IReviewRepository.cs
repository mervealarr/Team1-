using System.Collections.Generic;
using System.Threading.Tasks;
using SwapSell.API.Models;

namespace SwapSell.API.Repositories
{
    public interface IReviewRepository
    {
        Task<Review> AddReviewAsync(Review review);
        Task<Review?> GetReviewByIdAsync(int id);
        Task<IEnumerable<Review>> GetReviewsByListingIdAsync(int listingId);
        Task<bool> UpdateReviewAsync(Review review);
        Task<bool> DeleteReviewAsync(Review review);
        Task<bool> HasUserReviewedListingAsync(int userId, int listingId);
    }
}
