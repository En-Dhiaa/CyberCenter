using CyberCenter.API.Hubs;
using CyberCenter.Application.Interfaces;
using CyberCenter.Application.Services;
using CyberCenter.Infrastructure.Persistence;
using CyberCenter.Infrastructure.Services;
using CyberCenter.Workers;

var builder = WebApplication.CreateBuilder(args);

// Register Singleton Data Store & Services
builder.Services.AddSingleton<InMemoryDataStore>();
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "CyberCenterSuperSecretKey_2026_EnterpriseSecureToken!";
builder.Services.AddSingleton<IPasswordHasher, NativePasswordHasher>();
builder.Services.AddSingleton<IJwtTokenGenerator>(_ => new NativeTokenGenerator(jwtSecret));
builder.Services.AddSingleton(_ => new SessionLeaseManager(jwtSecret));

// Register Background Workers
builder.Services.AddHostedService<SessionLeaseWorker>();

// Register SignalR
builder.Services.AddSignalR();

// Register Controllers
builder.Services.AddControllers();

// Configure CORS for React Admin Dashboard
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDashboard", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowDashboard");
app.UseRouting();

app.MapControllers();
app.MapHub<DeviceHub>("/hubs/devices");

// Root Health & System Diagnostic Endpoint
app.MapGet("/", () => new
{
    system = "CyberCenter Central Server",
    status = "Online",
    version = "1.0.0",
    serverTimeUtc = DateTime.UtcNow,
    dashboardUrl = "http://localhost:3000",
    docs = "https://github.com/CyberCenter/docs"
});

app.Run();
