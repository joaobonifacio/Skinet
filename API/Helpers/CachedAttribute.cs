using System.Text;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore.Storage;

namespace API.Helpers
{
    public class CachedAttribute : Attribute, IAsyncActionFilter
    {
        private readonly int _timeToLiveInSeconds;

        public CachedAttribute(int timeToLiveInSeconds)
        {
            _timeToLiveInSeconds = timeToLiveInSeconds;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            //ANTES DE MANDAR O REQUEST PARA O CONTROLLER
            var cacheService = context.HttpContext.RequestServices.GetRequiredService<IResponseCacheService>();

            //Queremos gerar uma key, baseada nos request params, p identificar na redis database
            var cacheKey = GenerateCacheKeyFromRequest(context.HttpContext.Request);
            var cachedResponse = await cacheService.GetCachedResponseAsync(cacheKey);

            //Aqui verificamos se já temos uma cached response para a key
            //Se tivermos resposta em cache não vamos à BD, devolvemos o que temos em cache
            if(!string.IsNullOrEmpty(cachedResponse))
            {
                var contentResult = new ContentResult
                {
                    Content = cachedResponse,
                    ContentType = "application/json",
                    StatusCode = 200
                };

                context.Result = contentResult;

                return;
            }

            //Se não tivermos nada em cache
            var executedContext = await next(); //Aqui sim, vamos p o controller

            if(executedContext.Result is OkObjectResult okObjectResult)
            {
                //E aqui guardamos a resposta em cache
                await cacheService.CacheResponseAsync(cacheKey, okObjectResult.Value, 
                    TimeSpan.FromSeconds(_timeToLiveInSeconds));
            }
        }

        private string GenerateCacheKeyFromRequest(HttpRequest request)
        {
            //O nosso request vai ter query string parameters, productParams no ProductsController, por exemplo
            var keyBuilder = new StringBuilder();

            keyBuilder.Append($"{request.Path}");

            foreach(var (key, value) in request.Query.OrderBy(x=>x.Key))
            {
                keyBuilder.Append($"|{key}-{value}");
            }

            return keyBuilder.ToString();
        }
    }
}