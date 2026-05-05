using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SwapSell.API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        // SignalR automatically uses ClaimTypes.NameIdentifier to identify users.
    }
}
