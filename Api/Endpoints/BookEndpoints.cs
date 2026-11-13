using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints;

public static class BookEndpoints
{
    public static void MapBookEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/books").RequireAuthorization();

        group.MapGet("/", async (AppDbContext db) =>
            await db.Books.ToListAsync());

        group.MapGet("/{id}", async (int id, AppDbContext db) =>
            await db.Books.FindAsync(id) is Book book
                ? Results.Ok(book)
                : Results.NotFound());

        group.MapPost("/", async (Book book, AppDbContext db) =>
        {
            db.Books.Add(book);
            await db.SaveChangesAsync();
            return Results.Created($"/api/books/{book.Id}", book);
        });

        group.MapPut("/{id}", async (int id, Book input, AppDbContext db) =>
        {
            var book = await db.Books.FindAsync(id);
            if (book is null) return Results.NotFound();

            book.Title = input.Title;
            book.Author = input.Author;
            book.PublishedDate = input.PublishedDate;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id}", async (int id, AppDbContext db) =>
        {
            var book = await db.Books.FindAsync(id);
            if (book is null) return Results.NotFound();

            db.Books.Remove(book);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}