using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using marketplace;
using marketplace.DataModels;
using System.Text.Json.Serialization;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
    builder =>
    {
        builder.WithOrigins("http://127.0.0.1")
        .AllowCredentials()
        .AllowAnyHeader()
        .SetIsOriginAllowed((host) => true)
        .AllowAnyMethod();
    });
});
builder.Services.AddAuthorization();
builder.Services.AddAuthentication("BasicAuthentication").AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>("BasicAuthentication", null);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("basic", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "basic",
        In = ParameterLocation.Header,
        Description = "Basic Authorization header using the Bearer scheme."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "basic"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");
var configuration = app.Configuration;
app.MapPost("/newUser", (PublicUsers user) =>
{
    try
    {
        using (UsersContext db = new UsersContext())
        {
            var existingUser = db.users.FirstOrDefault(u => u.Username.ToLower() == user.userName.ToLower());

            if (existingUser != null)
            {
                // Return error message if the username already exists
                return Results.BadRequest("Username already in use");
            }
            db.users.Add(user.GetPrivateUser());
            db.SaveChanges();
            db.Database.ExecuteSqlRaw("PRAGMA wal_checkpoint;");
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest(e.Message);
    }
    return Results.Ok("User created successfully");
}).WithName("Create New User").WithOpenApi();

app.MapPost("/login", (PublicUsers user) =>
{

    using (var db = new UsersContext())
    {
        var pu = db.users.FirstOrDefault(u => u.Username == user.userName);
        if (pu != null)
        {
            return Results.Ok(pu);
        }
        else
        {
            return Results.Unauthorized();
        }
    }

}).WithName("Login User").WithOpenApi().RequireAuthorization(new AuthorizeAttribute() { AuthenticationSchemes = "BasicAuthentication" });

app.MapGet("/reset", () =>
{
    using (var marketplace = new MarketplaceContext())
    {
        // Ensure the database is deleted and created again (clean start)
        marketplace.Database.EnsureDeleted();
        marketplace.Database.EnsureCreated();

        // Options for deserializing JSON data with case insensitivity
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Read and load items (products) from items.json
        using (StreamReader r = new StreamReader("items.json"))
        {
            string? json = r.ReadToEnd();
            List<Product> products = JsonSerializer.Deserialize<List<Product>>(json, options);

            // Read and load image URLs from images.json
            using (StreamReader rImages = new StreamReader("images.json"))
            {
                string? imagesJson = rImages.ReadToEnd();
                Dictionary<string, string> imageUrls = JsonSerializer.Deserialize<Dictionary<string, string>>(imagesJson, options);

                // For each product, associate images based on the "img" key
                foreach (var product in products)
                {
                    // Create a list of images for each product using the img reference from items.json
                    var imageUrl = imageUrls.FirstOrDefault(i => i.Key == product.Title).Value;  // Match by product title, or modify to match by another logic
                    if (imageUrl != null)
                    {
                        var image = new Image
                        {
                            ImageUrl = imageUrl
                        };
                        product.Images.Add(image); // Add the image to the product
                    }
                }

                // Add products and their images to the database
                marketplace.Products.AddRange(products);
                marketplace.SaveChanges();
            }
        }

        // Ensure all data is saved and the transaction is complete
        marketplace.Database.ExecuteSqlRaw("PRAGMA wal_checkpoint;");
    }

    return Results.Ok("Database has been reset and data loaded successfully.");
})
.WithName("Reset Data")
.WithOpenApi();


app.MapGet("/getItems", () =>
{
    var options = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull

    };
    //using (StreamReader r = new StreamReader("dummyData.json"))  
    using (MarketplaceContext marketplace = new MarketplaceContext())
    {
        List<Product> products = marketplace.Products.Include(p => p.Images).ToList();//OrderBy(t => t.Id).ToList();//JsonSerializer.Deserialize<List<Topic>>(json, options); 
        // Transform the products to include image URLs
        var result = products.Select(p => new
        {
            p.Id,
            p.Title,
            p.Description,
            p.Price,
            p.Discountpercentage,
            p.Quantity,
            p.Rating,
            Images = p.Images.Select(i => new { i.ImageUrl }).ToList()
        }).ToList();

        // Return the result as JSON
        return Results.Json(result, options);
    }
}).WithOpenApi().WithName("Get Items");

app.MapPost("/addProduct", (Product newProduct) =>
{
    try
    {
        using (var marketplace = new MarketplaceContext())
        {
            // Validate product inputs
            if (string.IsNullOrEmpty(newProduct.Title) || newProduct.Price <= 0 || newProduct.Quantity <= 0)
            {
                return Results.BadRequest("Invalid product data.");
            }

            // Create and add the product to the database
            marketplace.Products.Add(newProduct);
            marketplace.SaveChanges(); // Save to get the product ID (auto-incremented)

            return Results.Ok(new { message = "Product created successfully", productId = newProduct.Id });
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest($"Error: {e.Message}");
    }
}).WithName("Add New Product").WithOpenApi();

app.MapPost("/addToCart", (int userId, int productId, int quantity) =>
{
    try
    {
        using (var marketplace = new MarketplaceContext())
        {

            // Check if the user already has this product in their cart
            var existingCartItem = marketplace.Carts
                .FirstOrDefault(c => c.UserId == userId && c.ItemId == productId);

            if (existingCartItem != null)
            {
                // If the product is already in the cart, update the quantity
                existingCartItem.Quantity += quantity;
                marketplace.SaveChanges();
                return Results.Ok(new { message = "Cart updated successfully", cartItem = existingCartItem });
            }
            else
            {
                // If the product is not in the cart, add a new item
                var newCartItem = new Cart
                {
                    UserId = userId,
                    ItemId = productId,
                    Quantity = quantity
                };

                marketplace.Carts.Add(newCartItem);
                marketplace.SaveChanges();

                return Results.Ok(new { message = "Product added to cart successfully", cartItem = newCartItem });
            }
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest(new { message = $"Error: {e.Message}" });
    }
}).WithOpenApi().WithName("Add Item to Cart");

app.MapGet("/getCartItems/{userId}", (int userId) =>
{
    try
    {
        using (var marketplace = new MarketplaceContext())
        {
            // Get the cart items for the user along with product details
            var cartItems = marketplace.Carts
                .Where(c => c.UserId == userId)
                .ToList();

            if (cartItems.Count == 0)
            {
                return Results.NotFound(new { message = "No items found in cart for this user." });
            }
            var result = new List<object>();


            // Get the product details for each cart item    
            foreach (var cartItem in cartItems)
            {
                // For each cart item, fetch the product details by ProductId
                var product = marketplace.Products.Include(p => p.Images)
                    .FirstOrDefault(p => p.Id == cartItem.ItemId);

                if (product != null)
                {
                    // Add the cart item details and product details to the result list
                    result.Add(new
                    {
                        cartItem.Id,
                        cartItem.Quantity,
                        Product = new
                        {
                            product.Id,
                            product.Title,
                            product.Description,
                            product.Price,
                            product.Discountpercentage,
                            product.Rating,
                            Images = product.Images.Select(i => new { i.ImageUrl }).ToList()
                        }
                    });
                }
            }

            return Results.Ok(result);
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest(new { message = $"Error: {e.Message}" });
    }
}).WithOpenApi().WithName("Get Cart Items");

app.MapGet("/cartItemCount", (int userId) =>
{
    try
    {
        using (var marketplace = new MarketplaceContext())
        {
            // Count the number of items in the cart for the given userId
            var cartItemCount = marketplace.Carts
                .Where(c => c.UserId == userId)
                .Sum(c => c.Quantity); // Sum up the quantities of all items in the cart

            return Results.Ok(new { userId = userId, cartItemCount = cartItemCount });
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest(new { message = $"Error: {e.Message}" });
    }
}).WithOpenApi().WithName("Get Cart Item Count");

app.MapDelete("/removeFromCart", (int userId, int productId) =>
{
    try
    {
        using (var marketplace = new MarketplaceContext())
        {
            // Find the cart item for the given user and product
            var cartItem = marketplace.Carts
                .FirstOrDefault(c => c.UserId == userId && c.ItemId == productId);

            if (cartItem == null)
            {
                return Results.NotFound(new { message = "Item not found in cart." });
            }

            // Remove the cart item
            marketplace.Carts.Remove(cartItem);
            marketplace.SaveChanges();

            return Results.Ok(new { message = "Item removed from cart successfully." });
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest(new { message = $"Error: {e.Message}" });
    }
}).WithOpenApi().WithName("Remove Item from Cart");

app.MapDelete("/clearCart", (int userId) =>
{
    try
    {
        using (var marketplace = new MarketplaceContext())
        {
            // Find all cart items for the given user
            var cartItems = marketplace.Carts
                .Where(c => c.UserId == userId)
                .ToList();

            if (cartItems.Count == 0)
            {
                return Results.NotFound(new { message = "No items found in cart." });
            }

            // Remove all cart items
            marketplace.Carts.RemoveRange(cartItems);
            marketplace.SaveChanges();

            return Results.Ok(new { message = "All items removed from cart successfully." });
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest(new { message = $"Error: {e.Message}" });
    }
}).WithOpenApi().WithName("Clear All Items from Cart");

app.MapPut("/updateProduct/{productId}", (int productId, Product updatedProduct) =>
{
    try
    {
        using (var marketplace = new MarketplaceContext())
        {
            // Find the product by its ID
            var existingProduct = marketplace.Products
                .Include(p => p.Images)  // Ensure images are included for updating
                .FirstOrDefault(p => p.Id == productId);

            if (existingProduct == null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            // Validate the updated product data (if needed)
            if (string.IsNullOrEmpty(updatedProduct.Title) || updatedProduct.Price <= 0 || updatedProduct.Quantity <= 0)
            {
                return Results.BadRequest(new { message = "Invalid product data." });
            }

            // Update the product's basic properties
            existingProduct.Title = updatedProduct.Title;
            existingProduct.Description = updatedProduct.Description;
            existingProduct.Rating = updatedProduct.Rating;
            existingProduct.Quantity = updatedProduct.Quantity;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.Discountpercentage = updatedProduct.Discountpercentage;

            // Handle updating or adding images
            if (updatedProduct.Images != null && updatedProduct.Images.Any())
            {
                // Remove existing images that are not in the updated list
                var imagesToRemove = existingProduct.Images
                    .Where(i => !updatedProduct.Images.Any(ui => ui.Id == i.Id))
                    .ToList();
                marketplace.Images.RemoveRange(imagesToRemove);

                // Add or update images
                foreach (var updatedImage in updatedProduct.Images)
                {
                    var existingImage = existingProduct.Images
                        .FirstOrDefault(i => i.Id == updatedImage.Id);
                    
                    if (existingImage != null)
                    {
                        // Update the existing image if it exists
                        existingImage.ImageUrl = updatedImage.ImageUrl;
                    }
                    else
                    {
                        // Add new image if it's not already in the database
                        updatedImage.ProductId = existingProduct.Id;
                        marketplace.Images.Add(updatedImage);
                    }
                }
            }
            else
            {
                // If no images are provided, remove all images for the product
                marketplace.Images.RemoveRange(existingProduct.Images);
            }

            // Save changes to the database
            marketplace.SaveChanges();

            return Results.Ok(new { message = "Product updated successfully", productId = existingProduct.Id });
        }
    }
    catch (Exception e)
    {
        return Results.BadRequest(new { message = $"Error: {e.Message}" });
    }
}).WithOpenApi().WithName("Edit Product");

app.Run();

