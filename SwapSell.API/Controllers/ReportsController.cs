using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwapSell.API.Data;
using SwapSell.API.DTOs;
using SwapSell.API.Models;

namespace SwapSell.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                return Unauthorized();

            var listing = await _context.Listings.FindAsync(dto.ListingId);
            if (listing == null)
                return NotFound("Listing not found.");

            var report = new Report
            {
                ListingId = dto.ListingId,
                ReporterId = userId,
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow,
                IsResolved = false
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Report submitted successfully." });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReports()
        {
            var reports = await _context.Reports
                .Include(r => r.Listing)
                .Include(r => r.Reporter)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReportResponseDto
                {
                    Id = r.Id,
                    ListingId = r.ListingId,
                    ListingTitle = r.Listing != null ? r.Listing.Title : "Deleted Listing",
                    ReporterId = r.ReporterId,
                    ReporterEmail = r.Reporter != null ? r.Reporter.Email : "Unknown User",
                    Reason = r.Reason,
                    CreatedAt = r.CreatedAt,
                    IsResolved = r.IsResolved
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveReport(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null) return NotFound();

            report.IsResolved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Report marked as resolved." });
        }
    }
}
