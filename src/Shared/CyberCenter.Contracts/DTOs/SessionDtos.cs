using CyberCenter.Contracts.Enums;

namespace CyberCenter.Contracts.DTOs;

public record StartOpenSessionRequestDto(
    Guid DeviceId,
    string? Notes
);

public record StartCardSessionRequestDto(
    Guid DeviceId,
    string Pin
);

public record StartMemberSessionRequestDto(
    Guid DeviceId,
    string Username,
    string Password
);

public record ExtendSessionRequestDto(
    int AdditionalMinutes
);

public record TerminateSessionRequestDto(
    string Reason
);

public record SessionDetailsDto(
    Guid Id,
    Guid DeviceId,
    int DeviceNumber,
    string DeviceName,
    string SessionType,
    string Status,
    string? ActiveUserName,
    DateTime StartedAtUtc,
    DateTime? EndedAtUtc,
    int AllocatedMinutes,
    int ConsumedMinutes,
    int RemainingMinutes,
    decimal TotalCost
);

public record GenerateCardBatchRequestDto(
    string BatchName,
    int CardCount,
    int DurationMinutes,
    decimal PricePerCard,
    int ValidDays = 30
);

public record CardBatchDetailsDto(
    Guid Id,
    string BatchName,
    int CardCount,
    int DurationMinutes,
    decimal PricePerCard,
    decimal TotalValue,
    int UsedCardsCount,
    DateTime ExpiresAtUtc,
    DateTime CreatedAtUtc
);

public record TemporaryCardDetailsDto(
    Guid Id,
    Guid BatchId,
    string CardCodeMasked,
    int TotalDurationMinutes,
    int RemainingMinutes,
    string Status,
    DateTime ExpiresAtUtc,
    DateTime? FirstUsedAtUtc
);

public record CreateMemberRequestDto(
    string Username,
    string Password,
    string FullName,
    string? PhoneNumber,
    string? Email,
    decimal InitialDeposit = 0,
    int InitialMinutes = 0
);

public record RechargeMemberRequestDto(
    decimal Amount,
    int AdditionalMinutes,
    string PaymentMethod = "Cash",
    string? ReferenceNotes = null
);

public record GeneratedCardPinDto(
    Guid CardId,
    string MaskedCode,
    string CleartextPin,
    int DurationMinutes,
    decimal Price,
    DateTime ExpiresAtUtc
);

public record GenerateCardBatchResponseDto(
    Guid BatchId,
    string BatchName,
    int CardsGenerated,
    List<GeneratedCardPinDto> PrintableCards
);

public record MemberDetailsDto(
    Guid Id,
    string Username,
    string FullName,
    string? PhoneNumber,
    string? Email,
    decimal WalletBalance,
    int RemainingMinutes,
    bool IsActive,
    DateTime CreatedAtUtc
);
