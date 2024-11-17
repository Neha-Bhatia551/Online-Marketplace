using System;

namespace marketplace;


public class Product
{
    public int Id { get; set; }  // This will be auto-incremented by the database
    public string? Title { get; set;}
    public string? Description {get;set;}
    public decimal Rating{get;set;}
    public int Quantity {get;set;}
    public decimal Price {get;set;} 
    public decimal Discountpercentage {get;set;}

    public List<Image> Images { get; set; } = new List<Image>();


    public Product(string? title, string? description, decimal rating, int quantity, decimal price, decimal discountpercentage)
    {
        if(title.Length > 0){
            this.Title = title;
        }
        
        if(description.Length > 0){
            this.Description = description;
        }
        
        this.Rating = rating;
        this.Quantity = quantity;
        this.Price = price;
        this.Discountpercentage = discountpercentage;
    }
}
