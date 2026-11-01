using System.Security.Cryptography;
using System.Text;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;

namespace CyberCenter.Application.Services;

public class SessionLeaseManager
{
    private readonly byte[] _signingKey;

    public SessionLeaseManager(string secretKey)
    {
        if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 16)
        {
            throw new ArgumentException("Secret key must be at least 16 characters for cryptographic signing.", nameof(secretKey));
        }
        _signingKey = Encoding.UTF8.GetBytes(secretKey);
    }

    public SessionLeaseDto CreateLease(
        Guid sessionId,
        Guid deviceId,
        int totalRemainingSeconds,
        int leaseValiditySeconds,
        string? activeUserName,
        SessionType sessionType)
    {
        var expiresAtUtc = DateTime.UtcNow.AddSeconds(leaseValiditySeconds);
        var signature = ComputeSignature(sessionId, deviceId, expiresAtUtc, totalRemainingSeconds);

        return new SessionLeaseDto(
            SessionId: sessionId,
            DeviceId: deviceId,
            LeaseExpiresAtUtc: expiresAtUtc,
            RemainingTotalSeconds: totalRemainingSeconds,
            Signature: signature,
            ActiveUserName: activeUserName,
            SessionType: sessionType
        );
    }

    public bool VerifyLease(SessionLeaseDto lease)
    {
        if (DateTime.UtcNow > lease.LeaseExpiresAtUtc.AddSeconds(5)) // 5 second clock-skew allowance
        {
            return false;
        }

        var expectedSignature = ComputeSignature(
            lease.SessionId,
            lease.DeviceId,
            lease.LeaseExpiresAtUtc,
            lease.RemainingTotalSeconds);

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(lease.Signature),
            Encoding.UTF8.GetBytes(expectedSignature));
    }

    private string ComputeSignature(Guid sessionId, Guid deviceId, DateTime expiresAtUtc, int remainingSeconds)
    {
        var payload = $"{sessionId:N}:{deviceId:N}:{expiresAtUtc.Ticks}:{remainingSeconds}";
        using var hmac = new HMACSHA256(_signingKey);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToBase64String(hash);
    }
}

