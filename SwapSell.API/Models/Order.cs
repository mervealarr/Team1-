using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwapSell.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BuyerId { get; set; }

        [ForeignKey("BuyerId")]
        public User? Buyer { get; set; }

        [Required]
        public int ListingId { get; set; }

        [ForeignKey("ListingId")]
        public Listing? Listing { get; set; }

        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
        
        // "DirectBuy" or "BargainBuy"
        public string OrderType { get; set; } = "DirectBuy";
    }
}
