using API.Extensions;
using API.Middleware;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

//EXTENSION METHOD
builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
//EXCEPTION MIDDLEWARE
app.UseMiddleware<ExceptionMiddleware>();

//ERROR HANDLING -> DEVELOPER EXCEPTION PAGE
app.UseStatusCodePagesWithReExecute("/errors/{0}");

// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.UseSwagger();
app.UseSwaggerUI();

//STATIC FILES
app.UseStaticFiles();

//CORS
app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapControllers();

//MIGRATION
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
var context = services.GetRequiredService<StoreContext>();
var logger = services.GetRequiredService<ILogger<Program>>();
try
{
    await context.Database.MigrateAsync();
    await StoreContextSeed.SeedAsync(context);
}
catch(Exception ex)
{
    logger.LogError(ex, "An error occurred during migration");
}


app.Run();
