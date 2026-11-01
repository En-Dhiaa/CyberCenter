using CyberCenter.Contracts.Enums;

namespace CyberCenter.Domain.Entities;

public class CardBatch : BaseEntity
{
    public string BatchName { get; set; } = string.Empty;
    public int CardCount { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public Guid CreatedByUserId { get; set; }
    public ICollection<TemporaryCard> Cards { get; set; } = new List<TemporaryCard>();
}

public class TemporaryCard : BaseEntity
{
    public Guid BatchId { get; set; }
    public CardBatch? Batch { get; set; }

    public string CardCodeMasked { get; set; } = string.Empty;
    public string PinHash { get; set; } = string.Empty;
    public int TotalDurationSeconds { get; set; }
    public int RemainingSeconds { get; set; }
    public TemporaryCardStatus Status { get; set; } = TemporaryCardStatus.Unused;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? FirstUsedAtUtc { get; set; }

    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}

public class Session : BaseEntity
{
    public Guid DeviceId { get; set; }
    public Device? Device { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? TemporaryCardId { get; set; }
    public TemporaryCard? TemporaryCard { get; set; }

    public SessionType SessionType { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.Active;

    public DateTime StartedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAtUtc { get; set; }

    public int AllocatedSeconds { get; set; }
    public int ConsumedSeconds { get; set; } = 0;
    public decimal TotalCost { get; set; } = 0.00m;
    public string? EndReason { get; set; }
}

