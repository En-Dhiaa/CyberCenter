using System;
using System.Collections.Generic;
using System.Linq;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(InMemoryDataStore dataStore, ILogger<ProductsController> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    [HttpGet("categories")]
    public ActionResult<IEnumerable<ProductCategoryDto>> GetCategories()
    {
        var categories = _dataStore.ProductCategories.Values
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.NameAr)
            .Select(c => new ProductCategoryDto(
                Id: c.Id,
                NameAr: c.NameAr,
                NameEn: c.NameEn,
                Description: c.Description,
                ProductsCount: _dataStore.Products.Values.Count(p => p.CategoryId == c.Id && !p.IsDeleted)
            )).ToList();

        return Ok(categories);
    }

    [HttpPost("categories")]
    public IActionResult CreateCategory([FromBody] CreateCategoryRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.NameAr))
        {
            return BadRequest(new { message = "اسم التصنيف بالعربية إلزامي." });
        }

        var category = new ProductCategory
        {
            Id = Guid.NewGuid(),
            NameAr = request.NameAr.Trim(),
            NameEn = string.IsNullOrWhiteSpace(request.NameEn) ? request.NameAr.Trim() : request.NameEn.Trim(),
            Description = request.Description?.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.ProductCategories.TryAdd(category.Id, category);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "CreateProductCategory",
            EntityName = "ProductCategory",
            EntityId = category.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"name\":\"{category.NameAr}\"}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new ProductCategoryDto(
            category.Id,
            category.NameAr,
            category.NameEn,
            category.Description,
            0
        ));
    }

    [HttpGet]
    public ActionResult<IEnumerable<ProductDto>> GetProducts([FromQuery] Guid? categoryId = null)
    {
        var query = _dataStore.Products.Values.Where(p => !p.IsDeleted);

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        var products = query
            .OrderBy(p => p.NameAr)
            .Select(MapToDto)
            .ToList();

        return Ok(products);
    }

    [HttpPost]
    public IActionResult CreateProduct([FromBody] CreateProductRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.NameAr) || request.Price <= 0)
        {
            return BadRequest(new { message = "اسم المنتج وسعر البيع حقول إلزامية وصحيحة." });
        }

        if (!_dataStore.ProductCategories.TryGetValue(request.CategoryId, out var category))
        {
            return BadRequest(new { message = "التصنيف المحدد غير موجود." });
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Category = category,
            NameAr = request.NameAr.Trim(),
            NameEn = string.IsNullOrWhiteSpace(request.NameEn) ? request.NameAr.Trim() : request.NameEn.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            Cost = request.Cost,
            StockQuantity = request.StockQuantity,
            IsAvailable = request.IsAvailable,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.Products.TryAdd(product.Id, product);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "CreateProduct",
            EntityName = "Product",
            EntityId = product.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"name\":\"{product.NameAr}\",\"price\":{product.Price},\"stock\":{product.StockQuantity}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Product {NameAr} created successfully (Price: {Price})", product.NameAr, product.Price);
        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, MapToDto(product));
    }

    [HttpPut("{id:guid}")]
    public IActionResult UpdateProduct(Guid id, [FromBody] UpdateProductRequestDto request)
    {
        if (!_dataStore.Products.TryGetValue(id, out var product) || product.IsDeleted)
        {
            return NotFound(new { message = "المنتج غير موجود." });
        }

        product.CategoryId = request.CategoryId;
        product.NameAr = request.NameAr.Trim();
        product.NameEn = request.NameEn.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.Cost = request.Cost;
        product.StockQuantity = request.StockQuantity;
        product.IsAvailable = request.IsAvailable;
        product.UpdatedAtUtc = DateTime.UtcNow;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "UpdateProduct",
            EntityName = "Product",
            EntityId = product.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"name\":\"{product.NameAr}\",\"price\":{product.Price},\"stock\":{product.StockQuantity}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(MapToDto(product));
    }

    [HttpDelete("{id:guid}")]
    public IActionResult DeleteProduct(Guid id)
    {
        if (!_dataStore.Products.TryGetValue(id, out var product) || product.IsDeleted)
        {
            return NotFound(new { message = "المنتج غير موجود." });
        }

        product.IsDeleted = true;
        product.UpdatedAtUtc = DateTime.UtcNow;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "DeleteProduct",
            EntityName = "Product",
            EntityId = product.Id.ToString(),
            Username = "AdminOperator",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new { success = true, message = "تم حذف المنتج بنجاح." });
    }

    private ProductDto MapToDto(Product p)
    {
        var categoryName = _dataStore.ProductCategories.TryGetValue(p.CategoryId, out var cat) ? cat.NameAr : "عام";
        return new ProductDto(
            Id: p.Id,
            CategoryId: p.CategoryId,
            CategoryName: categoryName,
            NameAr: p.NameAr,
            NameEn: p.NameEn,
            Description: p.Description,
            Price: p.Price,
            Cost: p.Cost,
            StockQuantity: p.StockQuantity,
            IsAvailable: p.IsAvailable,
            ImageUrl: p.ImageUrl
        );
    }
}

