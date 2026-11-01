using System.Diagnostics;
using CyberCenter.Application.Services;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Services;

namespace CyberCenter.UnitTests;

public class Program
{
    private static int _passedCount = 0;
    private static int _failedCount = 0;

    public static int Main(string[] args)
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("======================================================================");
        Console.WriteLine(" ⚡ CYBERCENTER AUTOMATED TEST SUITE (PHASE 1 VERIFICATION) ⚡");
        Console.WriteLine("======================================================================");
        Console.ResetColor();

        var stopwatch = Stopwatch.StartNew();

        // 1. Session Lease Tests
        RunTest("SessionLease: CreateLease produces valid verifiable signature", Test_SessionLease_CreateAndVerify);
        RunTest("SessionLease: Tampered remaining seconds is rejected", Test_SessionLease_RejectTamperedSeconds);
        RunTest("SessionLease: Expired lease timestamp is rejected", Test_SessionLease_RejectExpiredTimestamp);

        // 2. Temporary Card Security Tests
        RunTest("TemporaryCard: 16-digit PIN is generated correctly", Test_TemporaryCard_16DigitPin);
        RunTest("TemporaryCard: PIN is properly masked (CC-****-****-XXXX)", Test_TemporaryCard_MaskPin);
        RunTest("TemporaryCard: Correct PIN verifies against hash", Test_TemporaryCard_HashAndVerify);
        RunTest("TemporaryCard: Incorrect PIN fails verification", Test_TemporaryCard_RejectWrongPin);

        // 3. Device Entity & State Tests
        RunTest("Device: Initial state defaults to Available", Test_Device_InitialState);
        RunTest("Device: State transitions update correctly", Test_Device_StateTransitions);

        // 4. Security & Cryptography Tests
        RunTest("PasswordHasher: PBKDF2 hash verifies against correct password", Test_PasswordHasher_Verify);
        RunTest("PasswordHasher: PBKDF2 rejects invalid password", Test_PasswordHasher_RejectWrongPassword);
        RunTest("TokenGenerator: Generates signed compact token", Test_TokenGenerator_GeneratesSignedToken);

        stopwatch.Stop();

        Console.WriteLine("----------------------------------------------------------------------");
        if (_failedCount == 0)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"\n✔ ALL {_passedCount} TESTS PASSED SUCCESSFULLY! (Time: {stopwatch.ElapsedMilliseconds} ms)");
            Console.ResetColor();
            return 0;
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\n✖ {_failedCount} TESTS FAILED, {_passedCount} passed. (Time: {stopwatch.ElapsedMilliseconds} ms)");
            Console.ResetColor();
            return 1;
        }
    }

    private static void RunTest(string testName, Action testAction)
    {
        try
        {
            testAction();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.Write("  [PASS] ");
            Console.ResetColor();
            Console.WriteLine(testName);
            _passedCount++;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.Write("  [FAIL] ");
            Console.ResetColor();
            Console.WriteLine($"{testName} -> {ex.Message}");
            _failedCount++;
        }
    }

    private static void Test_SessionLease_CreateAndVerify()
    {
        var manager = new SessionLeaseManager("SecretTestKey_123456789_Enterprise!");
        var sId = Guid.NewGuid();
        var dId = Guid.NewGuid();

        var lease = manager.CreateLease(sId, dId, 3600, 60, "Gamer01", SessionType.TemporaryCard);
        if (lease == null || !manager.VerifyLease(lease))
            throw new Exception("Valid lease failed verification.");
    }

    private static void Test_SessionLease_RejectTamperedSeconds()
    {
        var manager = new SessionLeaseManager("SecretTestKey_123456789_Enterprise!");
        var sId = Guid.NewGuid();
        var dId = Guid.NewGuid();

        var original = manager.CreateLease(sId, dId, 600, 60, "Gamer01", SessionType.TemporaryCard);
        var forged = original with { RemainingTotalSeconds = 999999 };

        if (manager.VerifyLease(forged))
            throw new Exception("Tampered lease should have failed verification.");
    }

    private static void Test_SessionLease_RejectExpiredTimestamp()
    {
        var manager = new SessionLeaseManager("SecretTestKey_123456789_Enterprise!");
        var sId = Guid.NewGuid();
        var dId = Guid.NewGuid();

        var expired = manager.CreateLease(sId, dId, 1200, -300, "Gamer01", SessionType.TemporaryCard);
        if (manager.VerifyLease(expired))
            throw new Exception("Expired lease should have failed verification.");
    }

    private static void Test_TemporaryCard_16DigitPin()
    {
        var pin = TemporaryCardSecurity.Generate16DigitPin();
        if (pin.Length != 16 || !pin.All(char.IsDigit))
            throw new Exception($"Expected 16 digits but got '{pin}'.");
    }

    private static void Test_TemporaryCard_MaskPin()
    {
        var pin = "1234567890123456";
        var masked = TemporaryCardSecurity.MaskPin(pin);
        if (masked != "CC-****-****-3456")
            throw new Exception($"Expected 'CC-****-****-3456' but got '{masked}'.");
    }

    private static void Test_TemporaryCard_HashAndVerify()
    {
        var pin = "9876543210987654";
        var salt = Guid.NewGuid().ToString("N");
        var hash = TemporaryCardSecurity.HashPin(pin, salt);

        if (!TemporaryCardSecurity.VerifyPin(pin, salt, hash))
            throw new Exception("Correct PIN must verify against hash.");
    }

    private static void Test_TemporaryCard_RejectWrongPin()
    {
        var pin = "9876543210987654";
        var wrongPin = "1111222233334444";
        var salt = Guid.NewGuid().ToString("N");
        var hash = TemporaryCardSecurity.HashPin(pin, salt);

        if (TemporaryCardSecurity.VerifyPin(wrongPin, salt, hash))
            throw new Exception("Wrong PIN should not verify.");
    }

    private static void Test_Device_InitialState()
    {
        var device = new Device
        {
            DeviceNumber = 1,
            DeviceName = "Station-01",
            MacAddress = "00:1A:2B:3C:4D:5E",
            IpAddress = "192.168.1.101"
        };

        if (device.Status != DeviceStatus.Available)
            throw new Exception("Initial status must be Available.");
    }

    private static void Test_Device_StateTransitions()
    {
        var device = new Device { DeviceNumber = 2, DeviceName = "Station-02" };
        device.Status = DeviceStatus.Occupied;
        if (device.Status != DeviceStatus.Occupied)
            throw new Exception("Device status did not transition to Occupied.");

        device.Status = DeviceStatus.Locked;
        if (device.Status != DeviceStatus.Locked)
            throw new Exception("Device status did not transition to Locked.");
    }

    private static void Test_PasswordHasher_Verify()
    {
        var hasher = new NativePasswordHasher();
        var rawPassword = "SecureGamerPassword2026!";
        var hash = hasher.HashPassword(rawPassword);

        if (!hasher.VerifyPassword(rawPassword, hash))
            throw new Exception("Correct password failed verification.");
    }

    private static void Test_PasswordHasher_RejectWrongPassword()
    {
        var hasher = new NativePasswordHasher();
        var rawPassword = "SecureGamerPassword2026!";
        var hash = hasher.HashPassword(rawPassword);

        if (hasher.VerifyPassword("WrongPassword123", hash))
            throw new Exception("Incorrect password should not verify.");
    }

    private static void Test_TokenGenerator_GeneratesSignedToken()
    {
        var generator = new NativeTokenGenerator("MySuperSecretKey_2026_EnterpriseSecureToken!");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "superadmin",
            FullName = "Administrator",
            UserType = "SuperAdmin"
        };

        var token = generator.GenerateToken(user, new[] { "SuperAdmin" });
        if (string.IsNullOrWhiteSpace(token) || token.Split('.').Length != 3)
            throw new Exception("Token must be a valid 3-part compact JWT format.");
    }
}
