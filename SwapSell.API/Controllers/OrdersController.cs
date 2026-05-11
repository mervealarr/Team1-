using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwapSell.API.DTOs;
using SwapSell.API.Services;
using System.Security.Claims;

namespace SwapSell.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized();

            var order = await _orderService.CreateOrderAsync(dto, userId);
            if (order == null)
            {
                return BadRequest("Satın alma işlemi başarısız. İlan bulunamadı, zaten satılmış olabilir veya kendi ilanınızı alamazsınız.");
            }

            return Ok(order);
        }

        [HttpGet("my-purchases")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized();

            var orders = await _orderService.GetMyOrdersAsync(userId);
            return Ok(orders);
        }
    }
}
