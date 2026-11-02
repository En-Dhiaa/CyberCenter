using CyberCenter.Application.Interfaces;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MembersController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly IPasswordHasher _hasher;
    private readonly ILogger<MembersController> _logger;

    public MembersController(
        InMemoryDataStore dataStore,
        IPasswordHasher hasher,
        ILogger<MembersController> logger)
    {
        _dataStore = dataStore;
        _hasher = hasher;
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<IEnumerable<MemberDetailsDto>> GetMembers()
    {
        var members = _dataStore.Users.Values
            .Where(u => u.UserType == "Member" && !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new MemberDetailsDto(
                Id: u.Id,
                Username: u.Username,
                FullName: u.FullName,
                PhoneNumber: u.PhoneNumber,
                Email: u.Email,
                WalletBalance: u.WalletBalance,
                RemainingMinutes: u.RemainingSeconds / 60,
                IsActive: u.IsActive,
                CreatedAtUtc: u.CreatedAtUtc
            )).ToList();

        return Ok(members);
    }

    [HttpGet("{id:guid}")]
    public ActionResult<object> GetMemberDetails(Guid id)
    {
        if (!_dataStore.Users.TryGetValue(id, out var user) || user.UserType != "Member" || user.IsDeleted)
        {
            return NotFound(new { message = "العضو غير موجود." });
        }

        var sessions = _dataStore.Sessions.Values
            .Where(s => s.UserId == id)
            .OrderByDescending(s => s.StartedAtUtc)
            .Take(20)
            .ToList();

        return Ok(new
        {
            member = new MemberDetailsDto(
                Id: user.Id,
                Username: user.Username,
                FullName: user.FullName,
                PhoneNumber: user.PhoneNumber,
                Email: user.Email,
                WalletBalance: user.WalletBalance,
                RemainingMinutes: user.RemainingSeconds / 60,
                IsActive: user.IsActive,
                CreatedAtUtc: user.CreatedAtUtc
            ),
            recentSessions = sessions
        });
    }

    [HttpPost]
    public IActionResult CreateMember([FromBody] CreateMemberRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { message = "اسم المستخدم وكلمة المرور والاسم الكامل حقول إلزامية." });
        }

        if (_dataStore.Users.Values.Any(u => u.Username.Equals(request.Username.Trim(), StringComparison.OrdinalIgnoreCase) && !u.IsDeleted))
        {
            return Conflict(new { message = "اسم المستخدم هذا مسجل مسبقاً لعضو آخر." });
        }

        var member = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.Trim(),
            PasswordHash = _hasher.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Email = request.Email?.Trim(),
            UserType = "Member",
            WalletBalance = request.InitialDeposit,
            RemainingSeconds = request.InitialMinutes * 60,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.Users.TryAdd(member.Id, member);

        if (request.InitialDeposit > 0)
        {
            _dataStore.FinancialTransactions.TryAdd(Guid.NewGuid(), new FinancialTransaction
            {
                TransactionNumber = $"TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..20],
                TransactionType = "MembershipDeposit",
                Amount = request.InitialDeposit,
                CreatedByUserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Description = $"شحن أولي لعضوية {member.FullName} (@{member.Username})"
            });
        }

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "CreateMember",
            EntityName = "User",
            EntityId = member.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"username\":\"{member.Username}\",\"wallet\":{member.WalletBalance},\"minutes\":{request.InitialMinutes}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Member {Username} ({FullName}) registered successfully.", member.Username, member.FullName);
        return CreatedAtAction(nameof(GetMemberDetails), new { id = member.Id }, member);
    }

    [HttpPost("{id:guid}/recharge")]
    public IActionResult RechargeMember(Guid id, [FromBody] RechargeMemberRequestDto request)
    {
        if (!_dataStore.Users.TryGetValue(id, out var user) || user.UserType != "Member" || user.IsDeleted)
        {
            return NotFound(new { message = "العضو غير موجود." });
        }

        if (request.Amount <= 0 && request.AdditionalMinutes <= 0)
        {
            return BadRequest(new { message = "يرجى تحديد المبلغ المراد شحنه أو الدقائق الإضافية." });
        }

        user.WalletBalance += request.Amount;
        user.RemainingSeconds += request.AdditionalMinutes * 60;
        user.UpdatedAtUtc = DateTime.UtcNow;

        if (request.Amount > 0)
        {
            _dataStore.FinancialTransactions.TryAdd(Guid.NewGuid(), new FinancialTransaction
            {
                TransactionNumber = $"TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..20],
                TransactionType = "MembershipRecharge",
                Amount = request.Amount,
                CreatedByUserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Description = $"شحن رصيد نقدي للعضو {user.FullName} ({request.PaymentMethod})"
            });
        }

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "RechargeMember",
            EntityName = "User",
            EntityId = user.Id.ToString(),
            Username = "AdminOperator",
            AfterStateJson = $"{{\"rechargeAmount\":{request.Amount},\"addedMinutes\":{request.AdditionalMinutes},\"newWallet\":{user.WalletBalance}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new
        {
            success = true,
            message = $"تم شحن رصيد العضو بنجاح: +{request.Amount} ر.ي و +{request.AdditionalMinutes} دقيقة.",
            newBalance = user.WalletBalance,
            newRemainingMinutes = user.RemainingSeconds / 60
        });
    }

    [HttpPut("{id:guid}/status")]
    public IActionResult ToggleMemberStatus(Guid id, [FromBody] bool isActive)
    {
        if (!_dataStore.Users.TryGetValue(id, out var user) || user.UserType != "Member" || user.IsDeleted)
        {
            return NotFound(new { message = "العضو غير موجود." });
        }

        user.IsActive = isActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = isActive ? "ActivateMember" : "SuspendMember",
            EntityName = "User",
            EntityId = id.ToString(),
            Username = "AdminOperator",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new { success = true, isActive = user.IsActive });
    }
}

