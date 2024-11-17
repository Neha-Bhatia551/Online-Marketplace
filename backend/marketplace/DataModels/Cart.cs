public class Cart
{
    public int Id { get; set; } // Unique identifier for each cart entry
    public int UserId { get; set; } // ID of the user who owns the cart
    public int ItemId { get; set; } // ID of the product in the cart
    public int Quantity { get; set; }

}