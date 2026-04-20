using System.Collections.Generic;
using System.Threading.Tasks;
using SwapSell.API.DTOs;

namespace SwapSell.API.Services
{
    public interface IListingService
    {
        Task<ListingResponseDto> CreateListingAsync(CreateListingDto dto, int userId);
        Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync(int? currentUserId = null);
        Task<ListingResponseDto?> GetListingByIdAsync(int id);
        Task<ListingResponseDto?> UpdateListingAsync(int id, UpdateListingDto dto, int userId);
        Task<bool> DeleteListingAsync(int id, int userId);
    }
}
