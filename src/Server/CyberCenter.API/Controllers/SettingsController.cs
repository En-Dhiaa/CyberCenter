using CyberCenter.Contracts.DTOs;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private static SystemSettingsDto _currentSettings = new(
        CenterName: "CyberCenter Gaming Lounge",
        CenterPhone: "+967 770 000 000",
        Currency: "YER",
        DefaultHourlyRate: 500.00m,
        VipHourlyRate: 800.00m,
        OfflineGracePeriodMinutes: 5,
        WarningBeforeExpiryMinutes: 10,
        AllowGuestBrowsing: false
    );

    public SettingsController(InMemoryDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    [HttpGet]
    public ActionResult<SystemSettingsDto> GetSettings()
    {
        return Ok(_currentSettings);
    }

    [HttpPut]
    public ActionResult<SystemSettingsDto> UpdateSettings([FromBody] SystemSettingsDto updated)
    {
        _currentSettings = updated;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "UpdateSystemSettings",
            EntityName = "Settings",
            Username = "SuperAdmin",
            AfterStateJson = $"{{\"hourlyRate\":{updated.DefaultHourlyRate},\"graceMinutes\":{updated.OfflineGracePeriodMinutes}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(_currentSettings);
    }
}
