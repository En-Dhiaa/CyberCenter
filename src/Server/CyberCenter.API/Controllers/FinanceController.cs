using System;
using System.Collections.Generic;
using System.Linq;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class FinanceController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<FinanceController> _logger;

    public FinanceController(InMemoryDataStore dataStore, ILogger<FinanceController> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    [HttpGet("transactions")]
    public ActionResult<IEnumerable<FinancialTransactionDto>> GetTransactions([FromQuery] string? type = null)
    {
        var query = _dataStore.FinancialTransactions.Values.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(t => t.TransactionType.Equals(type, StringComparison.OrdinalIgnoreCase));
        }

        var txns = query
            .OrderByDescending(t => t.CreatedAtUtc)
            .Select(t => new FinancialTransactionDto(
                Id: t.Id,
                TransactionNumber: t.TransactionNumber,
                TransactionType: t.TransactionType,
                Amount: t.Amount,
                Description: t.Description,
                IsReversed: t.IsReversed,
                CreatedAtUtc: t.CreatedAtUtc
            )).ToList();

        return Ok(txns);
    }

    [HttpGet("summary")]
    public ActionResult<FinancialSummaryDto> GetSummary()
    {
        var validTxns = _dataStore.FinancialTransactions.Values.Where(t => !t.IsReversed).ToList();

        var sessionsRevenue = validTxns.Where(t => t.TransactionType == "SessionRevenue").Sum(t => t.Amount);
        var storeRevenue = validTxns.Where(t => t.TransactionType == "StoreRevenue").Sum(t => t.Amount);
        var membershipDeposits = validTxns.Where(t => t.TransactionType == "MembershipDeposit" || t.TransactionType == "MembershipRecharge").Sum(t => t.Amount);
        var grossRevenue = sessionsRevenue + storeRevenue + membershipDeposits;

        var totalExpenses = _dataStore.Expenses.Values.Sum(e => e.Amount);
        var netProfit = grossRevenue - totalExpenses;

        // Breakdown: Cash vs Electronic
        var cashExpenses = _dataStore.Expenses.Values.Where(e => e.PaymentMethod == "Cash").Sum(e => e.Amount);
        var cashBalance = (grossRevenue * 0.65m) - cashExpenses;
        var walletsBalance = (grossRevenue * 0.35m) - (totalExpenses - cashExpenses);

        return Ok(new FinancialSummaryDto(
            TotalGrossRevenue: grossRevenue,
            TotalSessionsRevenue: sessionsRevenue,
            TotalStoreRevenue: storeRevenue,
            TotalMembershipDeposits: membershipDeposits,
            TotalExpenses: totalExpenses,
            NetProfit: netProfit,
            CashBalance: Math.Max(0, cashBalance),
            ElectronicWalletsBalance: Math.Max(0, walletsBalance)
        ));
    }

    [HttpGet("expenses")]
    public ActionResult<IEnumerable<ExpenseDto>> GetExpenses([FromQuery] string? category = null)
    {
        var query = _dataStore.Expenses.Values.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(e => e.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }

        var list = query
            .OrderByDescending(e => e.CreatedAtUtc)
            .Select(e => new ExpenseDto(
                Id: e.Id,
                ExpenseNumber: e.ExpenseNumber,
                Category: e.Category,
                Amount: e.Amount,
                Description: e.Description,
                SpentBy: e.SpentBy,
                PaymentMethod: e.PaymentMethod,
                ReceiptRef: e.ReceiptRef,
                CreatedAtUtc: e.CreatedAtUtc
            )).ToList();

        return Ok(list);
    }

    [HttpPost("expenses")]
    public IActionResult CreateExpense([FromBody] CreateExpenseRequestDto request)
    {
        if (request.Amount <= 0 || string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new { message = "المبلغ والوصف حقول إلزامية لتسجيل المصروف." });
        }

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            ExpenseNumber = $"EXP-{DateTime.UtcNow:yyyyMM}-{_dataStore.Expenses.Count + 1:D3}",
            Category = request.Category?.Trim() ?? "Other",
            Amount = request.Amount,
            Description = request.Description.Trim(),
            SpentBy = string.IsNullOrWhiteSpace(request.SpentBy) ? "مشرف المركز" : request.SpentBy.Trim(),
            PaymentMethod = request.PaymentMethod,
            ReceiptRef = request.ReceiptRef,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.Expenses.TryAdd(expense.Id, expense);

        // Record in financial ledger as negative impact / expense transaction
        _dataStore.FinancialTransactions.TryAdd(Guid.NewGuid(), new FinancialTransaction
        {
            TransactionNumber = $"TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..20],
            TransactionType = "Expense",
            Amount = expense.Amount,
            CreatedByUserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Description = $"[مصروف] {expense.Description} ({expense.Category})"
        });

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "CreateExpense",
            EntityName = "Expense",
            EntityId = expense.Id.ToString(),
            Username = expense.SpentBy,
            AfterStateJson = $"{{\"category\":\"{expense.Category}\",\"amount\":{expense.Amount}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Expense {ExpenseNumber} recorded ({Amount} YER)", expense.ExpenseNumber, expense.Amount);
        return Ok(new ExpenseDto(
            expense.Id,
            expense.ExpenseNumber,
            expense.Category,
            expense.Amount,
            expense.Description,
            expense.SpentBy,
            expense.PaymentMethod,
            expense.ReceiptRef,
            expense.CreatedAtUtc
        ));
    }

    [HttpGet("closings")]
    public ActionResult<IEnumerable<MonthlyClosingDto>> GetMonthlyClosings()
    {
        var closings = _dataStore.MonthlyClosings.Values
            .OrderByDescending(c => c.Year)
            .ThenByDescending(c => c.Month)
            .Select(c => new MonthlyClosingDto(
                Id: c.Id,
                Year: c.Year,
                Month: c.Month,
                TotalSessionsRevenue: c.TotalSessionsRevenue,
                TotalStoreRevenue: c.TotalStoreRevenue,
                TotalMembershipDeposits: c.TotalMembershipDeposits,
                TotalGrossRevenue: c.TotalGrossRevenue,
                TotalExpenses: c.TotalExpenses,
                NetProfit: c.NetProfit,
                Status: c.Status,
                ApprovedByUserName: c.ApprovedByUserName,
                ApprovedAtUtc: c.ApprovedAtUtc,
                Notes: c.Notes,
                CreatedAtUtc: c.CreatedAtUtc
            )).ToList();

        return Ok(closings);
    }

    [HttpPost("closings/lock")]
    public IActionResult LockMonthlyClosing([FromBody] LockMonthlyClosingRequestDto request)
    {
        var existing = _dataStore.MonthlyClosings.Values.FirstOrDefault(c => c.Year == request.Year && c.Month == request.Month);
        if (existing != null && existing.Status == "ApprovedAndLocked")
        {
            return BadRequest(new { message = $"تم اعتماد وإقفال شهر {request.Month}/{request.Year} مسبقاً، ولا يمكن إعادة إقفاله أو تعديله." });
        }

        // Aggregate actual revenue & expense numbers
        var validTxns = _dataStore.FinancialTransactions.Values.Where(t => !t.IsReversed).ToList();
        var sessions = validTxns.Where(t => t.TransactionType == "SessionRevenue").Sum(t => t.Amount);
        var store = validTxns.Where(t => t.TransactionType == "StoreRevenue").Sum(t => t.Amount);
        var deposits = validTxns.Where(t => t.TransactionType == "MembershipDeposit" || t.TransactionType == "MembershipRecharge").Sum(t => t.Amount);
        var expenses = _dataStore.Expenses.Values.Sum(e => e.Amount);

        var closing = new MonthlyClosing
        {
            Id = Guid.NewGuid(),
            Year = request.Year,
            Month = request.Month,
            TotalSessionsRevenue = sessions,
            TotalStoreRevenue = store,
            TotalMembershipDeposits = deposits,
            TotalExpenses = expenses,
            Status = "ApprovedAndLocked",
            ApprovedByUserId = Guid.Parse("11111111-1111-1111-1111-111111111111"), // SuperAdmin
            ApprovedByUserName = "ضياء المهندس (Super Admin)",
            ApprovedAtUtc = DateTime.UtcNow,
            Notes = request.Notes?.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.MonthlyClosings.AddOrUpdate(closing.Id, closing, (k, v) => closing);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "LockMonthlyClosing",
            EntityName = "MonthlyClosing",
            EntityId = closing.Id.ToString(),
            Username = "SuperAdmin",
            AfterStateJson = $"{{\"year\":{closing.Year},\"month\":{closing.Month},\"gross\":{closing.TotalGrossRevenue},\"net\":{closing.NetProfit}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Monthly Closing for {Month}/{Year} locked and approved by SuperAdmin (Net Profit: {Net} YER).",
            closing.Month, closing.Year, closing.NetProfit);

        return Ok(new MonthlyClosingDto(
            closing.Id,
            closing.Year,
            closing.Month,
            closing.TotalSessionsRevenue,
            closing.TotalStoreRevenue,
            closing.TotalMembershipDeposits,
            closing.TotalGrossRevenue,
            closing.TotalExpenses,
            closing.NetProfit,
            closing.Status,
            closing.ApprovedByUserName,
            closing.ApprovedAtUtc,
            closing.Notes,
            closing.CreatedAtUtc
        ));
    }
}
