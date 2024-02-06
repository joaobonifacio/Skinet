namespace Core.Interfaces
{
    public interface IResponseCacheService
    {
        //Quando recebermos dados da BD vamos pôr em cache no Redis 
        Task CacheResponseAsync(string cacheKey, object response, TimeSpan timeToLive);

        Task<string> GetCachedResponseAsync(string cacheKey);
    }
}