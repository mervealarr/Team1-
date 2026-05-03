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
                Location = dto.Location,
                Condition = dto.Condition,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl ?? string.Empty,
                UserId = userId
            };

            var created = await _listingRepository.AddListingAsync(listing);

            return MapToDto(created);
        }

        public async Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync(int? currentUserId = null)
        {
            var listings = await _listingRepository.GetAllListingsAsync(currentUserId);
            return listings.Select(MapToDto);
        }

        public async Task<ListingResponseDto?> GetListingByIdAsync(int id)
        {
            var listing = await _listingRepository.GetListingByIdAsync(id);
            if (listing == null) return null;

            return MapToDto(listing);
        }

        public async Task<bool> DeleteListingAsync(int id, int userId)
        {
            var listing = await _listingRepository.GetListingByIdAsync(id);
            if (listing == null) return false;

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
            listing.Location = dto.Location;
            listing.Condition = dto.Condition;
            listing.Price = dto.Price;
            listing.ImageUrl = dto.ImageUrl ?? string.Empty;

            var success = await _listingRepository.UpdateListingAsync(listing);
            if (!success) return null;

            return MapToDto(listing);
        }

        private ListingResponseDto MapToDto(Listing listing)
        {
            return new ListingResponseDto
            {
                Id = listing.Id,
                Title = listing.Title,
                Description = listing.Description,
                Category = listing.Category,
                Location = listing.Location,
                Condition = listing.Condition,
                Price = listing.Price,
                ImageUrl = listing.ImageUrl,
                CreatedAt = listing.CreatedAt,
                IsApproved = listing.IsApproved,
                SellerId = listing.UserId,
                SellerEmail = listing.User?.Email ?? string.Empty
            };
        }
    }
}