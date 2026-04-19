using System.Collections.Generic;
using System.Threading.Tasks;
using SwapSell.API.Models;

namespace SwapSell.API.Repositories
{
    public interface IListingRepository
    {
        Task<Listing> AddListingAsync(Listing listing);
        Task<IEnumerable<Listing>> GetAllListingsAsync();
        Task<Listing?> GetListingByIdAsync(int id);
        Task<bool> UpdateListingAsync(Listing listing);
        Task<bool> DeleteListingAsync(Listing listing);
    }
}
