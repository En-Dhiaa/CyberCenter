using CyberCenter.Application.Interfaces;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly IPasswordHasher _hasher;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(
        InMemoryDataStore dataStore,
        IPasswordHasher hasher,
        ILogger<EmployeesController> logger)
    {
        _dataStore = dataStore;
        _hasher = hasher;
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<IEnumerable<User>> GetAllEmployees()
    {
        var staff = _dataStore.Users.Values
            .Where(u => !u.IsDeleted && u.UserType != "Member")
            .OrderByDescending(u => u.UserType == "SuperAdmin")
            .ThenBy(u => u.FullName)
            .ToList();

        return Ok(staff);
    }

    [HttpGet("{id:guid}")]
    public ActionResult<User> GetEmployeeById(Guid id)
    {
        if (_dataStore.Users.TryGetValue(id, out var user) && !user.IsDeleted)
        {
            return Ok(user);
        }
        return NotFound(new { message = "الموظف غير موجود." });
    }

    [HttpPost]
    public IActionResult CreateEmployee([FromBody] CreateEmployeeRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "اسم المستخدم وكلمة المرور مطلوبان." });
        }

        if (_dataStore.Users.Values.Any(u => u.Username.Equals(request.Username.Trim(), StringComparison.OrdinalIgnoreCase) && !u.IsDeleted))
        {
            return Conflict(new { message = "اسم المستخدم مسجل مسبقاً لموظف آخر." });
        }

        var newEmployee = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.Trim(),
            PasswordHash = _hasher.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Email = request.Email?.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            UserType = request.UserType switch
            {
                "SuperAdmin" => "SuperAdmin",
                "Admin" => "Admin",
                "Cashier" => "Cashier",
                _ => "Staff"
            },
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.Users.TryAdd(newEmployee.Id, newEmployee);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "CreateEmployee",
            EntityName = "User",
            EntityId = newEmployee.Id.ToString(),
            Username = "SuperAdmin",
            AfterStateJson = $"{{\"username\":\"{newEmployee.Username}\",\"role\":\"{newEmployee.UserType}\"}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Employee {Username} created with role {Role}.", newEmployee.Username, newEmployee.UserType);
        return CreatedAtAction(nameof(GetEmployeeById), new { id = newEmployee.Id }, newEmployee);
    }

    [HttpPut("{id:guid}")]
    public IActionResult UpdateEmployee(Guid id, [FromBody] UpdateEmployeeRequestDto request)
    {
        if (!_dataStore.Users.TryGetValue(id, out var user) || user.IsDeleted)
        {
            return NotFound(new { message = "الموظف غير موجود." });
        }

        var beforeState = $"{{\"fullName\":\"{user.FullName}\",\"role\":\"{user.UserType}\",\"isActive\":{user.IsActive}}}";

        user.FullName = request.FullName.Trim();
        user.Email = request.Email?.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.UserType = request.UserType;
        user.IsActive = request.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "UpdateEmployee",
            EntityName = "User",
            EntityId = id.ToString(),
            Username = "SuperAdmin",
            BeforeStateJson = beforeState,
            AfterStateJson = $"{{\"fullName\":\"{user.FullName}\",\"role\":\"{user.UserType}\",\"isActive\":{user.IsActive}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(user);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult DeleteEmployee(Guid id)
    {
        if (!_dataStore.Users.TryGetValue(id, out var user) || user.IsDeleted)
        {
            return NotFound(new { message = "الموظف غير موجود." });
        }

        // Prevent deleting the sole SuperAdmin
        if (user.UserType == "SuperAdmin" && _dataStore.Users.Values.Count(u => u.UserType == "SuperAdmin" && !u.IsDeleted) <= 1)
        {
            return BadRequest(new { message = "لا يمكن حذف حساب المدير العام الرئيسي للنظام." });
        }

        user.IsDeleted = true;
        user.DeletedAtUtc = DateTime.UtcNow;
        user.IsActive = false;

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "DeleteEmployee",
            EntityName = "User",
            EntityId = id.ToString(),
            Username = "SuperAdmin",
            CreatedAtUtc = DateTime.UtcNow
        });

        return Ok(new { success = true, message = $"تم حذف الموظف {user.FullName} بنجاح." });
    }
}

