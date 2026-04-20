using System.Collections.Generic;
using System.Threading.Tasks;
using SwapSell.API.Models;

namespace SwapSell.API.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByIdAsync(int id);
        Task<User> CreateUserAsync(User user);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task DeleteUserAsync(User user);
    }
}
