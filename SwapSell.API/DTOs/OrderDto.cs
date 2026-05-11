using System;
using System.ComponentModel.DataAnnotations;

namespace SwapSell.API.DTOs
{
    public class CreateOrderDto
    {
        [Required]
        public int ListingId { get; set; }
        
        public string OrderType { get; set; } = "DirectBuy";
    }

    public class OrderResponseDto
    {
        public int Id { get; set; }
        public int BuyerId { get; set; }
        public int ListingId { get; set; }
        public string ListingTitle { get; set; } = string.Empty;
        public decimal ListingPrice { get; set; }
        public DateTime PurchaseDate { get; set; }
        public string OrderType { get; set; } = string.Empty;
    }
}
