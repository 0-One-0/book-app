using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Endpoints;

public record QuoteRequest(string Text, string Author);

public static class QuoteEndpoints
{
    public static void MapQuoteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/quotes").RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);
            return await db.Quotes.Where(q => q.UserId == userId).ToListAsync();
        });

        group.MapPost("/", async (QuoteRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var quote = new Quote { Text = req.Text, Author = req.Author, UserId = GetUserId(user) };
            db.Quotes.Add(quote);
            await db.SaveChangesAsync();
            return Results.Created($"/api/quotes/{quote.Id}", quote);
        });

        group.MapPut("/{id}", async (int id, QuoteRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);
            var quote = await db.Quotes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
            if (quote is null) return Results.NotFound();

            quote.Text = req.Text;
            quote.Author = req.Author;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);
            var quote = await db.Quotes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
            if (quote is null) return Results.NotFound();

            db.Quotes.Remove(quote);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    // Hämtar användarens id från token (claimen vi satte vid login)
    private static int GetUserId(ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
}