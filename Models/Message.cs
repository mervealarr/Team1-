using System;

namespace SwapSell.API.Models
{
    public class Message
    {
        public int Id { get; set; }

        public int SenderId { get; set; }
        public User Sender { get; set; }

        public int ReceiverId { get; set; }
        public User Receiver { get; set; }

        public int ListingId { get; set; }
        public Listing Listing { get; set; }

        public string Content { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;
    }
}