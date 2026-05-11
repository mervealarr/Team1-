using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SwapSell.API.Data;
using SwapSell.API.Models;

namespace SwapSell.API.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Review> AddReviewAsync(Review review)
        {
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<Review?> GetReviewByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.Reviewer)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Review>> GetReviewsByListingIdAsync(int listingId)
        {
            return await _context.Reviews
                .Include(r => r.Reviewer)
                .Where(r => r.ListingId == listingId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateReviewAsync(Review review)
        {
            _context.Reviews.Update(review);
            var updated = await _context.SaveChangesAsync();
            return updated > 0;
        }

        public async Task<bool> DeleteReviewAsync(Review review)
        {
            _context.Reviews.Remove(review);
            var deleted = await _context.SaveChangesAsync();
            return deleted > 0;
        }

        public async Task<bool> HasUserReviewedListingAsync(int userId, int listingId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.ReviewerId == userId && r.ListingId == listingId);
        }
    }
}
