using CyberCenter.Contracts.Enums;

namespace CyberCenter.Contracts.DTOs;

public record SendDeviceCommandRequestDto(
    DeviceCommandType CommandType,
    string? Payload
);

public record SendDeviceMessageRequestDto(
    string Message,
    string Level = "Info" // Info, Warning, Urgent
);

public record DeviceGroupDto(
    Guid Id,
    string Name,
    string? Description,
    decimal DefaultHourlyRate,
    int DeviceCount
);

public record DeviceMetricsDto(
    Guid DeviceId,
    double CpuUsagePercentage,
    double RamUsagePercentage,
    double DownloadSpeedMbps,
    double UploadSpeedMbps,
    long SessionConsumedBytes,
    DateTime SampledAtUtc
);
