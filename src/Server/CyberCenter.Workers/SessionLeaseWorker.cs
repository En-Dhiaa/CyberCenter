using CyberCenter.Contracts.Enums;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CyberCenter.Workers;

public class SessionLeaseWorker : BackgroundService
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<SessionLeaseWorker> _logger;

    public SessionLeaseWorker(InMemoryDataStore dataStore, ILogger<SessionLeaseWorker> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SessionLeaseWorker background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;
                var staleThreshold = now.AddSeconds(-30);

                foreach (var device in _dataStore.Devices.Values)
                {
                    if (device.Status != DeviceStatus.Offline &&
                        device.Status != DeviceStatus.Maintenance &&
                        device.LastHeartbeatUtc.HasValue &&
                        device.LastHeartbeatUtc.Value < staleThreshold)
                    {
                        _logger.LogWarning("Device #{Number} ({Name}) missed heartbeat. Marking as Offline.",
                            device.DeviceNumber, device.DeviceName);
                        device.Status = DeviceStatus.Offline;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in SessionLeaseWorker execution cycle.");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }

        _logger.LogInformation("SessionLeaseWorker background service stopped.");
    }
}
