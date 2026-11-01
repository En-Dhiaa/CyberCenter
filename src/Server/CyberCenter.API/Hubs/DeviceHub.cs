using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using Microsoft.AspNetCore.SignalR;

namespace CyberCenter.API.Hubs;

public interface IDeviceClient
{
    Task ReceiveCommand(RemoteCommandDto command);
    Task StationStatusUpdated(Guid deviceId, DeviceStatus status);
    Task DisplayNotification(string message, string level);
}

public class DeviceHub : Hub<IDeviceClient>
{
    private readonly ILogger<DeviceHub> _logger;

    public DeviceHub(ILogger<DeviceHub> logger)
    {
        _logger = logger;
    }

    public async Task RegisterStation(string deviceId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Station_{deviceId}");
        _logger.LogInformation("Station {DeviceId} joined real-time channel with connection {ConnId}", deviceId, Context.ConnectionId);
    }

    public async Task JoinAdminDashboard()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AdminDashboard");
        _logger.LogInformation("Admin operator connected to Dashboard real-time stream: {ConnId}", Context.ConnectionId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Connection disconnected: {ConnId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}

