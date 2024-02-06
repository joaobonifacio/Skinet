using System.Net.Security;
using API.Errors;
using Core.Interfaces;
using Infrastructure;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace API.Extensions
{
    public static class ApplicationServicesExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            //DB CONTEXT
            services.AddDbContext<StoreContext>(opt => {
                opt.UseSqlite(config.GetConnectionString("DefaultConnection"));
            });

            //REDIS
            services.AddSingleton<IConnectionMultiplexer>(c => {
                var options = ConfigurationOptions.Parse(config.GetConnectionString("Redis"));

                return ConnectionMultiplexer.Connect(options);
            });

            //CACHE
            services.AddSingleton<IResponseCacheService, ResponseCacheService>();

            //REPOSITORY REDIS
            services.AddScoped<IBasketRepository, BasketRepository>();

            //REPOSITORY
            services.AddScoped<IProductRepository, ProductRepository>();

            //UNIT OF WORK
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            //GENERIC REPOSITORY
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            //TOKEN SERVICE
            services.AddScoped<ITokenService, TokenService>();

            //ORDER SERVICE
            services.AddScoped<IOrderService, OrderService>();

            //STRIPE SERVICE
            services.AddScoped<IPaymentService, PaymentService>();

            //DTOs
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            services.Configure<ApiBehaviorOptions>(options => 
            {
                options.InvalidModelStateResponseFactory = actionContext =>
                {
                    var errors = actionContext.ModelState
                                    .Where(e => e.Value.Errors.Count() > 0)
                                    .SelectMany(x => x.Value.Errors)
                                    .Select(x => x.ErrorMessage).ToArray();
                    
                    var errorResponse = new ApiValidationErrorResponse
                    {
                        Errors = errors
                    };

                    return new BadRequestObjectResult(errorResponse);
                };
            });

            services.AddCors(opt => 
            {
                opt.AddPolicy("CorsPolicy", policy => 
                {
                    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:4200");
                });
            });

            return services;
        }
    }
}