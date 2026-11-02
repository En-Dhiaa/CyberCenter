using System;

namespace CyberCenter.Contracts.DTOs;

public record FinancialTransactionDto(
    Guid Id,
    string TransactionNumber,
    string TransactionType,
    decimal Amount,
    string Description,
    bool IsReversed,
    DateTime CreatedAtUtc
);

public record FinancialSummaryDto(
    decimal TotalGrossRevenue,
    decimal TotalSessionsRevenue,
    decimal TotalStoreRevenue,
    decimal TotalMembershipDeposits,
    decimal TotalExpenses,
    decimal NetProfit,
    decimal CashBalance,
    decimal ElectronicWalletsBalance
);

public record ExpenseDto(
    Guid Id,
    string ExpenseNumber,
    string Category,
    decimal Amount,
    string Description,
    string SpentBy,
    string PaymentMethod,
    string? ReceiptRef,
    DateTime CreatedAtUtc
);

public record CreateExpenseRequestDto(
    string Category,
    decimal Amount,
    string Description,
    string SpentBy,
    string PaymentMethod = "Cash",
    string? ReceiptRef = null
);

public record MonthlyClosingDto(
    Guid Id,
    int Year,
    int Month,
    decimal TotalSessionsRevenue,
    decimal TotalStoreRevenue,
    decimal TotalMembershipDeposits,
    decimal TotalGrossRevenue,
    decimal TotalExpenses,
    decimal NetProfit,
    string Status,
    string? ApprovedByUserName,
    DateTime? ApprovedAtUtc,
    string? Notes,
    DateTime CreatedAtUtc
);

public record LockMonthlyClosingRequestDto(
    int Year,
    int Month,
    string? Notes
);

