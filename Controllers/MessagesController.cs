using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwapSell.API.Data;
using SwapSell.API.DTOs;
using SwapSell.API.Models;
using System.Security.Claims;

namespace SwapSell.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MessagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<MessageResponseDto>> SendMessage(SendMessageDto dto)
        {
            var senderId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                ListingId = dto.ListingId,
                Content = dto.Content
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new MessageResponseDto
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                ListingId = message.ListingId,
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead
            });
        }

        [HttpGet("inbox")]
        public async Task<ActionResult<IEnumerable<MessageResponseDto>>> GetInbox()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var messages = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderByDescending(m => m.SentAt)
                .Select(m => new MessageResponseDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    ListingId = m.ListingId,
                    Content = m.Content,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead
                })
                .ToListAsync();

            return Ok(messages);
        }
    }
}