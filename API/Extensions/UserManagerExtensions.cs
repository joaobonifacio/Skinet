using System.Security.Claims;
using Core.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace API.Extensions
{
    public static class UserManagerExtensions
    {
        public static async Task<AppUser> FindUserByClaimsPrincipalWithAddressAsync(this UserManager<AppUser> userManager, 
            ClaimsPrincipal user)
            {
                var email = user.FindFirstValue(ClaimTypes.Email);

                return await userManager.Users
                    .Include(x=>x.Address)
                    .SingleOrDefaultAsync(x=>x.Email==email);
            }
        
        public static async Task<AppUser> FindByEmailFromClaimsPrincipalthis(this UserManager<AppUser> userManager, 
            ClaimsPrincipal user)
            {
                return await userManager.Users
                    .SingleOrDefaultAsync(x=>x.Email==user.FindFirstValue(ClaimTypes.Email));
            }
    }
}