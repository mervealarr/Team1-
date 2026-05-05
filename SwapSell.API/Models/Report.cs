using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwapSell.API.Models
{
    public class Report
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ListingId { get; set; }

        [ForeignKey("ListingId")]
        public Listing? Listing { get; set; }

        [Required]
        public int ReporterId { get; set; }

        [ForeignKey("ReporterId")]
        public User? Reporter { get; set; }

        [Required]
        [MaxLength(50)]
        public string Reason { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsResolved { get; set; } = false;
    }
}
