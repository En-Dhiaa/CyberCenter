using System;
using System.Collections.Generic;

namespace CyberCenter.Contracts.DTOs;

public record StationNetworkMetricDto(
    Guid DeviceId,
    int DeviceNumber,
    string DeviceName,
    double DownloadSpeedMbps,
    double UploadSpeedMbps,
    double TotalDownloadedGb,
    double TotalUploadedGb,
    int PingLatencyMs,
    bool IsThrottled,
    int? SpeedLimitMbps
);

public record RouterGatewayStatusDto(
    string GatewayModel, // e.g. "MikroTik CCR2004-16G-2S+"
    string RouterIp,
    string Status, // "Online", "Syncing", "Degraded"
    double TotalWanDownloadMbps,
    double TotalWanUploadMbps,
    int ActiveClientLeases,
    DateTime LastSyncUtc
);

public record ThrottleStationRequestDto(
    Guid DeviceId,
    int? LimitMbps // null to unthrottle
);

public record StationEnergyMetricDto(
    Guid DeviceId,
    int DeviceNumber,
    string DeviceName,
    string PowerState, // "GamingLoad", "Idle", "Offline"
    int EstimatedWatts,
    double ActiveHoursToday,
    double EstimatedKwhToday,
    decimal EstimatedCostToday
);

public record EnergySummaryDto(
    double TotalRealMeterKwh, // Actual measured smart meter reading
    double TotalEstimatedKwh, // Mathematically estimated hardware calculation
    double CurrentPowerDrawKw, // Total center load in kW
    decimal TariffRatePerKwh,  // Cost in YER per kWh
    decimal TotalEstimatedCostToday,
    string MeterType, // "SmartMeterModbusTCP" vs "MathematicalEstimation"
    DateTime LastMeterReadingUtc
);

public record UpdateEnergyTariffRequestDto(
    decimal NewTariffRatePerKwh
);

