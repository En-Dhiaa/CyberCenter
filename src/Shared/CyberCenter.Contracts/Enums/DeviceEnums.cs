namespace CyberCenter.Contracts.Enums;

public enum DeviceStatus
{
    Available = 0,
    Occupied = 1,
    Reserved = 2,
    Maintenance = 3,
    Offline = 4,
    Locked = 5,
    Error = 6
}

public enum SessionType
{
    Open = 0,
    TemporaryCard = 1,
    MemberPrepaid = 2,
    MemberSubscription = 3
}

public enum SessionStatus
{
    Active = 0,
    Paused = 1,
    Completed = 2,
    TerminatedByAdmin = 3,
    TerminatedTimeout = 4,
    TerminatedOfflineGraceExpired = 5
}

public enum TemporaryCardStatus
{
    Unused = 0,
    Active = 1,
    Depleted = 2,
    Expired = 3,
    Revoked = 4
}

public enum OrderStatus
{
    New = 0,
    AwaitingPayment = 1,
    Paid = 2,
    Preparing = 3,
    Ready = 4,
    Delivered = 5,
    Cancelled = 6
}

public enum PaymentMethod
{
    Cash = 0,
    Wallet = 1,
    ManualTransfer = 2,
    ElectronicGateway = 3
}

public enum DeviceCommandType
{
    LockStation = 1,
    UnlockStation = 2,
    RestartComputer = 3,
    ShutdownComputer = 4,
    DisplayMessage = 5,
    RefreshSessionLease = 6,
    SyncConfiguration = 7
}

