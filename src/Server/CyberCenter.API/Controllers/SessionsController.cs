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
public class SessionsController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly SessionLeaseManager _leaseManager;
    private readonly IHubContext<DeviceHub, IDeviceClient> _hubContext;
    private readonly ILogger<SessionsController> _logger;

    public SessionsController(
        InMemoryDataStore dataStore,
        SessionLeaseManager leaseManager,
        IHubContext<DeviceHub, IDeviceClient> hubContext,
        ILogger<SessionsController> logger)
    {
        _dataStore = dataStore;
        _leaseManager = leaseManager;
        _hubContext = hubContext;
        _logger = logger;
    }

    [HttpGet("active")]
    public ActionResult<IEnumerable<SessionDetailsDto>> GetActiveSessions()
    {
        var active = _dataStore.Sessions.Values
            .Where(s => s.Status == SessionStatus.Active)
            .OrderByDescending(s => s.StartedAtUtc)
            .Select(MapToDetails)
            .ToList();

        return Ok(active);
    }

    [HttpGet("history")]
    public ActionResult<IEnumerable<SessionDetailsDto>> GetSessionHistory([FromQuery] int limit = 50)
    {
        var history = _dataStore.Sessions.Values
            .Where(s => s.Status != SessionStatus.Active)
            .OrderByDescending(s => s.EndedAtUtc ?? s.StartedAtUtc)
            .Take(limit)
            .Select(MapToDetails)
            .ToList();

        return Ok(history);
    }

    [HttpPost("start-open")]
    public async Task<ActionResult<SessionDetailsDto>> StartOpenSession([FromBody] StartOpenSessionRequestDto request)
    {
        if (!_dataStore.Devices.TryGetValue(request.DeviceId, out var device))
        {
            return NotFound(new { message = "المحطة غير موجودة." });
        }

        if (device.Status != DeviceStatus.Available)
        {
            return BadRequest(new { message = $"المحطة #{device.DeviceNumber} ليست متاحة حالياً (الحالة: {device.Status})." });
        }

        var session = new Session
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            Device = device,
            SessionType = SessionType.Open,
            Status = SessionStatus.Active,
            AllocatedSeconds = 0, // 0 indicates unlimited open session
            ConsumedSeconds = 0,
            StartedAtUtc = DateTime.UtcNow,
            TotalCost = 0.00m
        };

        _dataStore.Sessions.TryAdd(session.Id, session);

        // Update station state
        device.Status = DeviceStatus.Occupied;
        if (_hubContext != null)
        {
            await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(device.Id, DeviceStatus.Occupied);
        }

        // Issue signed lease token
        var lease = _leaseManager.CreateLease(session.Id, device.Id, 86400, 60, "عميل جلسة مفتوحة", SessionType.Open);
        var unlockCommand = DeviceCommandSigner.CreateSignedCommand(device.Id, DeviceCommandType.UnlockStation, null, device.SecretKey);
        if (_hubContext != null)
        {
            await _hubContext.Clients.Group($"Station_{device.Id}").ReceiveCommand(unlockCommand);
        }

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "StartOpenSession",
            EntityName = "Session",
            EntityId = session.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"stationNumber\":{device.DeviceNumber},\"type\":\"Open\"}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Open session started on Station #{Number} (Session ID: {SessionId})", device.DeviceNumber, session.Id);
        return Ok(MapToDetails(session));
    }

    [HttpPost("start-card")]
    public async Task<ActionResult<SessionDetailsDto>> StartCardSession([FromBody] StartCardSessionRequestDto request)
    {
        if (!_dataStore.Devices.TryGetValue(request.DeviceId, out var device))
        {
            return NotFound(new { message = "المحطة غير موجودة." });
        }

        if (device.Status != DeviceStatus.Available && device.Status != DeviceStatus.Locked)
        {
            return BadRequest(new { message = $"المحطة #{device.DeviceNumber} غير متاحة حالياً." });
        }

        var cleanPin = request.Pin.Trim();
        var card = _dataStore.TemporaryCards.Values.FirstOrDefault(c =>
            TemporaryCardSecurity.VerifyPin(cleanPin, c.BatchId.ToString("N"), c.PinHash));

        if (card == null)
        {
            return Unauthorized(new { message = "رمز الكرت (PIN) غير صحيح أو غير موجود." });
        }

        if (card.Status == TemporaryCardStatus.Depleted || card.RemainingSeconds <= 0)
        {
            return BadRequest(new { message = "رصيد هذا الكرت مستهلك بالكامل." });
        }

        if (card.Status == TemporaryCardStatus.Expired || DateTime.UtcNow > card.ExpiresAtUtc)
        {
            card.Status = TemporaryCardStatus.Expired;
            return BadRequest(new { message = "صلاحية هذا الكرت منتهية." });
        }

        if (card.Status == TemporaryCardStatus.Active)
        {
            return BadRequest(new { message = "هذا الكرت قيد الاستخدام حالياً على محطة أخرى." });
        }

        // Activate Card & Session
        card.Status = TemporaryCardStatus.Active;
        card.FirstUsedAtUtc ??= DateTime.UtcNow;

        var session = new Session
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            Device = device,
            TemporaryCardId = card.Id,
            TemporaryCard = card,
            SessionType = SessionType.TemporaryCard,
            Status = SessionStatus.Active,
            AllocatedSeconds = card.RemainingSeconds,
            ConsumedSeconds = 0,
            StartedAtUtc = DateTime.UtcNow
        };

        _dataStore.Sessions.TryAdd(session.Id, session);
        device.Status = DeviceStatus.Occupied;

        if (_hubContext != null)
        {
            await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(device.Id, DeviceStatus.Occupied);
        }

        // Unlock station & dispatch lease
        var unlockCommand = DeviceCommandSigner.CreateSignedCommand(device.Id, DeviceCommandType.UnlockStation, null, device.SecretKey);
        if (_hubContext != null)
        {
            await _hubContext.Clients.Group($"Station_{device.Id}").ReceiveCommand(unlockCommand);
        }

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "StartCardSession",
            EntityName = "Session",
            EntityId = session.Id.ToString(),
            Username = card.CardCodeMasked,
            AfterStateJson = $"{{\"station\":{device.DeviceNumber},\"card\":\"{card.CardCodeMasked}\",\"remainingSeconds\":{card.RemainingSeconds}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(MapToDetails(session));
    }

    [HttpPost("{id:guid}/extend")]
    public async Task<IActionResult> ExtendSession(Guid id, [FromBody] ExtendSessionRequestDto request)
    {
        if (!_dataStore.Sessions.TryGetValue(id, out var session) || session.Status != SessionStatus.Active)
        {
            return NotFound(new { message = "الجلسة غير موجودة أو ليست نشطة." });
        }

        var additionalSeconds = request.AdditionalMinutes * 60;
        session.AllocatedSeconds += additionalSeconds;

        if (session.TemporaryCard != null)
        {
            session.TemporaryCard.RemainingSeconds += additionalSeconds;
        }

        if (_dataStore.Devices.TryGetValue(session.DeviceId, out var device))
        {
            var msgCommand = DeviceCommandSigner.CreateSignedCommand(
                device.Id,
                DeviceCommandType.DisplayMessage,
                $"تم تمديد وقت الجلسة بنجاح: +{request.AdditionalMinutes} دقيقة",
                device.SecretKey);
            if (_hubContext != null)
            {
                await _hubContext.Clients.Group($"Station_{device.Id}").ReceiveCommand(msgCommand);
            }
        }

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "ExtendSession",
            EntityName = "Session",
            EntityId = session.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"extendedMinutes\":{request.AdditionalMinutes}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new { success = true, message = $"تم تمديد الجلسة +{request.AdditionalMinutes} دقيقة بنجاح.", updated = MapToDetails(session) });
    }

    [HttpPost("{id:guid}/terminate")]
    public async Task<IActionResult> TerminateSession(Guid id, [FromBody] TerminateSessionRequestDto request)
    {
        if (!_dataStore.Sessions.TryGetValue(id, out var session) || session.Status != SessionStatus.Active)
        {
            return NotFound(new { message = "الجلسة غير موجودة أو منتهية مسبقاً." });
        }

        session.Status = SessionStatus.Completed;
        session.EndedAtUtc = DateTime.UtcNow;
        session.EndReason = request.Reason;

        // Calculate consumed time
        var duration = (int)(session.EndedAtUtc.Value - session.StartedAtUtc).TotalSeconds;
        session.ConsumedSeconds = duration;

        // Calculate cost for Open Sessions
        if (session.SessionType == SessionType.Open)
        {
            var hourlyRate = session.Device?.CustomHourlyRate ?? session.Device?.Group?.DefaultHourlyRate ?? 500.00m;
            var hours = duration / 3600.0m;
            session.TotalCost = Math.Round(hours * hourlyRate, 2);
        }

        // Release card if temporary
        if (session.TemporaryCard != null)
        {
            session.TemporaryCard.RemainingSeconds = Math.Max(0, session.TemporaryCard.RemainingSeconds - duration);
            session.TemporaryCard.Status = session.TemporaryCard.RemainingSeconds > 0
                ? TemporaryCardStatus.Unused
                : TemporaryCardStatus.Depleted;
        }

        // Lock station and mark Available
        if (_dataStore.Devices.TryGetValue(session.DeviceId, out var device))
        {
            device.Status = DeviceStatus.Available;
            if (_hubContext != null)
            {
                await _hubContext.Clients.Group("AdminDashboard").StationStatusUpdated(device.Id, DeviceStatus.Available);

                var lockCommand = DeviceCommandSigner.CreateSignedCommand(device.Id, DeviceCommandType.LockStation, "End of Session", device.SecretKey);
                await _hubContext.Clients.Group($"Station_{device.Id}").ReceiveCommand(lockCommand);
            }
        }

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "TerminateSession",
            EntityName = "Session",
            EntityId = session.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"reason\":\"{request.Reason}\",\"cost\":{session.TotalCost},\"durationSec\":{duration}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new { success = true, message = "تم إنهاء الجلسة بنجاح وتأمين المحطة.", session = MapToDetails(session) });
    }

    private SessionDetailsDto MapToDetails(Session s)
    {
        var deviceNumber = s.Device?.DeviceNumber ?? 0;
        var deviceName = s.Device?.DeviceName ?? $"Station-{deviceNumber}";
        var activeUser = s.User?.FullName ?? (s.TemporaryCard != null ? s.TemporaryCard.CardCodeMasked : "جلسة مفتوحة");

        var durationSec = s.EndedAtUtc.HasValue
            ? (int)(s.EndedAtUtc.Value - s.StartedAtUtc).TotalSeconds
            : (int)(DateTime.UtcNow - s.StartedAtUtc).TotalSeconds;

        var allocatedMin = s.AllocatedSeconds / 60;
        var consumedMin = durationSec / 60;
        var remainingMin = s.AllocatedSeconds > 0 ? Math.Max(0, allocatedMin - consumedMin) : 0;

        return new SessionDetailsDto(
            Id: s.Id,
            DeviceId: s.DeviceId,
            DeviceNumber: deviceNumber,
            DeviceName: deviceName,
            SessionType: s.SessionType.ToString(),
            Status: s.Status.ToString(),
            ActiveUserName: activeUser,
            StartedAtUtc: s.StartedAtUtc,
            EndedAtUtc: s.EndedAtUtc,
            AllocatedMinutes: allocatedMin,
            ConsumedMinutes: consumedMin,
            RemainingMinutes: remainingMin,
            TotalCost: s.TotalCost
        );
    }
}
