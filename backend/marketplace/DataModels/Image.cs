using System;

namespace marketplace;

public class Image {

    public int Id { get; set; }  // This will be auto-incremented by the database
    public string ImageUrl { get; set; }

    // Foreign key to Product
    public int ProductId { get; set; }
    public Product Product { get; set; } // Navigation property back to Product
}