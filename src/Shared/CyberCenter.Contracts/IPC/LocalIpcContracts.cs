using System;

namespace CyberCenter.Contracts.IPC;

public enum StationScreenMode
{
    LockedWelcome,
    ActiveSession,
    PausedSession
}

public record StationSessionStateDto(
    bool IsSessionActive,
    StationScreenMode Mode,
    Guid? SessionId,
    string? SessionType, // "Open", "TemporaryCard", "Member"
    string? DisplayName,
    int RemainingSeconds,
    int ConsumedSeconds,
    decimal AccruedCost,
    decimal WalletBalance,
    string? StationName,
    int StationNumber,
    string? AnnouncementMessage
);

public record StationLoginRequestDto(
    string LoginType, // "CardPin" or "MemberCredentials"
    string? CardPin,
    string? MemberUsername,
    string? MemberPassword
);

public record StationLoginResponseDto(
    bool Success,
    string? ErrorMessage,
    StationSessionStateDto? SessionState
);

public record StationOrderRequestDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    string? Notes
);

