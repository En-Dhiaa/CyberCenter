using System;
using System.Collections.Generic;
using CyberCenter.Contracts.Enums;

namespace CyberCenter.Contracts.DTOs;

public record ProductCategoryDto(
    Guid Id,
    string NameAr,
    string NameEn,
    string? Description,
    int ProductsCount
);

public record CreateCategoryRequestDto(
    string NameAr,
    string NameEn,
    string? Description
);

public record ProductDto(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string NameAr,
    string NameEn,
    string? Description,
    decimal Price,
    decimal Cost,
    int StockQuantity,
    bool IsAvailable,
    string? ImageUrl
);

public record CreateProductRequestDto(
    Guid CategoryId,
    string NameAr,
    string NameEn,
    string? Description,
    decimal Price,
    decimal Cost,
    int StockQuantity,
    bool IsAvailable = true
);

public record UpdateProductRequestDto(
    Guid CategoryId,
    string NameAr,
    string NameEn,
    string? Description,
    decimal Price,
    decimal Cost,
    int StockQuantity,
    bool IsAvailable
);

public record CreateOrderItemDto(
    Guid ProductId,
    int Quantity
);

public record CreateOrderRequestDto(
    Guid DeviceId,
    Guid? UserId,
    string? CustomerNotes,
    List<CreateOrderItemDto> Items
);

public record OrderItemDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);

public record OrderDetailsDto(
    Guid Id,
    string OrderNumber,
    Guid DeviceId,
    int DeviceNumber,
    string DeviceName,
    Guid? UserId,
    string? UserName,
    string Status,
    decimal TotalAmount,
    string? CustomerNotes,
    DateTime CreatedAtUtc,
    List<OrderItemDto> Items
);

public record UpdateOrderStatusRequestDto(
    OrderStatus Status
);
