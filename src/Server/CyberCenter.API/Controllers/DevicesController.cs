using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DevicesController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<DevicesController> _logger;

    public DevicesController(InMemoryDataStore dataStore, ILogger<DevicesController> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Device>> GetAllDevices()
    {
        var devices = _dataStore.Devices.Values
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
        return NotFound();
    }

    [HttpPost("heartbeat")]
    public IActionResult PostHeartbeat([FromBody] DeviceHeartbeatDto heartbeat)
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
                LastHeartbeatUtc = DateTime.UtcNow
            };
            _dataStore.Devices.TryAdd(device.Id, device);
        }
        else
        {
            device.IpAddress = heartbeat.IpAddress;
            device.Status = heartbeat.ReportedStatus;
            device.AgentVersion = heartbeat.AgentVersion;
            device.LastHeartbeatUtc = DateTime.UtcNow;
        }

        return Ok(new { success = true, serverTimeUtc = DateTime.UtcNow });
    }

    [HttpPost("{id:guid}/lock")]
    public IActionResult LockStation(Guid id)
    {
        if (!_dataStore.Devices.TryGetValue(id, out var device))
        {
            return NotFound();
        }

        device.Status = DeviceStatus.Locked;
        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "LockStation",
            EntityName = "Device",
            EntityId = id.ToString(),
            Username = "SuperAdmin",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogWarning("Station #{Number} locked by SuperAdmin.", device.DeviceNumber);
        return Ok(new { success = true, message = $"Station #{device.DeviceNumber} locked successfully." });
    }

    [HttpPost("{id:guid}/unlock")]
    public IActionResult UnlockStation(Guid id)
    {
        if (!_dataStore.Devices.TryGetValue(id, out var device))
        {
            return NotFound();
        }

        device.Status = DeviceStatus.Available;
        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "UnlockStation",
            EntityName = "Device",
            EntityId = id.ToString(),
            Username = "SuperAdmin",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Station #{Number} unlocked by SuperAdmin.", device.DeviceNumber);
        return Ok(new { success = true, message = $"Station #{device.DeviceNumber} unlocked successfully." });
    }
}
