using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SwapSell.API.DTOs;
using SwapSell.API.Models;
using SwapSell.API.Repositories;

namespace SwapSell.API.Services
{
    public class ListingService : IListingService
    {
        private readonly IListingRepository _listingRepository;

        public ListingService(IListingRepository listingRepository)
        {
            _listingRepository = listingRepository;
        }

        public async Task<ListingResponseDto> CreateListingAsync(CreateListingDto dto, int userId)
        {
            var listing = new Listing
            {
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl ?? string.Empty,
                UserId = userId
            };

            var created = await _listingRepository.AddListingAsync(listing);

            return new ListingResponseDto
            {
                Id = created.Id,
                Title = created.Title,
                Description = created.Description,
                Category = created.Category,
                Price = created.Price,
                ImageUrl = created.ImageUrl,
                CreatedAt = created.CreatedAt,
                SellerId = created.UserId,
                SellerEmail = created.User?.Email ?? string.Empty
            };
        }

        public async Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync()
        {
            var listings = await _listingRepository.GetAllListingsAsync();
            return listings.Select(l => new ListingResponseDto
            {
                Id = l.Id,
                Title = l.Title,
                Description = l.Description,
                Category = l.Category,
                Price = l.Price,
                ImageUrl = l.ImageUrl,
                CreatedAt = l.CreatedAt,
                SellerId = l.UserId,
                SellerEmail = l.User?.Email ?? string.Empty
            });
        }

        public async Task<ListingResponseDto?> GetListingByIdAsync(int id)
        {
            var listing = await _listingRepository.GetListingByIdAsync(id);
            if (listing == null) return null;

            return new ListingResponseDto
            {
                Id = listing.Id,
                Title = listing.Title,
                Description = listing.Description,
                Category = listing.Category,
                Price = listing.Price,
                ImageUrl = listing.ImageUrl,
                CreatedAt = listing.CreatedAt,
                SellerId = listing.UserId,
                SellerEmail = listing.User?.Email ?? string.Empty
            };
        }

        public async Task<bool> DeleteListingAsync(int id, int userId)
        {
            var listing = await _listingRepository.GetListingByIdAsync(id);
            if (listing == null) return false;

            // Optional: You could allow Admins to delete any item as well.
            // For now, strict owner restriction.
            if (listing.UserId != userId) return false;

            return await _listingRepository.DeleteListingAsync(listing);
        }

        public async Task<ListingResponseDto?> UpdateListingAsync(int id, UpdateListingDto dto, int userId)
        {
            var listing = await _listingRepository.GetListingByIdAsync(id);
            if (listing == null) return null;
            if (listing.UserId != userId) return null;

            listing.Title = dto.Title;
            listing.Description = dto.Description;
            listing.Category = dto.Category;
            listing.Price = dto.Price;
            listing.ImageUrl = dto.ImageUrl ?? string.Empty;

            var success = await _listingRepository.UpdateListingAsync(listing);
            if (!success) return null;

            return new ListingResponseDto
            {
                Id = listing.Id,
                Title = listing.Title,
                Description = listing.Description,
                Category = listing.Category,
                Price = listing.Price,
                ImageUrl = listing.ImageUrl,
                CreatedAt = listing.CreatedAt,
                SellerId = listing.UserId,
                SellerEmail = listing.User?.Email ?? string.Empty
            };
        }
    }
}
