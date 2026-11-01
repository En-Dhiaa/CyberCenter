using System.Net.Http.Json;
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
    private DeviceStatus _currentStatus = DeviceStatus.Available;
    private const string ServerBaseUrl = "http://localhost:5000";

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
        _httpClient = new HttpClient { BaseAddress = new Uri(ServerBaseUrl), Timeout = TimeSpan.FromSeconds(5) };
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("CyberCenter.Agent worker service starting on workstation {MachineName} (Device ID: {DeviceId})...",
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
                    _logger.LogDebug("Heartbeat successfully accepted by central server.");
                }
                else
                {
                    _logger.LogWarning("Heartbeat returned status: {Status}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Server unreachable during heartbeat cycle (retrying): {Message}", ex.Message);
            }

            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}
