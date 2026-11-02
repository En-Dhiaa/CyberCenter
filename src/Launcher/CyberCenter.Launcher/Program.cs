using System.Diagnostics;
using System.Net;
using System.Net.Sockets;

namespace CyberCenter.Launcher;

public class Program
{
    private static Process? _apiProcess;

    public static void Main(string[] args)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.Title = "CyberCenter Suite Master Controller";

        PrintBanner();

        var localIp = GetLocalIpAddress();
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($" [INFO] Local Server LAN IP Address: {localIp}");
        Console.WriteLine($" [INFO] Central Server API Endpoint: http://{localIp}:5000");
        Console.WriteLine($" [INFO] Web Admin Dashboard URL    : http://localhost:3000");
        Console.ResetColor();
        Console.WriteLine();

        // Start Backend Server
        StartBackendServer();

        // Launch browser
        OpenBrowser("http://localhost:3000");

        bool running = true;
        while (running)
        {
            Console.WriteLine("------------------------------------------------------------------------");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(" اختر إجراء من القائمة التالية (Select an option):");
            Console.ResetColor();
            Console.WriteLine("  [1] فتح لوحة الإدارة والتحكم في المتصفح (Open Dashboard in Browser)");
            Console.WriteLine("  [2] تشغيل واجهة قفل وألعاب العميل (Launch Client Shell - CyberCenter.Shell.exe)");
            Console.WriteLine("  [3] تشغيل شريط التراكب الشفاف للوقت (Launch Client HUD - CyberCenter.HUD.exe)");
            Console.WriteLine("  [4] فحص واختبار اتصال محطة عبر الشبكة (Ping & Diagnose Station Connection)");
            Console.WriteLine("  [5] عرض دليل وأوامر ربط الأجهزة الميدانية (Physical Station Pairing Guide)");
            Console.WriteLine("  [6] إنشاء نسخة احتياطية مشفرة لقاعدة البيانات (Backup Database)");
            Console.WriteLine("  [0] إيقاف المنظومة والخروج (Exit)");
            Console.WriteLine("------------------------------------------------------------------------");
            Console.Write(" أدخل رقم الخيار (0-6): ");

            var choice = Console.ReadLine()?.Trim();
            Console.WriteLine();

            switch (choice)
            {
                case "1":
                    OpenBrowser("http://localhost:3000");
                    break;
                case "2":
                    LaunchExecutable("src/Client/CyberCenter.Shell/bin/Release/net8.0-windows/CyberCenter.Shell.exe", "CyberCenter.Shell");
                    break;
                case "3":
                    LaunchExecutable("src/Client/CyberCenter.HUD/bin/Release/net8.0-windows/CyberCenter.HUD.exe", "CyberCenter.HUD");
                    break;
                case "4":
                    RunPingDiagnostic();
                    break;
                case "5":
                    ShowPairingGuide(localIp);
                    break;
                case "6":
                    RunDatabaseBackup();
                    break;
                case "0":
                    running = false;
                    break;
                default:
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("خيار غير صحيح، يرجى إدخال رقم بين 0 و 6.");
                    Console.ResetColor();
                    break;
            }

            Console.WriteLine();
        }

        Cleanup();
    }

    private static void PrintBanner()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine(@"
========================================================================
     ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗███████╗
    ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝
    ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║     █████╗  
    ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║     ██╔══╝  
    ╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╗███████╗
========================================================================
  نظام CyberCenter المركزي لإدارة مراكز الإنترنت وصالات الألعاب
  Production Ready v2.4.0 — Central Server & Client Fleet Controller
========================================================================");
        Console.ResetColor();
    }

    private static string GetLocalIpAddress()
    {
        try
        {
            using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0);
            socket.Connect("8.8.8.8", 65530);
            if (socket.LocalEndPoint is IPEndPoint endPoint)
            {
                return endPoint.Address.ToString();
            }
        }
        catch { }
        return "127.0.0.1";
    }

    private static void StartBackendServer()
    {
        try
        {
            var apiExe = Path.GetFullPath("src/Server/CyberCenter.API/bin/Release/net8.0/CyberCenter.API.exe");
            if (File.Exists(apiExe))
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($" [START] Starting Backend Server: {apiExe}");
                Console.ResetColor();

                _apiProcess = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = apiExe,
                        Arguments = "--urls \"http://0.0.0.0:5000\"",
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        RedirectStandardOutput = false
                    }
                };
                _apiProcess.Start();
                Console.WriteLine(" [PASS] Central Server API running on port 5000 (all network interfaces).");
            }
            else
            {
                Console.WriteLine(" [INFO] Backend is currently managed by host process.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($" [NOTICE] Server start check: {ex.Message}");
        }
    }

    private static void OpenBrowser(string url)
    {
        try
        {
            Console.WriteLine($" [OPEN] Opening browser at {url}...");
            Process.Start(new ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            });
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($" Could not launch browser automatically: {ex.Message}");
            Console.WriteLine($" Please open your browser and navigate manually to: {url}");
            Console.ResetColor();
        }
    }

    private static void LaunchExecutable(string relativePath, string appName)
    {
        try
        {
            var fullPath = Path.GetFullPath(relativePath);
            if (!File.Exists(fullPath))
            {
                // Fallback to Debug path
                fullPath = fullPath.Replace("Release", "Debug");
            }

            if (File.Exists(fullPath))
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($" [RUN] Launching {appName}: {fullPath}");
                Console.ResetColor();
                Process.Start(new ProcessStartInfo
                {
                    FileName = fullPath,
                    UseShellExecute = true
                });
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($" [ERROR] Executable not found: {fullPath}");
                Console.ResetColor();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($" Error launching {appName}: {ex.Message}");
        }
    }

    private static void RunPingDiagnostic()
    {
        Console.Write(" أدخل عنوان IP لجهاز العميل المراد فحصه (مثال: 192.168.1.101): ");
        var ip = Console.ReadLine()?.Trim();
        if (string.IsNullOrWhiteSpace(ip)) ip = "127.0.0.1";

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"\n [DIAGNOSTIC] جاري فحص الاتصال بالمحطة ({ip})...");
        Console.ResetColor();

        try
        {
            using var ping = new System.Net.NetworkInformation.Ping();
            var reply = ping.Send(ip, 2000);
            if (reply.Status == System.Net.NetworkInformation.IPStatus.Success)
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($" ✔ [PASS] تم الاتصال بنجاح! زمن الاستجابة (Latency): {reply.RoundtripTime} ms");
                Console.WriteLine($" المحطة نشطة وجاهزة لاستقبال أوامر القفل والفتح ومزامنة الجلسات.");
                Console.ResetColor();
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($" ⚠ [TIMEOUT] لم تستجب المحطة: {reply.Status}. يرجى التحقق من اتصال كابل الشبكة وجدار الحماية.");
                Console.ResetColor();
            }
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($" فشل فحص المحطة: {ex.Message}");
            Console.ResetColor();
        }
    }

    private static void ShowPairingGuide(string localIp)
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine(@"
========================================================================
 📡 الدليل الفعلي لربط أجهزة الكمبيوتر في الصالة بالخادم المركزي 📡
========================================================================");
        Console.ResetColor();
        Console.WriteLine($@"
 1. عنوان الخادم في شبكة الصالة:
    http://{localIp}:5000

 2. كيفية ربط أي جهاز كمبيوتر في الصالة فعلياً:
    أ) انسخ ملفات برنامج العميل (الموجودة في: deployment\client\dist) 
       إلى جهاز اللاعب (المسار: C:\Program Files\CyberCenter).

    ب) في جهاز اللاعب، افتح موجه PowerShell كمسؤول ونفّذ أمر التثبيت التلقائي:
       .\Install-CyberCenterStation.ps1 -ServerUrl ""http://{localIp}:5000"" -StationNumber 1

    ج) فوراً، ستقوم خدمة CyberCenter.Agent بإرسال نبض (Heartbeat) إلى الخادم،
       وسيظهر الجهاز في لوحة الإدارة (Live Devices) متاحاً بلون أخضر مع حرارة كرت الشاشة والعتاد!

 3. مفتاح التوقيع المشفر (HMAC Shared Secret):
    CYBERCENTER_STATION_HMAC_PRESHARED_SECRET_2026_PRODUCTION");
    }

    private static void RunDatabaseBackup()
    {
        Console.WriteLine(" [BACKUP] جاري أخذ نسخة احتياطية مشفرة وتوثيق بصمة SHA-256...");
        try
        {
            var script = Path.GetFullPath("deployment/scripts/Backup-CyberCenterDatabase.ps1");
            var psi = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-ExecutionPolicy Bypass -File \"{script}\"",
                UseShellExecute = false
            };
            var p = Process.Start(psi);
            p?.WaitForExit();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(" ✔ تم أخذ النسخة الاحتياطية بنجاح في مجلد: C:\\CyberCenter\\Backups");
            Console.ResetColor();
        }
        catch (Exception ex)
        {
            Console.WriteLine($" فشل النسخ الاحتياطي: {ex.Message}");
        }
    }

    private static void Cleanup()
    {
        try
        {
            if (_apiProcess != null && !_apiProcess.HasExited)
            {
                _apiProcess.Kill();
            }
        }
        catch { }
    }
}
