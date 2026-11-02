using System;
using System.Collections.Generic;
using System.Linq;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class NetworkController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<NetworkController> _logger;
    private static readonly Dictionary<Guid, int?> _throttledLimits = new();

    public NetworkController(InMemoryDataStore dataStore, ILogger<NetworkController> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    [HttpGet("live")]
    public ActionResult<IEnumerable<StationNetworkMetricDto>> GetLiveStationMetrics()
    {
        var rand = new Random(42);
        var metrics = _dataStore.Devices.Values
            .OrderBy(d => d.DeviceNumber)
            .Select(d =>
            {
                bool isOccupied = d.Status == DeviceStatus.Occupied;
                _throttledLimits.TryGetValue(d.Id, out var limit);

                double down = isOccupied ? 25.0 + (d.DeviceNumber * 4.2) : 0.8;
                double up = isOccupied ? 6.5 + (d.DeviceNumber * 1.1) : 0.2;

                if (limit.HasValue && down > limit.Value)
                {
                    down = limit.Value;
                }

                return new StationNetworkMetricDto(
                    DeviceId: d.Id,
                    DeviceNumber: d.DeviceNumber,
                    DeviceName: d.DeviceName,
                    DownloadSpeedMbps: Math.Round(down, 1),
                    UploadSpeedMbps: Math.Round(up, 1),
                    TotalDownloadedGb: Math.Round(8.4 + (d.DeviceNumber * 2.3), 2),
                    TotalUploadedGb: Math.Round(1.8 + (d.DeviceNumber * 0.6), 2),
                    PingLatencyMs: isOccupied ? 4 : 2,
                    IsThrottled: limit.HasValue,
                    SpeedLimitMbps: limit
                );
            }).ToList();

        return Ok(metrics);
    }

    [HttpGet("router-status")]
    public ActionResult<RouterGatewayStatusDto> GetRouterStatus()
    {
        var metrics = _dataStore.Devices.Values.Where(d => d.Status == DeviceStatus.Occupied).Count();
        return Ok(new RouterGatewayStatusDto(
            GatewayModel: "MikroTik CCR2004-16G-2S+ (RouterOS v7.14)",
            RouterIp: "192.168.1.1",
            Status: "Online",
            TotalWanDownloadMbps: 184.6,
            TotalWanUploadMbps: 42.1,
            ActiveClientLeases: _dataStore.Devices.Count,
            LastSyncUtc: DateTime.UtcNow
        ));
    }

    [HttpPost("throttle")]
    public IActionResult ThrottleStation([FromBody] ThrottleStationRequestDto request)
    {
        if (!_dataStore.Devices.TryGetValue(request.DeviceId, out var device))
        {
            return NotFound(new { message = "المحطة غير موجودة." });
        }

        if (request.LimitMbps.HasValue && request.LimitMbps.Value <= 0)
        {
            return BadRequest(new { message = "يجب أن يكون سقف السرعة أكبر من صفر ميجابت/ث." });
        }

        _throttledLimits[device.Id] = request.LimitMbps;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "ThrottleStationBandwidth",
            EntityName = "Device",
            EntityId = device.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"station\":{device.DeviceNumber},\"limitMbps\":{request.LimitMbps}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Bandwidth limit for Station #{Number} set to {Limit} Mbps", device.DeviceNumber, request.LimitMbps);
        return Ok(new
        {
            success = true,
            message = request.LimitMbps.HasValue
                ? $"تم تقييد سرعة المحطة #{device.DeviceNumber} إلى {request.LimitMbps} Mbps."
                : $"تم إلغاء تقييد سرعة المحطة #{device.DeviceNumber}."
        });
    }
}

