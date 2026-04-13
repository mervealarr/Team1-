using System.Collections.Generic;
using System.Threading.Tasks;
using SwapSell.API.DTOs;

namespace SwapSell.API.Services
{
    public interface IListingService
    {
        Task<ListingResponseDto> CreateListingAsync(CreateListingDto dto, int userId);
        Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync();
        Task<ListingResponseDto?> GetListingByIdAsync(int id);
        Task<bool> DeleteListingAsync(int id, int userId);
    }
}
