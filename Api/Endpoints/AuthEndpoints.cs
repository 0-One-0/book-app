using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace Api.Endpoints;

public record AuthRequest(string Username, string Password);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");
        var hasher = new PasswordHasher<User>();

        group.MapPost("/register", async (AuthRequest req, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
                return Results.BadRequest("Användarnamn och lösenord krävs.");

            if (await db.Users.AnyAsync(u => u.Username == req.Username))
                return Results.Conflict("Användarnamnet är upptaget.");

            var user = new User { Username = req.Username };
            user.PasswordHash = hasher.HashPassword(user, req.Password);
            db.Users.Add(user);
            await db.SaveChangesAsync(); // nu har user fått ett Id

            db.Quotes.AddRange(StarterQuotes(user.Id));
            await db.SaveChangesAsync();

            return Results.Ok();
        });

        group.MapPost("/login", async (AuthRequest req, AppDbContext db, IConfiguration config) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);

            if (user is null ||
                hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password) == PasswordVerificationResult.Failed)
                return Results.Unauthorized();

            return Results.Ok(new { token = CreateToken(user, config["Jwt:Key"]!) });
        });
    }

    private static string CreateToken(User user, string key)
    {
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        return new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            ]),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
        });
    }

    // 5 startcitat som varje ny användare får. Byt gärna till dina egna favoriter!
    private static Quote[] StarterQuotes(int userId) =>
    [
        new() { Text = "Talk is cheap. Show me the code.", Author = "Linus Torvalds", UserId = userId },
        new() { Text = "Först löser du problemet, sedan skriver du koden.", Author = "John Johnson", UserId = userId },
        new() { Text = "Enkelhet är förutsättningen för tillförlitlighet.", Author = "Edsger Dijkstra", UserId = userId },
        new() { Text = "Det enda sättet att göra ett bra jobb är att älska det du gör.", Author = "Steve Jobs", UserId = userId },
        new() { Text = "Det verkar alltid omöjligt tills det är gjort.", Author = "Nelson Mandela", UserId = userId }
    ];
}
