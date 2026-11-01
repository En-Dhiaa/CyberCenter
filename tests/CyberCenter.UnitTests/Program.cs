using System.Diagnostics;
using CyberCenter.Agent;
using CyberCenter.API.Controllers;
using CyberCenter.API.Hubs;
using CyberCenter.Application.Services;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using CyberCenter.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging.Abstractions;

namespace CyberCenter.UnitTests;

public class Program
{
    private static int _passedCount = 0;
    private static int _failedCount = 0;

    public static int Main(string[] args)
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("======================================================================");
        Console.WriteLine(" ⚡ CYBERCENTER AUTOMATED TEST SUITE (PHASE 3 DEVICES & AGENT) ⚡");
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

        // 5. Phase 2: AuthController Tests
        RunTest("Auth: Valid SuperAdmin credentials successfully log in", Test_Auth_Login_Success);
        RunTest("Auth: Invalid password returns Unauthorized and logs audit", Test_Auth_Login_WrongPassword);
        RunTest("Auth: Inactive user account is blocked from logging in", Test_Auth_Login_InactiveUser);

        // 6. Phase 2: EmployeesController & RBAC Tests
        RunTest("Employees: Create new staff member succeeds", Test_Employees_Create_Success);
        RunTest("Employees: Duplicate username is rejected with Conflict", Test_Employees_Create_DuplicateUsername);
        RunTest("Employees: Deleting the sole SuperAdmin is prohibited", Test_Employees_Prevent_SoleAdmin_Delete);

        // 7. Phase 2: Audit Logs & System Settings Tests
        RunTest("AuditLogs: Immutable audit trail records actions and supports search", Test_AuditLogs_SearchAndFilter);
        RunTest("Settings: Updating system settings succeeds and logs audit entry", Test_Settings_UpdateAndAudit);

        // 8. Phase 3: Signed Device Commands & Replay Protection Tests
        RunTest("DeviceCommand: Signed command verifies with matching secret key", Test_DeviceCommand_SignAndVerify_Success);
        RunTest("DeviceCommand: Tampered payload fails cryptographic verification", Test_DeviceCommand_TamperedPayload_Rejected);
        RunTest("DeviceCommand: Wrong secret key fails verification", Test_DeviceCommand_WrongSecretKey_Rejected);
        RunTest("DeviceCommand: Stale command older than max age is rejected", Test_DeviceCommand_StaleExpired_Rejected);

        // 9. Phase 3: Agent Command Execution & State Transition Tests
        RunTest("Agent: Executes LockStation command and updates state to Locked", Test_Agent_ProcessCommand_Lock);
        RunTest("Agent: Rejects invalid or unsigned command", Test_Agent_ProcessCommand_RejectUnsigned);

        // 10. Phase 3: Device Groups & Fleet Management Tests
        RunTest("DeviceGroups: Create and query device groups with correct pricing", Test_DeviceGroups_CreationAndListing);

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

    private static void Test_Auth_Login_Success()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var tokenGen = new NativeTokenGenerator("MySuperSecretKey_2026_EnterpriseSecureToken!");
        var logger = NullLogger<AuthController>.Instance;

        var controller = new AuthController(store, hasher, tokenGen, logger);
        var result = controller.Login(new LoginRequestDto("superadmin", "Admin@Cyber2026!"));

        var okResult = result.Result as OkObjectResult;
        if (okResult == null || okResult.Value is not LoginResponseDto response)
            throw new Exception("Expected OkObjectResult with LoginResponseDto.");

        if (response.Username != "superadmin" || response.UserType != "SuperAdmin")
            throw new Exception("User details in login response mismatch.");

        if (string.IsNullOrWhiteSpace(response.Token))
            throw new Exception("Token cannot be empty.");
    }

    private static void Test_Auth_Login_WrongPassword()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var tokenGen = new NativeTokenGenerator("MySuperSecretKey_2026_EnterpriseSecureToken!");
        var logger = NullLogger<AuthController>.Instance;

        var controller = new AuthController(store, hasher, tokenGen, logger);
        var result = controller.Login(new LoginRequestDto("superadmin", "WrongPassword!@#"));

        if (result.Result is not UnauthorizedObjectResult)
            throw new Exception("Wrong password must result in Unauthorized (401).");

        if (!store.AuditLogs.Any(a => a.Action == "FailedLoginAttempt"))
            throw new Exception("Failed login must be recorded in AuditLogs.");
    }

    private static void Test_Auth_Login_InactiveUser()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var tokenGen = new NativeTokenGenerator("MySuperSecretKey_2026_EnterpriseSecureToken!");
        var logger = NullLogger<AuthController>.Instance;

        var inactive = new User
        {
            Username = "disabled_staff",
            PasswordHash = hasher.HashPassword("Pass123!"),
            FullName = "Disabled Person",
            IsActive = false
        };
        store.Users.TryAdd(inactive.Id, inactive);

        var controller = new AuthController(store, hasher, tokenGen, logger);
        var result = controller.Login(new LoginRequestDto("disabled_staff", "Pass123!"));

        if (result.Result is not UnauthorizedObjectResult)
            throw new Exception("Inactive user must be blocked with Unauthorized.");
    }

    private static void Test_Employees_Create_Success()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var logger = NullLogger<EmployeesController>.Instance;

        var controller = new EmployeesController(store, hasher, logger);
        var req = new CreateEmployeeRequestDto("ahmed_cashier", "Cashier2026!", "أحمد السامعي", "ahmed@cyber.local", "+967771234567", "Cashier");
        var result = controller.CreateEmployee(req);

        if (result is not CreatedAtActionResult created)
            throw new Exception("Creating employee must return CreatedAtActionResult.");

        var createdEmp = created.Value as User;
        if (createdEmp == null || createdEmp.Username != "ahmed_cashier" || createdEmp.UserType != "Cashier")
            throw new Exception("Created employee properties do not match request.");
    }

    private static void Test_Employees_Create_DuplicateUsername()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var logger = NullLogger<EmployeesController>.Instance;

        var controller = new EmployeesController(store, hasher, logger);
        var req = new CreateEmployeeRequestDto("superadmin", "DuplicatePass!", "Fake Admin", null, null, "Admin");
        var result = controller.CreateEmployee(req);

        if (result is not ConflictObjectResult)
            throw new Exception("Duplicate username must return Conflict (409).");
    }

    private static void Test_Employees_Prevent_SoleAdmin_Delete()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var logger = NullLogger<EmployeesController>.Instance;

        var controller = new EmployeesController(store, hasher, logger);
        var admin = store.Users.Values.First(u => u.UserType == "SuperAdmin");

        var result = controller.DeleteEmployee(admin.Id);
        if (result is not BadRequestObjectResult)
            throw new Exception("Deleting sole SuperAdmin must be blocked with BadRequest (400).");
    }

    private static void Test_AuditLogs_SearchAndFilter()
    {
        var store = new InMemoryDataStore();
        store.AuditLogs.Add(new AuditLog
        {
            Action = "LockStation",
            Username = "superadmin",
            EntityName = "Device",
            CreatedAtUtc = DateTime.UtcNow
        });
        store.AuditLogs.Add(new AuditLog
        {
            Action = "CreateTemporaryCardBatch",
            Username = "superadmin",
            EntityName = "CardBatch",
            CreatedAtUtc = DateTime.UtcNow
        });

        var controller = new AuditLogsController(store);
        var res = controller.GetAuditLogs(search: "LockStation", action: null, page: 1, pageSize: 10);

        if (res.Result is not OkObjectResult ok || ok.Value == null)
            throw new Exception("Audit logs query must return OkObjectResult.");
    }

    private static void Test_Settings_UpdateAndAudit()
    {
        var store = new InMemoryDataStore();
        var controller = new SettingsController(store);

        var newSettings = new SystemSettingsDto(
            CenterName: "Arena eSports Center",
            CenterPhone: "+967 777 999 888",
            Currency: "YER",
            DefaultHourlyRate: 600.00m,
            VipHourlyRate: 1000.00m,
            OfflineGracePeriodMinutes: 7,
            WarningBeforeExpiryMinutes: 5,
            AllowGuestBrowsing: true
        );

        var res = controller.UpdateSettings(newSettings);
        if (res.Result is not OkObjectResult ok || ok.Value is not SystemSettingsDto returned)
            throw new Exception("Updating settings must return updated object.");

        if (returned.DefaultHourlyRate != 600.00m || returned.OfflineGracePeriodMinutes != 7)
            throw new Exception("Settings values were not updated correctly.");

        if (!store.AuditLogs.Any(a => a.Action == "UpdateSystemSettings"))
            throw new Exception("Updating settings must generate an AuditLog entry.");
    }

    // Phase 3 Tests
    private static void Test_DeviceCommand_SignAndVerify_Success()
    {
        var deviceId = Guid.NewGuid();
        var secretKey = "StationSecretKey_987654321!";

        var signedCommand = DeviceCommandSigner.CreateSignedCommand(
            deviceId: deviceId,
            commandType: DeviceCommandType.LockStation,
            payload: "Lock reason",
            deviceSecretKey: secretKey);

        if (signedCommand == null || string.IsNullOrWhiteSpace(signedCommand.Signature))
            throw new Exception("Signed command or signature was null.");

        var isValid = DeviceCommandSigner.VerifyCommandSignature(signedCommand, secretKey);
        if (!isValid)
            throw new Exception("Signed command failed HMAC-SHA256 signature verification.");
    }

    private static void Test_DeviceCommand_TamperedPayload_Rejected()
    {
        var deviceId = Guid.NewGuid();
        var secretKey = "StationSecretKey_987654321!";

        var original = DeviceCommandSigner.CreateSignedCommand(
            deviceId: deviceId,
            commandType: DeviceCommandType.LockStation,
            payload: "Original payload",
            deviceSecretKey: secretKey);

        var tampered = original with { Payload = "Malicious altered payload" };

        if (DeviceCommandSigner.VerifyCommandSignature(tampered, secretKey))
            throw new Exception("Tampered payload should have failed signature verification.");
    }

    private static void Test_DeviceCommand_WrongSecretKey_Rejected()
    {
        var deviceId = Guid.NewGuid();
        var correctKey = "StationSecretKey_987654321!";
        var wrongKey = "AttackerSecretKey_1111111!";

        var command = DeviceCommandSigner.CreateSignedCommand(
            deviceId: deviceId,
            commandType: DeviceCommandType.UnlockStation,
            payload: null,
            deviceSecretKey: correctKey);

        if (DeviceCommandSigner.VerifyCommandSignature(command, wrongKey))
            throw new Exception("Command verified with wrong secret key - security failure!");
    }

    private static void Test_DeviceCommand_StaleExpired_Rejected()
    {
        var deviceId = Guid.NewGuid();
        var secretKey = "StationSecretKey_987654321!";

        var command = DeviceCommandSigner.CreateSignedCommand(
            deviceId: deviceId,
            commandType: DeviceCommandType.RestartComputer,
            payload: null,
            deviceSecretKey: secretKey);

        // Simulate 2 minute old command with maxAge = 60s
        var staleCommand = command with { IssuedAtUtc = DateTime.UtcNow.AddMinutes(-2) };

        if (DeviceCommandSigner.VerifyCommandSignature(staleCommand, secretKey, maxAgeSeconds: 60))
            throw new Exception("Stale expired command should have been rejected to prevent replay attacks.");
    }

    private static void Test_Agent_ProcessCommand_Lock()
    {
        var logger = NullLogger<Worker>.Instance;
        var worker = new Worker(logger);

        // Generate signed command with worker's internal or matching secret
        var field = typeof(Worker).GetField("_deviceSecretKey", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        var secret = (string)field!.GetValue(worker)!;
        var deviceIdField = typeof(Worker).GetField("_deviceId", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        var devId = (Guid)deviceIdField!.GetValue(worker)!;

        var cmd = DeviceCommandSigner.CreateSignedCommand(devId, DeviceCommandType.LockStation, "Lock test", secret);
        var processed = worker.ProcessIncomingRemoteCommand(cmd);

        if (!processed)
            throw new Exception("Valid signed command was not processed by Agent.");

        var statusField = typeof(Worker).GetField("_currentStatus", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        var status = (DeviceStatus)statusField!.GetValue(worker)!;

        if (status != DeviceStatus.Locked)
            throw new Exception("Agent status was not updated to Locked.");
    }

    private static void Test_Agent_ProcessCommand_RejectUnsigned()
    {
        var logger = NullLogger<Worker>.Instance;
        var worker = new Worker(logger);

        var fakeCommand = new RemoteCommandDto(
            CommandId: Guid.NewGuid(),
            DeviceId: Guid.NewGuid(),
            CommandType: DeviceCommandType.ShutdownComputer,
            Payload: null,
            Nonce: "fake-nonce",
            Signature: "forged-invalid-sig",
            IssuedAtUtc: DateTime.UtcNow
        );

        var processed = worker.ProcessIncomingRemoteCommand(fakeCommand);
        if (processed)
            throw new Exception("Agent should have rejected fake unsigned command!");
    }

    private static void Test_DeviceGroups_CreationAndListing()
    {
        var store = new InMemoryDataStore();
        var controller = new DevicesController(store, null!, NullLogger<DevicesController>.Instance);

        var newGroup = new DeviceGroup
        {
            Name = "Racing Simulators",
            Description = "كراسي محاكاة القيادة الاحترافية مع مقود Force Feedback",
            DefaultHourlyRate = 1200.00m
        };

        var actionRes = controller.CreateDeviceGroup(newGroup);
        if (actionRes is not OkObjectResult ok || ok.Value is not DeviceGroup created)
            throw new Exception("Creating device group must return OkObjectResult.");

        if (created.Name != "Racing Simulators" || created.DefaultHourlyRate != 1200.00m)
            throw new Exception("Created group properties mismatch.");

        var groupsRes = controller.GetDeviceGroups();
        if (groupsRes.Result is not OkObjectResult okList || okList.Value is not List<DeviceGroupDto> list)
            throw new Exception("Querying device groups must return list.");

        if (!list.Any(g => g.Name == "Racing Simulators"))
            throw new Exception("Newly created group not found in list.");
    }
}
