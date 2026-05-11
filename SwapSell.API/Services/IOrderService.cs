using System.Collections.Generic;
using System.Threading.Tasks;
using SwapSell.API.DTOs;

namespace SwapSell.API.Services
{
    public interface IOrderService
    {
        Task<OrderResponseDto?> CreateOrderAsync(CreateOrderDto dto, int buyerId);
        Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(int userId);
    }
}
