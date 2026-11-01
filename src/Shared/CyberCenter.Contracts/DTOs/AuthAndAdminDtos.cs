namespace CyberCenter.Contracts.DTOs;

public record LoginRequestDto(
    string Username,
    string Password
);

public record LoginResponseDto(
    string Token,
    Guid UserId,
    string Username,
    string FullName,
    string UserType,
    DateTime ExpiresAtUtc
);

public record CreateEmployeeRequestDto(
    string Username,
    string Password,
    string FullName,
    string? Email,
    string? PhoneNumber,
    string UserType
);

public record UpdateEmployeeRequestDto(
    string FullName,
    string? Email,
    string? PhoneNumber,
    string UserType,
    bool IsActive
);

public record SystemSettingsDto(
    string CenterName,
    string CenterPhone,
    string Currency,
    decimal DefaultHourlyRate,
    decimal VipHourlyRate,
    int OfflineGracePeriodMinutes,
    int WarningBeforeExpiryMinutes,
    bool AllowGuestBrowsing
);

