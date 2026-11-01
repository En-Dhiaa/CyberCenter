using System.Security.Cryptography;
using System.Text;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;

namespace CyberCenter.Application.Services;

public class DeviceCommandSigner
{
    public static RemoteCommandDto CreateSignedCommand(
        Guid deviceId,
        DeviceCommandType commandType,
        string? payload,
        string deviceSecretKey)
    {
        var commandId = Guid.NewGuid();
        var issuedAtUtc = DateTime.UtcNow;
        var nonce = Guid.NewGuid().ToString("N");

        var signature = ComputeSignature(commandId, deviceId, commandType, payload, nonce, issuedAtUtc, deviceSecretKey);

        return new RemoteCommandDto(
            CommandId: commandId,
            DeviceId: deviceId,
            CommandType: commandType,
            Payload: payload,
            Nonce: nonce,
            Signature: signature,
            IssuedAtUtc: issuedAtUtc
        );
    }

    public static bool VerifyCommandSignature(RemoteCommandDto command, string deviceSecretKey, int maxAgeSeconds = 60)
    {
        // 1. Check timestamp freshness (reject stale commands older than maxAgeSeconds)
        if (DateTime.UtcNow > command.IssuedAtUtc.AddSeconds(maxAgeSeconds))
        {
            return false;
        }

        // 2. Verify HMAC-SHA256 signature
        var expectedSignature = ComputeSignature(
            command.CommandId,
            command.DeviceId,
            command.CommandType,
            command.Payload,
            command.Nonce,
            command.IssuedAtUtc,
            deviceSecretKey);

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(command.Signature),
            Encoding.UTF8.GetBytes(expectedSignature));
    }

    private static string ComputeSignature(
        Guid commandId,
        Guid deviceId,
        DeviceCommandType commandType,
        string? payload,
        string nonce,
        DateTime issuedAtUtc,
        string secretKey)
    {
        var data = $"{commandId:N}:{deviceId:N}:{(int)commandType}:{payload ?? string.Empty}:{nonce}:{issuedAtUtc.Ticks}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hash);
    }
}
