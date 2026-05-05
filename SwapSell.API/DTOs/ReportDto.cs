using System;

namespace SwapSell.API.DTOs
{
    public class CreateReportDto
    {
        public int ListingId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ReportResponseDto
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public string ListingTitle { get; set; } = string.Empty;
        public int ReporterId { get; set; }
        public string ReporterEmail { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsResolved { get; set; }
    }
}
