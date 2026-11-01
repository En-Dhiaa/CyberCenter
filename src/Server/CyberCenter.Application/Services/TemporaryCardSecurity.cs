using System.Security.Cryptography;
using System.Text;

namespace CyberCenter.Application.Services;

public class TemporaryCardSecurity
{
    public static string Generate16DigitPin()
    {
        // 16 decimal digits from cryptographically secure random bytes
        var bytes = new byte[8];
        RandomNumberGenerator.Fill(bytes);
        var ulongVal = BitConverter.ToUInt64(bytes, 0);
        
        // Ensure 16 digits exactly
        var pin1 = (ulongVal % 90000000 + 10000000).ToString();
        
        RandomNumberGenerator.Fill(bytes);
        var ulongVal2 = BitConverter.ToUInt64(bytes, 0);
        var pin2 = (ulongVal2 % 90000000 + 10000000).ToString();

        return pin1 + pin2;
    }

    public static string MaskPin(string pin)
    {
        if (string.IsNullOrWhiteSpace(pin) || pin.Length < 4)
            return "CC-****-****-****";

        var last4 = pin[^4..];
        return $"CC-****-****-{last4}";
    }

    public static string HashPin(string pin, string salt)
    {
        using var sha = SHA256.Create();
        var combined = Encoding.UTF8.GetBytes(pin + ":" + salt);
        var hash = sha.ComputeHash(combined);
        return Convert.ToBase64String(hash);
    }

    public static bool VerifyPin(string pin, string salt, string expectedHash)
    {
        var computed = HashPin(pin, salt);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computed),
            Encoding.UTF8.GetBytes(expectedHash));
    }
}

