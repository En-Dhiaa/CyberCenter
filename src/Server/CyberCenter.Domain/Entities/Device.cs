using CyberCenter.Contracts.Enums;

namespace CyberCenter.Domain.Entities;

public class DeviceGroup : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal DefaultHourlyRate { get; set; } = 500.00m;
    public ICollection<Device> Devices { get; set; } = new List<Device>();
}

public class Device : BaseEntity
{
    public int DeviceNumber { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public Guid? GroupId { get; set; }
    public DeviceGroup? Group { get; set; }

    public string MacAddress { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; } = DeviceStatus.Available;

    public decimal? CustomHourlyRate { get; set; }
    public string? HardwareSpecsJson { get; set; }
    public string? AgentVersion { get; set; }
    public DateTime? LastHeartbeatUtc { get; set; }
    public string SecretKey { get; set; } = Guid.NewGuid().ToString("N");

    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}

