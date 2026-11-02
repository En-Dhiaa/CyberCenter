using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CyberCenter.API.Hubs;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly IHubContext<DeviceHub, IDeviceClient>? _hubContext;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        InMemoryDataStore dataStore,
        IHubContext<DeviceHub, IDeviceClient>? hubContext,
        ILogger<OrdersController> logger)
    {
        _dataStore = dataStore;
        _hubContext = hubContext;
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<IEnumerable<OrderDetailsDto>> GetOrders([FromQuery] OrderStatus? status = null)
    {
        var query = _dataStore.Orders.Values.AsEnumerable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        var orders = query
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(MapToDetails)
            .ToList();

        return Ok(orders);
    }

    [HttpGet("kds")]
    public ActionResult<IEnumerable<OrderDetailsDto>> GetKdsOrders()
    {
        // KDS displays orders that are either New or Preparing, FIFO order
        var kdsOrders = _dataStore.Orders.Values
            .Where(o => o.Status == OrderStatus.New || o.Status == OrderStatus.Preparing)
            .OrderBy(o => o.CreatedAtUtc)
            .Select(MapToDetails)
            .ToList();

        return Ok(kdsOrders);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDetailsDto>> CreateOrder([FromBody] CreateOrderRequestDto request)
    {
        if (!_dataStore.Devices.TryGetValue(request.DeviceId, out var device))
        {
            return BadRequest(new { message = "المحطة المحددة غير موجودة." });
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(new { message = "يجب تحديد صنف واحد على الأقل في الطلب." });
        }

        var orderId = Guid.NewGuid();
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{_dataStore.Orders.Count + 1:D3}";
        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();

        foreach (var itemReq in request.Items)
        {
            if (!_dataStore.Products.TryGetValue(itemReq.ProductId, out var product) || product.IsDeleted)
            {
                return BadRequest(new { message = $"أحد الأصناف المطلوبة غير موجود في النظام." });
            }

            if (!product.IsAvailable)
            {
                return BadRequest(new { message = $"الصنف '{product.NameAr}' غير متاح حالياً." });
            }

            if (product.StockQuantity < itemReq.Quantity)
            {
                return BadRequest(new { message = $"الكمية المتبقية من '{product.NameAr}' ({product.StockQuantity}) لا تكفي للطلب ({itemReq.Quantity})." });
            }

            // Deduct stock
            product.StockQuantity -= itemReq.Quantity;

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                ProductId = product.Id,
                Product = product,
                Quantity = itemReq.Quantity,
                UnitPrice = product.Price,
                CreatedAtUtc = DateTime.UtcNow
            };

            totalAmount += orderItem.Subtotal;
            orderItems.Add(orderItem);
        }

        var order = new Order
        {
            Id = orderId,
            OrderNumber = orderNumber,
            DeviceId = device.Id,
            Device = device,
            UserId = request.UserId,
            Status = OrderStatus.New,
            TotalAmount = totalAmount,
            CustomerNotes = request.CustomerNotes?.Trim(),
            Items = orderItems,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.Orders.TryAdd(order.Id, order);

        // Audit Log
        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "CreateOrder",
            EntityName = "Order",
            EntityId = order.Id.ToString(),
            Username = $"Station-{device.DeviceNumber}",
            AfterStateJson = $"{{\"orderNumber\":\"{order.OrderNumber}\",\"total\":{order.TotalAmount},\"items\":{orderItems.Count}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        // Broadcast to Dashboard and KDS
        if (_hubContext != null)
        {
            await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(device.Id, device.Status);
        }

        _logger.LogInformation("Order {OrderNumber} placed for Station #{StationNum} with total {Total} YER.",
            order.OrderNumber, device.DeviceNumber, order.TotalAmount);

        return Ok(MapToDetails(order));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequestDto request)
    {
        if (!_dataStore.Orders.TryGetValue(id, out var order))
        {
            return NotFound(new { message = "الطلب غير موجود." });
        }

        var oldStatus = order.Status;
        order.Status = request.Status;
        order.UpdatedAtUtc = DateTime.UtcNow;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "UpdateOrderStatus",
            EntityName = "Order",
            EntityId = order.Id.ToString(),
            Username = "KitchenOperator",
            AfterStateJson = $"{{\"from\":\"{oldStatus}\",\"to\":\"{order.Status}\"}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        if (_hubContext != null)
        {
            await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(order.DeviceId, DeviceStatus.Occupied);
        }

        return Ok(MapToDetails(order));
    }

    private OrderDetailsDto MapToDetails(Order o)
    {
        var deviceNumber = o.Device?.DeviceNumber ?? 0;
        var deviceName = o.Device?.DeviceName ?? $"Station-{deviceNumber}";
        var userName = o.User?.FullName ?? (o.UserId.HasValue ? "مشترك" : "زائر المحطة");

        var items = o.Items.Select(i => new OrderItemDto(
            ProductId: i.ProductId,
            ProductName: i.Product?.NameAr ?? "صنف",
            Quantity: i.Quantity,
            UnitPrice: i.UnitPrice,
            Subtotal: i.Subtotal
        )).ToList();

        return new OrderDetailsDto(
            Id: o.Id,
            OrderNumber: o.OrderNumber,
            DeviceId: o.DeviceId,
            DeviceNumber: deviceNumber,
            DeviceName: deviceName,
            UserId: o.UserId,
            UserName: userName,
            Status: o.Status.ToString(),
            TotalAmount: o.TotalAmount,
            CustomerNotes: o.CustomerNotes,
            CreatedAtUtc: o.CreatedAtUtc,
            Items: items
        );
    }
}

