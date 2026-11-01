using System.Security.Cryptography;
using System.Text;
using CyberCenter.Application.Interfaces;
using CyberCenter.Domain.Entities;

namespace CyberCenter.Infrastructure.Services;

public class NativePasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100000;
    private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA256;

    public string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            Iterations,
            HashAlgorithm,
            KeySize);

        return $"$pbkdf2${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(storedHash) || !storedHash.StartsWith("$pbkdf2$"))
        {
            return false;
        }

        var parts = storedHash.Split('$');
        if (parts.Length != 5) return false;

        var iterations = int.Parse(parts[2]);
        var salt = Convert.FromBase64String(parts[3]);
        var expectedHash = Convert.FromBase64String(parts[4]);

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations,
            HashAlgorithm,
            expectedHash.Length);

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}

public class NativeTokenGenerator : IJwtTokenGenerator
{
    private readonly byte[] _secretKeyBytes;

    public NativeTokenGenerator(string secretKey)
    {
        _secretKeyBytes = Encoding.UTF8.GetBytes(secretKey);
    }

    public string GenerateToken(User user, IEnumerable<string> roles)
    {
        var header = Convert.ToBase64String(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
        var expiresAt = DateTimeOffset.UtcNow.AddHours(8).ToUnixTimeSeconds();
        
        var payloadJson = $"{{\"sub\":\"{user.Id}\",\"name\":\"{user.Username}\",\"role\":\"{string.Join(",", roles)}\",\"exp\":{expiresAt}}}";
        var payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadJson));

        var dataToSign = $"{header}.{payload}";
        using var hmac = new HMACSHA256(_secretKeyBytes);
        var signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(dataToSign)));

        return $"{header}.{payload}.{signature}";
    }
}

