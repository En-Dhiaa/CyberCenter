using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;

namespace CyberCenter.Application.Interfaces;

public interface ISessionService
{
    Task<SessionLeaseDto> StartOpenSessionAsync(Guid deviceId, string? operatorNotes, CancellationToken ct = default);
    Task<SessionLeaseDto> StartTemporaryCardSessionAsync(Guid deviceId, string pin, CancellationToken ct = default);
    Task<SessionLeaseDto> StartMemberSessionAsync(Guid deviceId, string username, string password, CancellationToken ct = default);
    Task<SessionLeaseDto> RenewLeaseAsync(Guid sessionId, Guid deviceId, CancellationToken ct = default);
    Task TerminateSessionAsync(Guid sessionId, string reason, CancellationToken ct = default);
}

public interface ITemporaryCardService
{
    Task<CardBatch> GenerateCardBatchAsync(string batchName, int count, int durationMinutes, decimal price, Guid createdByUserId, CancellationToken ct = default);
    Task<(bool Success, TemporaryCard? Card, string? Error)> ValidateAndRedeemPinAsync(string pin, CancellationToken ct = default);
    string HashPin(string pin);
    bool VerifyPin(string pin, string hash);
    string GenerateRandom16DigitPin();
}

public interface IDeviceFleetService
{
    Task<Device> RegisterOrUpdateDeviceAsync(string machineName, string macAddress, string ipAddress, CancellationToken ct = default);
    Task RecordHeartbeatAsync(DeviceHeartbeatDto heartbeat, CancellationToken ct = default);
    Task<bool> SendCommandAsync(Guid deviceId, DeviceCommandType commandType, string? payload, Guid adminUserId, CancellationToken ct = default);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, IEnumerable<string> roles);
}

