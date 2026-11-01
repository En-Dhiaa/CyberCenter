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
        Console.WriteLine(" ⚡ CYBERCENTER AUTOMATED TEST SUITE (PHASE 4 SESSIONS & CARDS ENGINE) ⚡");
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

        // 11. Phase 4: Sessions Engine Tests
        RunTest("Sessions: Start open session locks station and accrues cost", Test_Sessions_StartOpenSession_AccruesCostAndLocksStation);
        RunTest("Sessions: Start temporary card session validates 16-digit PIN and deducts time", Test_Sessions_StartCardSession_ValidatesPinAndDeductsTime);
        RunTest("Sessions: Extend active session adds remaining time", Test_Sessions_Extend_AddsRemainingTime);
        RunTest("Sessions: Terminate session marks station available and records audit", Test_Sessions_Terminate_FreesStationAndSavesAudit);

        // 12. Phase 4: Temporary Cards & CSV Export Tests
        RunTest("TemporaryCards: Create card batch generates unique 16-digit verifiable PINs", Test_TemporaryCards_CreateBatch_Generates16DigitPins);
        RunTest("TemporaryCards: Export batch CSV produces downloadable formatted file", Test_TemporaryCards_ExportCsv_ContainsHeadersAndPins);

        // 13. Phase 4: Members & Subscriptions Tests
        RunTest("Members: Create member and recharge wallet balance and minutes", Test_Members_CreateAndRechargeWallet);
        RunTest("Members: Toggle status successfully suspends and reactivates member account", Test_Members_ToggleStatus_ActivatesAndSuspends);

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

    // 11. Phase 4: Sessions Engine Tests
    private static void Test_Sessions_StartOpenSession_AccruesCostAndLocksStation()
    {
        var store = new InMemoryDataStore();
        var leaseManager = new SessionLeaseManager("TestSuperSecretKeyForSigningLease1234567890!");
        var controller = new SessionsController(store, leaseManager, null!, NullLogger<SessionsController>.Instance);

        var device = store.Devices.Values.First();
        device.Status = DeviceStatus.Available;

        var request = new StartOpenSessionRequestDto(device.Id, "VIP Guest Open Session");
        var res = controller.StartOpenSession(request).GetAwaiter().GetResult();

        if (res.Result is not OkObjectResult ok || ok.Value is not SessionDetailsDto sessionDto)
            throw new Exception("StartOpenSession must return OkObjectResult with SessionDetailsDto.");

        if (sessionDto.SessionType != "Open")
            throw new Exception("SessionType must be Open.");

        if (device.Status != DeviceStatus.Occupied)
            throw new Exception("Device status must be updated to Occupied.");

        if (!store.AuditLogs.Any(a => a.Action == "StartOpenSession" && a.EntityId == sessionDto.Id.ToString()))
            throw new Exception("Audit log for StartOpenSession was not created.");
    }

    private static void Test_Sessions_StartCardSession_ValidatesPinAndDeductsTime()
    {
        var store = new InMemoryDataStore();
        var leaseManager = new SessionLeaseManager("TestSuperSecretKeyForSigningLease1234567890!");
        var cardController = new TemporaryCardsController(store, NullLogger<TemporaryCardsController>.Instance);
        var sessionController = new SessionsController(store, leaseManager, null!, NullLogger<SessionsController>.Instance);

        // 1. Generate batch with 1 card of 60 mins
        var batchRes = cardController.GenerateCardBatch(new GenerateCardBatchRequestDto(
            BatchName: "Test 1-Hour Batch",
            CardCount: 1,
            DurationMinutes: 60,
            PricePerCard: 500.00m,
            ValidDays: 30
        ));

        if (batchRes.Result is not OkObjectResult okBatch || okBatch.Value is not GenerateCardBatchResponseDto batchDto)
            throw new Exception("Failed to create temporary card batch.");

        var cards = store.TemporaryCards.Values.ToList();
        if (cards.Count == 0)
            throw new Exception("No temporary cards stored.");

        // Extract cleartext PIN from batch generation response
        string cleanPin = batchDto.PrintableCards.First().CleartextPin;

        var device = store.Devices.Values.First();
        device.Status = DeviceStatus.Available;

        // 2. Start session with the PIN
        var startRes = sessionController.StartCardSession(new StartCardSessionRequestDto(device.Id, cleanPin)).GetAwaiter().GetResult();
        if (startRes.Result is not OkObjectResult okSession || okSession.Value is not SessionDetailsDto sessionDto)
            throw new Exception("StartCardSession failed with valid PIN.");

        if (sessionDto.SessionType != "TemporaryCard")
            throw new Exception("SessionType must be TemporaryCard.");

        if (device.Status != DeviceStatus.Occupied)
            throw new Exception("Station status must become Occupied.");
    }

    private static void Test_Sessions_Extend_AddsRemainingTime()
    {
        var store = new InMemoryDataStore();
        var leaseManager = new SessionLeaseManager("TestSuperSecretKeyForSigningLease1234567890!");
        var controller = new SessionsController(store, leaseManager, null!, NullLogger<SessionsController>.Instance);

        var device = store.Devices.Values.First();
        device.Status = DeviceStatus.Available;

        var startRes = controller.StartOpenSession(new StartOpenSessionRequestDto(device.Id, "Extend Test")).GetAwaiter().GetResult();
        var sessionDto = (SessionDetailsDto)((OkObjectResult)startRes.Result!).Value!;

        var extendRes = controller.ExtendSession(sessionDto.Id, new ExtendSessionRequestDto(30)).GetAwaiter().GetResult();
        if (extendRes is not OkObjectResult)
            throw new Exception("ExtendSession must return OkObjectResult.");

        var session = store.Sessions[sessionDto.Id];
        if (session.AllocatedSeconds != 30 * 60)
            throw new Exception("Session allocated seconds was not extended by 30 minutes.");
    }

    private static void Test_Sessions_Terminate_FreesStationAndSavesAudit()
    {
        var store = new InMemoryDataStore();
        var leaseManager = new SessionLeaseManager("TestSuperSecretKeyForSigningLease1234567890!");
        var controller = new SessionsController(store, leaseManager, null!, NullLogger<SessionsController>.Instance);

        var device = store.Devices.Values.First();
        device.Status = DeviceStatus.Available;

        var startRes = controller.StartOpenSession(new StartOpenSessionRequestDto(device.Id, "Terminate Test")).GetAwaiter().GetResult();
        var sessionDto = (SessionDetailsDto)((OkObjectResult)startRes.Result!).Value!;

        var termRes = controller.TerminateSession(sessionDto.Id, new TerminateSessionRequestDto("Client Paid and Left")).GetAwaiter().GetResult();
        if (termRes is not OkObjectResult)
            throw new Exception("TerminateSession must return OkObjectResult.");

        var session = store.Sessions[sessionDto.Id];
        if (session.Status != SessionStatus.Completed)
            throw new Exception("Session status must be Completed.");

        if (device.Status != DeviceStatus.Available)
            throw new Exception("Device must be released back to Available.");

        if (!store.AuditLogs.Any(a => a.Action == "TerminateSession" && a.EntityId == sessionDto.Id.ToString()))
            throw new Exception("Audit log for TerminateSession was not recorded.");
    }

    // 12. Phase 4: Temporary Cards Batch & Export Tests
    private static void Test_TemporaryCards_CreateBatch_Generates16DigitPins()
    {
        var store = new InMemoryDataStore();
        var controller = new TemporaryCardsController(store, NullLogger<TemporaryCardsController>.Instance);

        var req = new GenerateCardBatchRequestDto(
            BatchName: "Weekend Promo 50 Cards",
            CardCount: 10,
            DurationMinutes: 120,
            PricePerCard: 1000.00m,
            ValidDays: 7
        );

        var res = controller.GenerateCardBatch(req);
        if (res.Result is not OkObjectResult ok || ok.Value is not GenerateCardBatchResponseDto batchDto)
            throw new Exception("GenerateCardBatch must return Ok with GenerateCardBatchResponseDto.");

        var cards = store.TemporaryCards.Values.ToList();
        if (cards.Count != 10)
            throw new Exception($"Expected 10 cards, got {cards.Count}");

        foreach (var cardSummary in batchDto.PrintableCards)
        {
            string rawPin = cardSummary.CleartextPin;
            string masked = cardSummary.MaskedCode;
            Guid cardId = cardSummary.CardId;
            var cardEntity = store.TemporaryCards[cardId];

            if (string.IsNullOrWhiteSpace(rawPin) || rawPin.Length != 16)
                throw new Exception("Each card must have a raw 16-digit PIN on batch generation.");

            if (!masked.StartsWith("CC-****-****-"))
                throw new Exception("Card masked code must follow CC-****-****-XXXX pattern.");

            if (!TemporaryCardSecurity.VerifyPin(rawPin, cardEntity.BatchId.ToString("N"), cardEntity.PinHash))
                throw new Exception("Card PIN must verify against its stored PBKDF2 hash.");
        }
    }

    private static void Test_TemporaryCards_ExportCsv_ContainsHeadersAndPins()
    {
        var store = new InMemoryDataStore();
        var controller = new TemporaryCardsController(store, NullLogger<TemporaryCardsController>.Instance);

        var batchRes = controller.GenerateCardBatch(new GenerateCardBatchRequestDto(
            BatchName: "CSV Export Batch",
            CardCount: 3,
            DurationMinutes: 90,
            PricePerCard: 750.00m,
            ValidDays: 14
        ));

        var batchDto = (GenerateCardBatchResponseDto)((OkObjectResult)batchRes.Result!).Value!;

        var csvRes = controller.ExportBatchCsv(batchDto.BatchId);

        if (csvRes is not FileContentResult fileResult)
            throw new Exception("ExportBatchCsv must return FileContentResult.");

        var csvString = System.Text.Encoding.UTF8.GetString(fileResult.FileContents);
        if (!csvString.Contains("CardId,CardCode,DurationMinutes,RemainingMinutes,Status,ExpiresAtUtc"))
            throw new Exception("CSV missing standard export headers.");

        if (fileResult.ContentType != "text/csv")
            throw new Exception("Content type must be text/csv.");
    }

    // 13. Phase 4: Members & Subscriptions Tests
    private static void Test_Members_CreateAndRechargeWallet()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var controller = new MembersController(store, hasher, NullLogger<MembersController>.Instance);

        var createReq = new CreateMemberRequestDto(
            Username: "gamer_pro_77",
            Password: "SecurePassword123!",
            FullName: "محمد عبدالملك",
            PhoneNumber: "+967 777 888 999",
            Email: "gamer@cybercenter.local",
            InitialDeposit: 3000.00m,
            InitialMinutes: 180
        );

        var res = controller.CreateMember(createReq);
        if (res is not CreatedAtActionResult created || created.Value is not User member)
            throw new Exception("CreateMember must return CreatedAtActionResult with User entity.");

        if (member.WalletBalance != 3000.00m || member.RemainingSeconds != 180 * 60)
            throw new Exception("Initial deposit and minutes do not match request.");

        // Recharge wallet
        var rechargeRes = controller.RechargeMember(member.Id, new RechargeMemberRequestDto(
            Amount: 5000.00m,
            AdditionalMinutes: 60,
            PaymentMethod: "Cash"
        ));

        if (rechargeRes is not OkObjectResult)
            throw new Exception("RechargeMember must return OkObjectResult.");

        if (member.WalletBalance != 8000.00m)
            throw new Exception($"Wallet balance mismatch: expected 8000, got {member.WalletBalance}");

        if (member.RemainingSeconds != 240 * 60)
            throw new Exception($"Remaining seconds mismatch: expected 14400, got {member.RemainingSeconds}");
    }

    private static void Test_Members_ToggleStatus_ActivatesAndSuspends()
    {
        var store = new InMemoryDataStore();
        var hasher = new NativePasswordHasher();
        var controller = new MembersController(store, hasher, NullLogger<MembersController>.Instance);

        var createReq = new CreateMemberRequestDto(
            Username: "gamer_to_suspend",
            Password: "Pass!",
            FullName: "عضو للتجربة",
            PhoneNumber: null,
            Email: null,
            InitialDeposit: 0,
            InitialMinutes: 0
        );

        var res = controller.CreateMember(createReq);
        var member = (User)((CreatedAtActionResult)res).Value!;

        // Suspend member
        var suspendRes = controller.ToggleMemberStatus(member.Id, false);
        if (suspendRes is not OkObjectResult)
            throw new Exception("ToggleMemberStatus(false) failed.");

        if (member.IsActive)
            throw new Exception("Member must be inactive after suspension.");

        // Reactivate member
        var reactivateRes = controller.ToggleMemberStatus(member.Id, true);
        if (reactivateRes is not OkObjectResult)
            throw new Exception("ToggleMemberStatus(true) failed.");

        if (!member.IsActive)
            throw new Exception("Member must be active after reactivation.");
    }
}
