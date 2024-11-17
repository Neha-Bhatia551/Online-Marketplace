using System;
using Microsoft.EntityFrameworkCore;
using marketplace.DataModels;


namespace marketplace;

public class UsersContext : DbContext
{
    public DbSet<PrivateUsers> users {get;set;}

    public UsersContext(){
        
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source=users.db");
}
