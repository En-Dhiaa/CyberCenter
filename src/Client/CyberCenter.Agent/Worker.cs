using System.Net.Http.Json;
using CyberCenter.Application.Services;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CyberCenter.Agent;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly HttpClient _httpClient;
    private readonly Guid _deviceId = Guid.NewGuid();
    private readonly string _deviceSecretKey;
    private DeviceStatus _currentStatus = DeviceStatus.Available;
    private const string ServerBaseUrl = "http://localhost:5000";

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
        _httpClient = new HttpClient { BaseAddress = new Uri(ServerBaseUrl), Timeout = TimeSpan.FromSeconds(5) };
        _deviceSecretKey = Guid.NewGuid().ToString("N");
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("CyberCenter.Agent Windows service started on station {MachineName} (ID: {DeviceId}).",
            Environment.MachineName, _deviceId);
        return base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var heartbeat = new DeviceHeartbeatDto(
                    DeviceId: _deviceId,
                    MachineName: Environment.MachineName,
                    IpAddress: "127.0.0.1",
                    MacAddress: "00:1A:2B:3C:4D:5E",
                    ReportedStatus: _currentStatus,
                    CpuUsagePercentage: 14.5,
                    RamUsagePercentage: 38.2,
                    DownloadSpeedMbps: 22.4,
                    UploadSpeedMbps: 4.1,
                    SessionConsumedBytes: 5242880,
                    AgentVersion: "1.0.0"
                );

                var response = await _httpClient.PostAsJsonAsync("/api/v1/devices/heartbeat", heartbeat, stoppingToken);
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogDebug("Station heartbeat acknowledged by central server.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Heartbeat dispatch deferred (network retry): {Message}", ex.Message);
            }

            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }

    public bool ProcessIncomingRemoteCommand(RemoteCommandDto command)
    {
        // 1. Verify Cryptographic Signature and Freshness
        if (!DeviceCommandSigner.VerifyCommandSignature(command, _deviceSecretKey))
        {
            _logger.LogError("SECURITY REJECTION: Command {Type} signature or nonce verification failed!", command.CommandType);
            return false;
        }

        // 2. Execute Allowlisted System Action
        switch (command.CommandType)
        {
            case DeviceCommandType.LockStation:
                _currentStatus = DeviceStatus.Locked;
                _logger.LogWarning("STATION LOCKED by signed central command.");
                break;

            case DeviceCommandType.UnlockStation:
                _currentStatus = DeviceStatus.Available;
                _logger.LogInformation("STATION UNLOCKED by signed central command.");
                break;

            case DeviceCommandType.DisplayMessage:
                _logger.LogInformation("DISPLAY NOTIFICATION ALERT: {Message}", command.Payload);
                break;

            case DeviceCommandType.RestartComputer:
                _logger.LogWarning("RESTART COMPUTER authorized and signed by SuperAdmin.");
                break;

            case DeviceCommandType.ShutdownComputer:
                _logger.LogWarning("SHUTDOWN COMPUTER authorized and signed by SuperAdmin.");
                break;

            default:
                _logger.LogWarning("Unsupported command type received: {Type}", command.CommandType);
                return false;
        }

        return true;
    }
}
