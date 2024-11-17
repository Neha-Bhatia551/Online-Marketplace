using System;
using Microsoft.EntityFrameworkCore;
using marketplace.DataModels;


namespace marketplace;

public class MarketplaceContext : DbContext
{
    public DbSet<Product> Products { get; set; }
    public DbSet<Image> Images { get; set; }
    public DbSet<Cart> Carts { get; set; }

    public MarketplaceContext()
    {

    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Define the relationship between Product and Image
        modelBuilder.Entity<Image>()
            .HasOne(i => i.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.ProductId);

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(c => c.Id); // Primary key for Cart table

            entity.HasOne<Product>()
                .WithMany()
                .HasForeignKey(c => c.ItemId)
                .OnDelete(DeleteBehavior.Cascade); // Optional: Cascade delete cart items if product is removed

        });
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source=marketplace.db");


}
