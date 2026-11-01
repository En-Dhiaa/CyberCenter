using CyberCenter.API.Hubs;
using CyberCenter.Application.Services;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DevicesController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly IHubContext<DeviceHub, IDeviceClient> _hubContext;
    private readonly ILogger<DevicesController> _logger;

    public DevicesController(
        InMemoryDataStore dataStore,
        IHubContext<DeviceHub, IDeviceClient> hubContext,
        ILogger<DevicesController> logger)
    {
        _dataStore = dataStore;
        _hubContext = hubContext;
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Device>> GetAllDevices([FromQuery] string? group)
    {
        var query = _dataStore.Devices.Values.AsQueryable();

        if (!string.IsNullOrWhiteSpace(group) && group != "All")
        {
            query = query.Where(d => d.Group != null && d.Group.Name.Equals(group, StringComparison.OrdinalIgnoreCase));
        }

        var devices = query
            .OrderBy(d => d.DeviceNumber)
            .ToList();

        return Ok(devices);
    }

    [HttpGet("{id:guid}")]
    public ActionResult<Device> GetDevice(Guid id)
    {
        if (_dataStore.Devices.TryGetValue(id, out var device))
        {
            return Ok(device);
        }
        return NotFound(new { message = "المحطة غير مسجلة في المنظومة." });
    }

    [HttpGet("groups")]
    public ActionResult<IEnumerable<DeviceGroupDto>> GetDeviceGroups()
    {
        var groups = _dataStore.DeviceGroups.Values.Select(g => new DeviceGroupDto(
            Id: g.Id,
            Name: g.Name,
            Description: g.Description,
            DefaultHourlyRate: g.DefaultHourlyRate,
            DeviceCount: _dataStore.Devices.Values.Count(d => d.GroupId == g.Id)
        )).ToList();

        return Ok(groups);
    }

    [HttpPost("groups")]
    public IActionResult CreateDeviceGroup([FromBody] DeviceGroup group)
    {
        if (string.IsNullOrWhiteSpace(group.Name))
        {
            return BadRequest(new { message = "اسم مجموعة المحطات مطلوب." });
        }

        group.Id = Guid.NewGuid();
        _dataStore.DeviceGroups.TryAdd(group.Id, group);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "CreateDeviceGroup",
            EntityName = "DeviceGroup",
            EntityId = group.Id.ToString(),
            Username = "SuperAdmin",
            AfterStateJson = $"{{\"name\":\"{group.Name}\",\"rate\":{group.DefaultHourlyRate}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(group);
    }

    [HttpPost("heartbeat")]
    public async Task<IActionResult> PostHeartbeat([FromBody] DeviceHeartbeatDto heartbeat)
    {
        if (!_dataStore.Devices.TryGetValue(heartbeat.DeviceId, out var device))
        {
            // Auto-register discovered station
            device = new Device
            {
                Id = heartbeat.DeviceId,
                DeviceNumber = _dataStore.Devices.Count + 1,
                DeviceName = heartbeat.MachineName,
                MacAddress = heartbeat.MacAddress,
                IpAddress = heartbeat.IpAddress,
                Status = heartbeat.ReportedStatus,
                AgentVersion = heartbeat.AgentVersion,
                GpuTemperatureCelsius = heartbeat.GpuTemperatureCelsius,
                CpuTemperatureCelsius = heartbeat.CpuTemperatureCelsius,
                DiskFreeSpaceGb = heartbeat.DiskFreeSpaceGb,
                LastHeartbeatUtc = DateTime.UtcNow
            };
            _dataStore.Devices.TryAdd(device.Id, device);
        }
        else
        {
            var oldStatus = device.Status;
            device.IpAddress = heartbeat.IpAddress;
            device.Status = heartbeat.ReportedStatus;
            device.AgentVersion = heartbeat.AgentVersion;
            device.GpuTemperatureCelsius = heartbeat.GpuTemperatureCelsius;
            device.CpuTemperatureCelsius = heartbeat.CpuTemperatureCelsius;
            device.DiskFreeSpaceGb = heartbeat.DiskFreeSpaceGb;
            device.LastHeartbeatUtc = DateTime.UtcNow;

            if (oldStatus != device.Status)
            {
                // Broadcast status change to Admin Dashboard
                await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(device.Id, device.Status);
            }
        }

        return Ok(new { success = true, serverTimeUtc = DateTime.UtcNow });
    }

    [HttpPost("{id:guid}/command")]
    public async Task<ActionResult<RemoteCommandDto>> SendCommand(Guid id, [FromBody] SendDeviceCommandRequestDto request)
    {
        if (!_dataStore.Devices.TryGetValue(id, out var device))
        {
            return NotFound(new { message = "المحطة غير موجودة." });
        }

        // Generate cryptographically signed command
        var signedCommand = DeviceCommandSigner.CreateSignedCommand(
            deviceId: id,
            commandType: request.CommandType,
            payload: request.Payload,
            deviceSecretKey: device.SecretKey);

        // Update local device status if command alters state immediately
        if (request.CommandType == DeviceCommandType.LockStation)
        {
            device.Status = DeviceStatus.Locked;
            await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(id, DeviceStatus.Locked);
        }
        else if (request.CommandType == DeviceCommandType.UnlockStation)
        {
            device.Status = DeviceStatus.Available;
            await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(id, DeviceStatus.Available);
        }

        // Push command via SignalR to specific station group
        await _hubContext.Clients.Group($"Station_{id}").ReceiveCommand(signedCommand);

        // Log immutable audit entry
        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = $"Execute_{request.CommandType}",
            EntityName = "Device",
            EntityId = id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"command\":\"{request.CommandType}\",\"payload\":\"{request.Payload}\",\"nonce\":\"{signedCommand.Nonce}\"}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Dispatched signed command {Command} to Station #{Number} (Nonce: {Nonce})",
            request.CommandType, device.DeviceNumber, signedCommand.Nonce);

        return Ok(signedCommand);
    }

    [HttpPost("{id:guid}/message")]
    public async Task<IActionResult> SendMessageToStation(Guid id, [FromBody] SendDeviceMessageRequestDto request)
    {
        if (!_dataStore.Devices.TryGetValue(id, out var device))
        {
            return NotFound(new { message = "المحطة غير موجودة." });
        }

        var signedCommand = DeviceCommandSigner.CreateSignedCommand(
            deviceId: id,
            commandType: DeviceCommandType.DisplayMessage,
            payload: request.Message,
            deviceSecretKey: device.SecretKey);

        await _hubContext.Clients.Group($"Station_{id}").ReceiveCommand(signedCommand);
        await _hubContext.Clients.Group($"Station_{id}").DisplayNotification(request.Message, request.Level);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "SendMessageToStation",
            EntityName = "Device",
            EntityId = id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"message\":\"{request.Message}\",\"level\":\"{request.Level}\"}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new { success = true, message = $"تم إرسال الرسالة إلى المحطة #{device.DeviceNumber} بنجاح." });
    }

    [HttpPost("{id:guid}/reboot")]
    public async Task<IActionResult> RebootStation(Guid id)
    {
        return await SendCommandAction(id, DeviceCommandType.RestartComputer, "إعادة تشغيل المحطة");
    }

    [HttpPost("{id:guid}/shutdown")]
    public async Task<IActionResult> ShutdownStation(Guid id)
    {
        return await SendCommandAction(id, DeviceCommandType.ShutdownComputer, "إيقاف تشغيل المحطة");
    }

    private async Task<IActionResult> SendCommandAction(Guid id, DeviceCommandType type, string actionArabicName)
    {
        if (!_dataStore.Devices.TryGetValue(id, out var device))
        {
            return NotFound(new { message = "المحطة غير موجودة." });
        }

        var signedCommand = DeviceCommandSigner.CreateSignedCommand(id, type, null, device.SecretKey);
        await _hubContext.Clients.Group($"Station_{id}").ReceiveCommand(signedCommand);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = type.ToString(),
            EntityName = "Device",
            EntityId = id.ToString(),
            Username = "SuperAdmin",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new { success = true, message = $"تم إرسال أمر {actionArabicName} للمحطة #{device.DeviceNumber} بنجاح." });
    }
}
