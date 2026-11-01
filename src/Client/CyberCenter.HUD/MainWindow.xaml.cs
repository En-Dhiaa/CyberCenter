using System;
using System.Media;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;

namespace CyberCenter.HUD;

public partial class MainWindow : Window
{
    private readonly DispatcherTimer _hudTimer;
    private int _remainingSeconds = 6320; // 01:45:20
    private readonly Random _rand = new();

    public MainWindow()
    {
        InitializeComponent();

        _hudTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(1)
        };
        _hudTimer.Tick += HudTimer_Tick;
        _hudTimer.Start();

        UpdateHudDisplay();
    }

    private void HudTimer_Tick(object? sender, EventArgs e)
    {
        if (_remainingSeconds > 0)
        {
            _remainingSeconds--;
        }

        // Fluctuate speed slightly
        var speed = 40 + _rand.Next(0, 35);
        TxtSpeed.Text = $"↓ {speed} MB/s";

        UpdateHudDisplay();
    }

    private void UpdateHudDisplay()
    {
        var ts = TimeSpan.FromSeconds(_remainingSeconds);
        TxtHudCountdown.Text = ts.ToString(@"hh\:mm\:ss");

        if (_remainingSeconds <= 120)
        {
            // Critical alert
            HudContainer.BorderBrush = (SolidColorBrush)FindResource("BorderRose");
            TxtHudCountdown.Foreground = (SolidColorBrush)FindResource("RoseAccent");
            if (_remainingSeconds % 30 == 0 && _remainingSeconds > 0)
            {
                SystemSounds.Exclamation.Play();
            }
        }
        else if (_remainingSeconds <= 600)
        {
            // Warning < 10 mins
            HudContainer.BorderBrush = (SolidColorBrush)FindResource("BorderAmber");
            TxtHudCountdown.Foreground = (SolidColorBrush)FindResource("AmberAccent");
        }
        else
        {
            // Normal
            HudContainer.BorderBrush = (SolidColorBrush)FindResource("BorderCyan");
            TxtHudCountdown.Foreground = (SolidColorBrush)FindResource("TextMain");
        }
    }

    private void Window_MouseDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ChangedButton == MouseButton.Left)
        {
            DragMove();
        }
    }

    private void QuickMenu_Click(object sender, MouseButtonEventArgs e)
    {
        MessageBox.Show(
            "CyberCenter Quick Menu (F8):\n\n" +
            "• الوقت المتبقي: " + TxtHudCountdown.Text + "\n" +
            "• المحطة: ST-04 (RTX 4080 Super)\n" +
            "• الرصيد الحالي: 14,500 ر.ي\n" +
            "• استدعاء المشرف: اضغط 1\n" +
            "• طلب مشروبات ووجبات: اضغط 2",
            "القائمة السريعة",
            MessageBoxButton.OK,
            MessageBoxImage.Information);
    }
}
