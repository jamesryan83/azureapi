using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;

namespace LogicExampleFn
{
    public class LogicExampleContext : DbContext
    {
        public LogicExampleContext(DbContextOptions<LogicExampleContext> options) : base(options)
        { }

        public DbSet<ExampleRow> ExampleData { get; set; }
    }

    public class ExampleRow
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class LogicExampleContextFactory : IDesignTimeDbContextFactory<LogicExampleContext>
    {
        public LogicExampleContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<LogicExampleContext>();
            optionsBuilder.UseSqlServer(Environment.GetEnvironmentVariable("SqlConnectionString"));

            return new LogicExampleContext(optionsBuilder.Options);
        }
    }
}
