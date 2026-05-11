using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SwapSell.API.Data;
using SwapSell.API.Models;

namespace SwapSell.API.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId)
        {
            return await _context.Orders
                .Include(o => o.Listing)
                .Where(o => o.BuyerId == userId)
                .OrderByDescending(o => o.PurchaseDate)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.Listing)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<bool> HasUserPurchasedListingAsync(int userId, int listingId)
        {
            return await _context.Orders
                .AnyAsync(o => o.BuyerId == userId && o.ListingId == listingId);
        }
    }
}
