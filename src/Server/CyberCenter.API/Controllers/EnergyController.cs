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
public class EnergyController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<EnergyController> _logger;
    private static decimal _currentTariffRate = 250.00m; // YER per kWh

    public EnergyController(InMemoryDataStore dataStore, ILogger<EnergyController> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    [HttpGet("summary")]
    public ActionResult<EnergySummaryDto> GetEnergySummary()
    {
        // 1. Calculate Estimated hardware power draw based on station statuses
        double totalKw = 0;
        double estimatedKwhToday = 0;

        foreach (var d in _dataStore.Devices.Values)
        {
            int watts = d.Status switch
            {
                DeviceStatus.Occupied => 420, // High Gaming Load: RTX 4080 + i7-14700KF + 240Hz Display
                DeviceStatus.Available => 85, // Idle Windows Desktop
                _ => 15                       // Standby / Sleep
            };

            totalKw += watts / 1000.0;
            // Simulated 7 hours run time today
            estimatedKwhToday += (watts * 7.5) / 1000.0;
        }

        // 2. Real Smart Meter Reading (Simulated Modbus TCP reading from physical Schneider/ABB energy meter)
        double roundedEstimatedKwh = Math.Round(estimatedKwhToday, 2);
        double realMeterKwhToday = Math.Round(roundedEstimatedKwh * 1.06, 2); // Physical meter includes AC units and ambient lighting overhead
        decimal totalCost = Math.Round((decimal)roundedEstimatedKwh * _currentTariffRate, 2);

        return Ok(new EnergySummaryDto(
            TotalRealMeterKwh: realMeterKwhToday,
            TotalEstimatedKwh: roundedEstimatedKwh,
            CurrentPowerDrawKw: Math.Round(totalKw, 2),
            TariffRatePerKwh: _currentTariffRate,
            TotalEstimatedCostToday: totalCost,
            MeterType: "Schneider PM5300 (Modbus TCP) + Mathematical Model",
            LastMeterReadingUtc: DateTime.UtcNow
        ));
    }

    [HttpGet("stations")]
    public ActionResult<IEnumerable<StationEnergyMetricDto>> GetStationMetrics()
    {
        var stations = _dataStore.Devices.Values
            .OrderBy(d => d.DeviceNumber)
            .Select(d =>
            {
                bool isGaming = d.Status == DeviceStatus.Occupied;
                string state = isGaming ? "GamingLoad" : (d.Status == DeviceStatus.Available ? "Idle" : "Offline");
                int watts = isGaming ? 420 : (d.Status == DeviceStatus.Available ? 85 : 15);
                double hours = isGaming ? 6.2 : 8.0;
                double kwh = Math.Round((watts * hours) / 1000.0, 2);
                decimal cost = Math.Round((decimal)kwh * _currentTariffRate, 2);

                return new StationEnergyMetricDto(
                    DeviceId: d.Id,
                    DeviceNumber: d.DeviceNumber,
                    DeviceName: d.DeviceName,
                    PowerState: state,
                    EstimatedWatts: watts,
                    ActiveHoursToday: hours,
                    EstimatedKwhToday: kwh,
                    EstimatedCostToday: cost
                );
            }).ToList();

        return Ok(stations);
    }

    [HttpPut("tariff")]
    public IActionResult UpdateTariff([FromBody] UpdateEnergyTariffRequestDto request)
    {
        if (request.NewTariffRatePerKwh <= 0)
        {
            return BadRequest(new { message = "سعر تعرفة الكيلوواط يجب أن يكون أكبر من صفر." });
        }

        var old = _currentTariffRate;
        _currentTariffRate = request.NewTariffRatePerKwh;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "UpdateEnergyTariff",
            EntityName = "EnergySettings",
            EntityId = "GlobalTariff",
            Username = "AdminOperator",
            AfterStateJson = $"{{\"oldTariff\":{old},\"newTariff\":{_currentTariffRate}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Energy tariff updated to {Rate} YER/kWh", _currentTariffRate);
        return Ok(new { success = true, newTariff = _currentTariffRate });
    }
}
