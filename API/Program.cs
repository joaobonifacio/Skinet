using API.Extensions;
using API.Middleware;
using Core.Entities.Identity;
using Infrastructure.Data;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

//EXTENSION METHOD
builder.Services.AddApplicationServices(builder.Configuration);

//IDENTITY EXTENSIONS
builder.Services.AddIdentityServices(builder.Configuration);

//SWAGGER EXTENSIONS
builder.Services.AddSwaggerDocumentation();

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

// app.UseSwagger();
// app.UseSwaggerUI();

app.UseSwaggerDocumentation();

//STATIC FILES
app.UseStaticFiles();

//CORS
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

//MIGRATION
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
var context = services.GetRequiredService<StoreContext>();

var identityContext = services.GetRequiredService<AppIdentityDbContext>();
var userManager = services.GetRequiredService<UserManager<AppUser>>();

var logger = services.GetRequiredService<ILogger<Program>>();

try
{
    await context.Database.MigrateAsync();
    
    await identityContext.Database.MigrateAsync();

    await StoreContextSeed.SeedAsync(context);

    await AppIdentityDbContextSeed.SeedUsersAsync(userManager);
}
catch(Exception ex)
{
    logger.LogError(ex, "An error occurred during migration");
}


app.Run();
