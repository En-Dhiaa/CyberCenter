using CyberCenter.Contracts.Enums;

namespace CyberCenter.Domain.Entities;

public class ProductCategory : BaseEntity
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product : BaseEntity
{
    public Guid CategoryId { get; set; }
    public ProductCategory? Category { get; set; }

    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal Cost { get; set; }
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? ImageUrl { get; set; }
}

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid DeviceId { get; set; }
    public Device? Device { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.New;
    public decimal TotalAmount { get; set; }
    public string? CustomerNotes { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal => Quantity * UnitPrice;
}

