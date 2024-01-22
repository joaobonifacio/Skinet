using System.Text.Json;
using Core.Entities;
using Core.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Data
{
    public class BasketRepository : IBasketRepository
    {
        private readonly IDatabase _redis;

        public BasketRepository(IConnectionMultiplexer redis){
            _redis = redis.GetDatabase();
        }

        public async Task<CustomerBasket> GetBasketAsync(string basketId)
        {
            var data = await _redis.StringGetAsync(basketId);

            //Se não tiver basket cria um com o id que foi passado
            return data.IsNullOrEmpty ? null : JsonSerializer.Deserialize<CustomerBasket>(data);
        }

        public async Task<CustomerBasket> UpdateBasketAsync(CustomerBasket basket)
        {
            var created = await _redis.StringSetAsync(basket.Id, JsonSerializer.Serialize(basket), TimeSpan.FromDays(30));

            if(!created) return null;

            return await GetBasketAsync(basket.Id);
        }

        public async Task<bool> DeleteBasketAsync(string basketId)
        {
            return await _redis.KeyDeleteAsync(basketId);
        }
    }
}