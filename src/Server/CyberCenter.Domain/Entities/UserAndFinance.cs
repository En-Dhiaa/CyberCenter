namespace CyberCenter.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string UserType { get; set; } = "Staff"; // SuperAdmin, Admin, Member, Staff
    public decimal WalletBalance { get; set; } = 0.00m;
    public int RemainingSeconds { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}

public class FinancialTransaction : BaseEntity
{
    public string TransactionNumber { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty; // SessionRevenue, StoreRevenue, Deposit, Expense, Reversal
    public decimal Amount { get; set; }
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsReversed { get; set; } = false;
    public Guid? ReversalRefId { get; set; }
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? BeforeStateJson { get; set; }
    public string? AfterStateJson { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

