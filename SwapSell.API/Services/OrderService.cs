using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SwapSell.API.DTOs;
using SwapSell.API.Models;
using SwapSell.API.Repositories;

namespace SwapSell.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IListingRepository _listingRepository;

        public OrderService(IOrderRepository orderRepository, IListingRepository listingRepository)
        {
            _orderRepository = orderRepository;
            _listingRepository = listingRepository;
        }

        public async Task<OrderResponseDto?> CreateOrderAsync(CreateOrderDto dto, int buyerId)
        {
            var listing = await _listingRepository.GetListingByIdAsync(dto.ListingId);
            if (listing == null || listing.IsSold || listing.UserId == buyerId)
            {
                // İlan yok, zaten satılmış veya kendi ilanını almaya çalışıyor.
                return null;
            }

            var order = new Order
            {
                BuyerId = buyerId,
                ListingId = dto.ListingId,
                OrderType = dto.OrderType,
                PurchaseDate = DateTime.UtcNow
            };

            var createdOrder = await _orderRepository.CreateOrderAsync(order);

            // İlanı satıldı olarak işaretle
            listing.IsSold = true;
            await _listingRepository.UpdateListingAsync(listing);

            return new OrderResponseDto
            {
                Id = createdOrder.Id,
                BuyerId = createdOrder.BuyerId,
                ListingId = createdOrder.ListingId,
                ListingTitle = listing.Title,
                ListingPrice = listing.Price,
                PurchaseDate = createdOrder.PurchaseDate,
                OrderType = createdOrder.OrderType
            };
        }

        public async Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(int userId)
        {
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            return orders.Select(o => new OrderResponseDto
            {
                Id = o.Id,
                BuyerId = o.BuyerId,
                ListingId = o.ListingId,
                ListingTitle = o.Listing?.Title ?? "Silinmiş İlan",
                ListingPrice = o.Listing?.Price ?? 0,
                PurchaseDate = o.PurchaseDate,
                OrderType = o.OrderType
            });
        }
    }
}
