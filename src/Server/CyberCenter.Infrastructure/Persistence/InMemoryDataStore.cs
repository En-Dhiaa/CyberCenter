using System.Collections.Concurrent;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;

namespace CyberCenter.Infrastructure.Persistence;

public class InMemoryDataStore
{
    public ConcurrentDictionary<Guid, Device> Devices { get; } = new();
    public ConcurrentDictionary<Guid, DeviceGroup> DeviceGroups { get; } = new();
    public ConcurrentDictionary<Guid, Session> Sessions { get; } = new();
    public ConcurrentDictionary<Guid, TemporaryCard> TemporaryCards { get; } = new();
    public ConcurrentDictionary<Guid, CardBatch> CardBatches { get; } = new();
    public ConcurrentDictionary<Guid, User> Users { get; } = new();
    public ConcurrentDictionary<Guid, Product> Products { get; } = new();
    public ConcurrentDictionary<Guid, ProductCategory> ProductCategories { get; } = new();
    public ConcurrentDictionary<Guid, Order> Orders { get; } = new();
    public ConcurrentDictionary<Guid, FinancialTransaction> FinancialTransactions { get; } = new();
    public ConcurrentDictionary<Guid, Expense> Expenses { get; } = new();
    public ConcurrentDictionary<Guid, MonthlyClosing> MonthlyClosings { get; } = new();
    public ConcurrentBag<AuditLog> AuditLogs { get; } = new();

    public InMemoryDataStore()
    {
        SeedInitialData();
    }

    private void SeedInitialData()
    {
        // 1. Super Admin User
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var hasher = new Services.NativePasswordHasher();
        var adminUser = new User
        {
            Id = adminId,
            Username = "superadmin",
            FullName = "ضياء المهندس (Super Admin)",
            PasswordHash = hasher.HashPassword("Admin@Cyber2026!"),
            UserType = "SuperAdmin",
            IsActive = true
        };
        Users.TryAdd(adminUser.Id, adminUser);

        // 2. VIP Group
        var vipGroup = new DeviceGroup
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "VIP Lounge",
            Description = "محطات مجهزة بشاشات 240Hz وكروت RTX 4080",
            DefaultHourlyRate = 800.00m
        };
        DeviceGroups.TryAdd(vipGroup.Id, vipGroup);

        // 3. 8 Initial Stations
        for (int i = 1; i <= 8; i++)
        {
            var stationId = Guid.NewGuid();
            var device = new Device
            {
                Id = stationId,
                DeviceNumber = i,
                DeviceName = $"Station-{i:D2}",
                GroupId = vipGroup.Id,
                Group = vipGroup,
                MacAddress = $"00:1A:2B:3C:4D:{i:D2}",
                IpAddress = $"192.168.1.{100 + i}",
                Status = i == 6 ? DeviceStatus.Locked : DeviceStatus.Available,
                HardwareSpecsJson = "{\"cpu\":\"i9-14900K\",\"ram\":\"32GB DDR5\",\"gpu\":\"RTX 4080\"}",
                GpuTemperatureCelsius = Math.Round(52.0 + (i * 3.2), 1),
                CpuTemperatureCelsius = Math.Round(46.0 + (i * 2.5), 1),
                DiskFreeSpaceGb = Math.Round(500.0 - (i * 14.0), 1),
                LastHeartbeatUtc = DateTime.UtcNow
            };
            Devices.TryAdd(device.Id, device);
        }

        // 4. Store Categories & Products
        var drinksCategory = new ProductCategory
        {
            Id = Guid.NewGuid(),
            NameAr = "مشروبات ساخنة وباردة",
            NameEn = "Beverages & Drinks"
        };
        ProductCategories.TryAdd(drinksCategory.Id, drinksCategory);

        var redBull = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = drinksCategory.Id,
            NameAr = "مشروب طاقة ريدبول (Red Bull)",
            NameEn = "Red Bull Energy Drink",
            Price = 1200.00m,
            Cost = 900.00m,
            StockQuantity = 45,
            IsAvailable = true
        };
        Products.TryAdd(redBull.Id, redBull);

        var coffee = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = drinksCategory.Id,
            NameAr = "قهوة إسبريسو مزدوجة",
            NameEn = "Double Espresso Coffee",
            Price = 500.00m,
            Cost = 250.00m,
            StockQuantity = 100,
            IsAvailable = true
        };
        Products.TryAdd(coffee.Id, coffee);

        // 5. Seed Initial Expenses
        var exp1 = new Expense
        {
            Id = Guid.NewGuid(),
            ExpenseNumber = "EXP-202610-001",
            Category = "Internet",
            Amount = 45000.00m,
            Description = "اشتراك خط الألياف الضوئية المخصص للألعاب 1Gbps (شهر أكتوبر)",
            SpentBy = "ضياء المهندس",
            PaymentMethod = "Jawaly",
            CreatedAtUtc = DateTime.UtcNow.AddDays(-15)
        };
        Expenses.TryAdd(exp1.Id, exp1);

        var exp2 = new Expense
        {
            Id = Guid.NewGuid(),
            ExpenseNumber = "EXP-202610-002",
            Category = "Electricity",
            Amount = 32000.00m,
            Description = "فاتورة استهلاك الكهرباء والطاقة للمركز",
            SpentBy = "عمر الورد",
            PaymentMethod = "Cash",
            CreatedAtUtc = DateTime.UtcNow.AddDays(-10)
        };
        Expenses.TryAdd(exp2.Id, exp2);

        var exp3 = new Expense
        {
            Id = Guid.NewGuid(),
            ExpenseNumber = "EXP-202610-003",
            Category = "Supplies",
            Amount = 14500.00m,
            Description = "شراء منظفات ومعقمات لشاشات وسماعات الأجهزة",
            SpentBy = "أحمد السامعي",
            PaymentMethod = "Cash",
            CreatedAtUtc = DateTime.UtcNow.AddDays(-3)
        };
        Expenses.TryAdd(exp3.Id, exp3);

        // 6. Seed Initial Financial Transactions
        var txn1 = new FinancialTransaction
        {
            Id = Guid.NewGuid(),
            TransactionNumber = "TXN-20261025-001",
            TransactionType = "SessionRevenue",
            Amount = 125000.00m,
            Description = "إجمالي إيرادات جلسات الألعاب وكروت الدقائق (أسبوع 4)",
            CreatedByUserId = adminId,
            CreatedAtUtc = DateTime.UtcNow.AddDays(-6)
        };
        FinancialTransactions.TryAdd(txn1.Id, txn1);

        var txn2 = new FinancialTransaction
        {
            Id = Guid.NewGuid(),
            TransactionNumber = "TXN-20261025-002",
            TransactionType = "StoreRevenue",
            Amount = 48000.00m,
            Description = "إيرادات مبيعات المشروبات والوجبات الخفيفة",
            CreatedByUserId = adminId,
            CreatedAtUtc = DateTime.UtcNow.AddDays(-5)
        };
        FinancialTransactions.TryAdd(txn2.Id, txn2);

        var txn3 = new FinancialTransaction
        {
            Id = Guid.NewGuid(),
            TransactionNumber = "TXN-20261025-003",
            TransactionType = "MembershipDeposit",
            Amount = 35000.00m,
            Description = "شحن محافظ المشتركين والأعضاء الدائمين",
            CreatedByUserId = adminId,
            CreatedAtUtc = DateTime.UtcNow.AddDays(-4)
        };
        FinancialTransactions.TryAdd(txn3.Id, txn3);
    }
}

