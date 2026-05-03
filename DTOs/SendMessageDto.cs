namespace SwapSell.API.DTOs
{
    public class SendMessageDto
    {
        public int ReceiverId { get; set; }
        public int ListingId { get; set; }
        public string Content { get; set; }
    }
}