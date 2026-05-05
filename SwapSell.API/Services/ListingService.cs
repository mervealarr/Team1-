using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SwapSell.API.DTOs;
using SwapSell.API.Models;
using SwapSell.API.Repositories;
using SwapSell.API.Data;
using SwapSell.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;

namespace SwapSell.API.Services
{
    public class ListingService : IListingService
    {
        private readonly IListingRepository _listingRepository;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ListingService(IListingRepository listingRepository, ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _listingRepository = listingRepository;
            _context = context;
            _hubContext = hubContext;
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
                VideoUrl = dto.VideoUrl ?? string.Empty,
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
                VideoUrl = created.VideoUrl,
                CreatedAt = created.CreatedAt,
                IsApproved = created.IsApproved,
                SellerId = created.UserId,
                SellerEmail = created.User?.Email ?? string.Empty
            };
        }

        public async Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync(int? currentUserId = null)
        {
            var listings = await _listingRepository.GetAllListingsAsync(currentUserId);
            return listings.Select(l => new ListingResponseDto
            {
                Id = l.Id,
                Title = l.Title,
                Description = l.Description,
                Category = l.Category,
                Price = l.Price,
                ImageUrl = l.ImageUrl,
                VideoUrl = l.VideoUrl,
                CreatedAt = l.CreatedAt,
                IsApproved = l.IsApproved,
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
                VideoUrl = listing.VideoUrl,
                CreatedAt = listing.CreatedAt,
                IsApproved = listing.IsApproved,
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

            bool isPriceDropped = dto.Price < listing.Price;

            listing.Title = dto.Title;
            listing.Description = dto.Description;
            listing.Category = dto.Category;
            listing.Price = dto.Price;
            listing.ImageUrl = dto.ImageUrl ?? string.Empty;
            listing.VideoUrl = dto.VideoUrl ?? string.Empty;

            var success = await _listingRepository.UpdateListingAsync(listing);
            if (!success) return null;

            if (isPriceDropped)
            {
                var favoriteUserIds = await _context.Favorites
                    .Where(f => f.ListingId == id)
                    .Select(f => f.UserId)
                    .ToListAsync();

                if (favoriteUserIds.Any())
                {
                    foreach(var fUserId in favoriteUserIds)
                    {
                        var notification = new Notification
                        {
                            UserId = fUserId,
                            Message = $"📉 Favorilerinizdeki \"{listing.Title}\" ilanının fiyatı {dto.Price} ₺'ye düştü!",
                            ListingId = id,
                            CreatedAt = DateTime.UtcNow,
                            IsRead = false
                        };
                        _context.Notifications.Add(notification);
                    }
                    await _context.SaveChangesAsync();

                    foreach(var fUserId in favoriteUserIds)
                    {
                        await _hubContext.Clients.User(fUserId.ToString()).SendAsync("ReceiveNotification", $"📉 Favorilerinizdeki \"{listing.Title}\" ilanının fiyatı {dto.Price} ₺'ye düştü!");
                    }
                }
            }

            return new ListingResponseDto
            {
                Id = listing.Id,
                Title = listing.Title,
                Description = listing.Description,
                Category = listing.Category,
                Price = listing.Price,
                ImageUrl = listing.ImageUrl,
                VideoUrl = listing.VideoUrl,
                CreatedAt = listing.CreatedAt,
                IsApproved = listing.IsApproved,
                SellerId = listing.UserId,
                SellerEmail = listing.User?.Email ?? string.Empty
            };
        }
    }
}
