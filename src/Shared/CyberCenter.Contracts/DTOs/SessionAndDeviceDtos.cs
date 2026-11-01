using CyberCenter.Contracts.Enums;

namespace CyberCenter.Contracts.DTOs;

public record SessionLeaseDto(
    Guid SessionId,
    Guid DeviceId,
    DateTime LeaseExpiresAtUtc,
    int RemainingTotalSeconds,
    string Signature,
    string? ActiveUserName,
    SessionType SessionType
);

public record DeviceHeartbeatDto(
    Guid DeviceId,
    string MachineName,
    string IpAddress,
    string MacAddress,
    DeviceStatus ReportedStatus,
    double CpuUsagePercentage,
    double RamUsagePercentage,
    double DownloadSpeedMbps,
    double UploadSpeedMbps,
    long SessionConsumedBytes,
    string AgentVersion,
    double GpuTemperatureCelsius = 54.0,
    double CpuTemperatureCelsius = 48.0,
    double DiskFreeSpaceGb = 420.0
);

public record RemoteCommandDto(
    Guid CommandId,
    Guid DeviceId,
    DeviceCommandType CommandType,
    string? Payload,
    string Nonce,
    string Signature,
    DateTime IssuedAtUtc
);

