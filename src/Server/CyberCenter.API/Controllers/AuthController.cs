using CyberCenter.Application.Interfaces;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        InMemoryDataStore dataStore,
        IPasswordHasher hasher,
        IJwtTokenGenerator tokenGenerator,
        ILogger<AuthController> logger)
    {
        _dataStore = dataStore;
        _hasher = hasher;
        _tokenGenerator = tokenGenerator;
        _logger = logger;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "اسم المستخدم وكلمة المرور مطلوبان." });
        }

        var user = _dataStore.Users.Values.FirstOrDefault(u =>
            u.Username.Equals(request.Username.Trim(), StringComparison.OrdinalIgnoreCase));

        if (user == null || !_hasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            _dataStore.AuditLogs.Add(new AuditLog
            {
                Action = "FailedLoginAttempt",
                EntityName = "User",
                EntityId = request.Username,
                Username = request.Username,
                BeforeStateJson = "{\"status\":\"FailedAuthentication\"}",
                CreatedAtUtc = DateTime.UtcNow
            });

            _logger.LogWarning("Failed login attempt for username: {Username}", request.Username);
            return Unauthorized(new { message = "اسم المستخدم أو كلمة المرور غير صحيحة." });
        }

        if (!user.IsActive || user.IsDeleted)
        {
            return Unauthorized(new { message = "هذا الحساب موقوف أو غير نشط. يرجى مراجعة المدير العام." });
        }

        var token = _tokenGenerator.GenerateToken(user, new[] { user.UserType });
        var expiresAtUtc = DateTime.UtcNow.AddHours(8);

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "UserLoginSuccess",
            EntityName = "User",
            EntityId = user.Id.ToString(),
            Username = user.Username,
            BeforeStateJson = $"{{\"role\":\"{user.UserType}\"}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("User {Username} logged in successfully with role {Role}.", user.Username, user.UserType);

        return Ok(new LoginResponseDto(
            Token: token,
            UserId: user.Id,
            Username: user.Username,
            FullName: user.FullName,
            UserType: user.UserType,
            ExpiresAtUtc: expiresAtUtc
        ));
    }

    [HttpGet("me")]
    public ActionResult<User> GetCurrentUser([FromHeader(Name = "X-User-Id")] string? userIdHeader)
    {
        if (string.IsNullOrWhiteSpace(userIdHeader) || !Guid.TryParse(userIdHeader, out var userId))
        {
            // Default to superadmin if not provided in local demo mode
            var defaultAdmin = _dataStore.Users.Values.FirstOrDefault(u => u.UserType == "SuperAdmin");
            return Ok(defaultAdmin);
        }

        if (_dataStore.Users.TryGetValue(userId, out var user))
        {
            return Ok(user);
        }

        return NotFound(new { message = "المستخدم غير موجود." });
    }
}
