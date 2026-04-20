using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SwapSell.API.Data;
using SwapSell.API.Models;

namespace SwapSell.API.Repositories
{
    public class ListingRepository : IListingRepository
    {
        private readonly ApplicationDbContext _context;

        public ListingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Listing> AddListingAsync(Listing listing)
        {
            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();
            return listing;
        }

        public async Task<IEnumerable<Listing>> GetAllListingsAsync(int? currentUserId = null)
        {
            var query = _context.Listings.Include(l => l.User).AsQueryable();

            if (currentUserId.HasValue)
            {
                query = query.Where(l => l.IsApproved || l.UserId == currentUserId.Value);
            }
            else
            {
                query = query.Where(l => l.IsApproved);
            }

            return await query
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Listing>> GetAllListingsAdminAsync()
        {
            return await _context.Listings
                .Include(l => l.User)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<Listing?> GetListingByIdAsync(int id)
        {
            return await _context.Listings
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<bool> DeleteListingAsync(Listing listing)
        {
            _context.Listings.Remove(listing);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateListingAsync(Listing listing)
        {
            _context.Listings.Update(listing);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Listing>> GetListingsByUserIdAsync(int userId)
        {
            return await _context.Listings
                .Include(l => l.User)
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }
    }
}
