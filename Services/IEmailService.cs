using System.Threading.Tasks;

namespace SwapSell.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
