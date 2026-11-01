using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Media;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;
using CyberCenter.Contracts.Games;

namespace CyberCenter.Shell;

public partial class MainWindow : Window
{
    private readonly DispatcherTimer _clockTimer;
    private readonly List<GameCatalogItem> _allGames;
    private List<GameCatalogItem> _filteredGames;

    private bool _isSessionActive = false;
    private int _remainingSeconds = 0;
    private int _consumedSeconds = 0;
    private decimal _walletOrCost = 0.00m;
    private string _activeUserName = "";
    private string _activeSessionType = "";

    public MainWindow()
    {
        InitializeComponent();

        _allGames = GameCatalogService.GetDefaultCatalog();
        _filteredGames = new List<GameCatalogItem>(_allGames);
        GamesItemsControl.ItemsSource = _filteredGames;

        // Initialize 1-second system clock & timer
        _clockTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(1)
        };
        _clockTimer.Tick += ClockTimer_Tick;
        _clockTimer.Start();

        UpdateLiveClock();
    }

    private void ClockTimer_Tick(object? sender, EventArgs e)
    {
        UpdateLiveClock();

        if (_isSessionActive)
        {
            _consumedSeconds++;

            if (_remainingSeconds > 0)
            {
                _remainingSeconds--;
                UpdateRemainingTimeDisplay();

                if (_remainingSeconds <= 0)
                {
                    HandleTimeExpired();
                }
            }
        }
    }

    private void UpdateLiveClock()
    {
        TxtLiveClock.Text = DateTime.Now.ToString("HH:mm:ss");
    }

    private void UpdateRemainingTimeDisplay()
    {
        var ts = TimeSpan.FromSeconds(_remainingSeconds);
        TxtRemainingCountdown.Text = ts.ToString(@"hh\:mm\:ss");

        if (_remainingSeconds <= 120)
        {
            // Critical warning (< 2 mins)
            BorderTimer.BorderBrush = (SolidColorBrush)FindResource("RoseAccent");
            TxtRemainingCountdown.Foreground = (SolidColorBrush)FindResource("RoseAccent");
            if (_remainingSeconds % 30 == 0)
            {
                SystemSounds.Exclamation.Play();
            }
        }
        else if (_remainingSeconds <= 600)
        {
            // Low time warning (< 10 mins)
            BorderTimer.BorderBrush = (SolidColorBrush)FindResource("AmberAccent");
            TxtRemainingCountdown.Foreground = (SolidColorBrush)FindResource("AmberAccent");
        }
        else
        {
            // Normal
            BorderTimer.BorderBrush = (SolidColorBrush)FindResource("CyanAccent");
            TxtRemainingCountdown.Foreground = (SolidColorBrush)FindResource("CyanAccent");
        }
    }

    private void HandleTimeExpired()
    {
        _isSessionActive = false;
        SystemSounds.Hand.Play();
        MessageBox.Show(
            "انتهى وقت الجلسة المخصص بالكامل!\nتم قفل المحطة بنجاح. شكراً لزيارتكم صالة CyberCenter.",
            "انتهاء الوقت",
            MessageBoxButton.OK,
            MessageBoxImage.Information);

        SwitchToLockedScreen();
    }

    // --- Tab Switching in Locked Screen ---
    private void TabBtnCard_Click(object sender, RoutedEventArgs e)
    {
        TabBtnCard.Background = (SolidColorBrush)FindResource("CyanAccent");
        TabBtnCard.Foreground = (SolidColorBrush)FindResource("BgDark");

        TabBtnMember.Background = Brushes.Transparent;
        TabBtnMember.Foreground = (SolidColorBrush)FindResource("TextMuted");

        FormCardPin.Visibility = Visibility.Visible;
        FormMember.Visibility = Visibility.Collapsed;
        TxtCardPin.Focus();
    }

    private void TabBtnMember_Click(object sender, RoutedEventArgs e)
    {
        TabBtnMember.Background = (SolidColorBrush)FindResource("CyanAccent");
        TabBtnMember.Foreground = (SolidColorBrush)FindResource("BgDark");

        TabBtnCard.Background = Brushes.Transparent;
        TabBtnCard.Foreground = (SolidColorBrush)FindResource("TextMuted");

        FormMember.Visibility = Visibility.Visible;
        FormCardPin.Visibility = Visibility.Collapsed;
        TxtMemberUsername.Focus();
    }

    // --- Card PIN Auto Formatting (XXXX-XXXX-XXXX-XXXX) ---
    private void TxtCardPin_TextChanged(object sender, TextChangedEventArgs e)
    {
        var raw = new string(TxtCardPin.Text.Where(char.IsDigit).ToArray());
        if (raw.Length > 16) raw = raw[..16];

        var formatted = string.Join("-", Enumerable.Range(0, (raw.Length + 3) / 4)
            .Select(i => raw.Substring(i * 4, Math.Min(4, raw.Length - i * 4))));

        if (TxtCardPin.Text != formatted)
        {
            TxtCardPin.Text = formatted;
            TxtCardPin.CaretIndex = formatted.Length;
        }
    }

    // --- Login Handlers ---
    private void BtnStartCardSession_Click(object sender, RoutedEventArgs e)
    {
        var rawDigits = new string(TxtCardPin.Text.Where(char.IsDigit).ToArray());
        if (rawDigits.Length != 16)
        {
            MessageBox.Show(
                "يرجى إدخال رمز الكرت المكون من 16 رقماً بصورة صحيحة.",
                "رمز غير مكتمل",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
            return;
        }

        // Initialize active session with temporary card (default 120 minutes for demo)
        StartActiveSession(
            userDisplayName: $"كرت مؤقت CC-****-****-{rawDigits[^4..]}",
            sessionType: "جلسة كرت مؤقت (Temporary Card)",
            allocatedMinutes: 120,
            walletOrCost: 1000.00m);
    }

    private void BtnStartMemberSession_Click(object sender, RoutedEventArgs e)
    {
        var user = TxtMemberUsername.Text.Trim();
        var pass = TxtMemberPassword.Password;

        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass))
        {
            MessageBox.Show(
                "يرجى إدخال اسم المستخدم وكلمة المرور.",
                "بيانات مطلوبة",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
            return;
        }

        // Initialize active session for member (e.g. 180 minutes)
        StartActiveSession(
            userDisplayName: $"{user} (عضو دائم)",
            sessionType: "عضوية ذهبية (Gold Member)",
            allocatedMinutes: 180,
            walletOrCost: 5500.00m);
    }

    private void StartActiveSession(string userDisplayName, string sessionType, int allocatedMinutes, decimal walletOrCost)
    {
        _isSessionActive = true;
        _remainingSeconds = allocatedMinutes * 60;
        _consumedSeconds = 0;
        _walletOrCost = walletOrCost;
        _activeUserName = userDisplayName;
        _activeSessionType = sessionType;

        TxtActiveUser.Text = _activeUserName;
        TxtSessionType.Text = _activeSessionType;
        TxtActiveCost.Text = $"{_walletOrCost:N0} ر.ي";

        UpdateRemainingTimeDisplay();

        PanelLockedWelcome.Visibility = Visibility.Collapsed;
        PanelActiveSession.Visibility = Visibility.Visible;

        // Sound indicator
        SystemSounds.Asterisk.Play();
    }

    private void SwitchToLockedScreen()
    {
        _isSessionActive = false;
        TxtCardPin.Clear();
        TxtMemberUsername.Clear();
        TxtMemberPassword.Clear();

        PanelActiveSession.Visibility = Visibility.Collapsed;
        PanelLockedWelcome.Visibility = Visibility.Visible;
    }

    // --- Games Filtering & Search ---
    private void TxtSearchGame_TextChanged(object sender, TextChangedEventArgs e)
    {
        ApplyGamesFilter();
    }

    private void FilterCategory_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is string category)
        {
            if (category == "All")
            {
                _filteredGames = new List<GameCatalogItem>(_allGames);
            }
            else
            {
                _filteredGames = _allGames.Where(g => g.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            ApplyGamesFilter();
        }
    }

    private void ApplyGamesFilter()
    {
        var query = TxtSearchGame?.Text?.Trim().ToLowerInvariant() ?? "";
        var list = _filteredGames.AsEnumerable();

        if (!string.IsNullOrEmpty(query))
        {
            list = list.Where(g => g.Title.ToLowerInvariant().Contains(query) || g.Category.ToLowerInvariant().Contains(query));
        }

        GamesItemsControl.ItemsSource = list.ToList();
    }

    private void BtnLaunchGame_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is string gameTitle)
        {
            MessageBox.Show(
                $"جاري إطلاق وتشغيل لعبة {gameTitle} بأقصى أداء لبطاقة الرسومات والشاشة 240Hz...",
                "تشغيل اللعبة",
                MessageBoxButton.OK,
                MessageBoxImage.Information);
        }
    }

    // --- Action Buttons ---
    private void BtnCallStaff_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show(
            "تم إرسال إشعار فوري لمشرف الصالة والكاشير.\nسيتوجه أحد أفراد طاقم العمل لمحطتك فوراً.",
            "استدعاء المشرف",
            MessageBoxButton.OK,
            MessageBoxImage.Information);
    }

    private void BtnOrderSnacks_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show(
            "قائمة متجر الوجبات والمشروبات:\n- بيبسي مثلج (500 ر.ي)\n- برجر دجاج مقرمش (2,500 ر.ي)\n- مشروب طاقة ريدبول (1,800 ر.ي)\n\nسيتم فتح شاشة الطلب الفوري عبر المطبخ (KDS) في المرحلة القادمة.",
            "متجر الصالة",
            MessageBoxButton.OK,
            MessageBoxImage.Information);
    }

    private void BtnPauseLock_Click(object sender, RoutedEventArgs e)
    {
        var res = MessageBox.Show(
            "هل ترغب في قفل الشاشة مؤقتاً أثناء مغادرتك المحطة لحماية حسابك ولعبتك؟\n(يستمر احتساب وقت الجلسة أثناء القفل)",
            "قفل مؤقت للمحطة",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question);

        if (res == MessageBoxResult.Yes)
        {
            MessageBox.Show("تم تأمين المحطة. أدخل كلمة مرورك لاستئناف اللعب.", "المحطة مؤمنة");
        }
    }

    private void BtnLogoutSession_Click(object sender, RoutedEventArgs e)
    {
        var res = MessageBox.Show(
            "هل أنت متأكد من رغبتك في تسجيل الخروج وإنهاء الجلسة الحالية؟\nسيتم حفظ وقتك المتبقي في الكرت أو حسابك.",
            "تأكيد إنهاء الجلسة",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question);

        if (res == MessageBoxResult.Yes)
        {
            SwitchToLockedScreen();
        }
    }

    // --- Shortcuts & Window Security ---
    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.F8)
        {
            BtnCallStaff_Click(this, new RoutedEventArgs());
            e.Handled = true;
        }
    }

    private void Window_Closing(object sender, CancelEventArgs e)
    {
        // Prevent closing window via Alt+F4 when in locked mode
        if (!_isSessionActive)
        {
            e.Cancel = true;
        }
    }
}
