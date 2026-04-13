using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SwapSell.API.Data;
using SwapSell.API.Models;

namespace SwapSell.API.Services
{
    public class DatabaseSeeder : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;

        public DatabaseSeeder(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            await context.Database.MigrateAsync(cancellationToken);

            if (!await context.Users.AnyAsync(cancellationToken))
            {
                var adminUser = new User
                {
                    Email = "demo@swapsell.com",
                    PasswordHash = "$2a$11$w.Q.8b7T9c.BvUjR3m/yKOhv7J6kE6S4WzR6Y4jTQG9cQeXhP3D.G", // Dummy hash for "password"
                    Role = "Admin"
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync(cancellationToken);
            }

            if (!await context.Listings.AnyAsync(cancellationToken))
            {
                var user = await context.Users.FirstAsync(cancellationToken);
                
                var dummyListings = new[]
                {
                    new Listing
                    {
                        Title = "MacBook Pro M2 16\"",
                        Description = "Tertemiz, çiziksiz M2 işlemcili MacBook Pro. 16GB RAM, 512GB SSD.",
                        Price = 45000m,
                        ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new Listing
                    {
                        Title = "Sony Alpha a7 III Kasa",
                        Description = "Profesyonel aynasız fotoğraf makinesi. Sadece kasa, lens dahil değildir. Shutter 12K.",
                        Price = 32500m,
                        ImageUrl = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new Listing
                    {
                        Title = "Herman Miller Aeron Koltuk",
                        Description = "B size, bel destekli efsane ofis koltuğu. Garantisi devam ediyor.",
                        Price = 18000m,
                        ImageUrl = "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80",
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow.AddHours(-12)
                    },
                    new Listing
                    {
                        Title = "PlayStation 5 Çift Kol",
                        Description = "Kutusunda duruyor, zamanım olmadığı için satıyorum. 2 adet dualsense dahil.",
                        Price = 15500m,
                        ImageUrl = "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow.AddHours(-5)
                    }
                };

                context.Listings.AddRange(dummyListings);
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
