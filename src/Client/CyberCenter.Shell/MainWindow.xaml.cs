using System.Windows;

namespace CyberCenter.Shell;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void BtnLogin_Click(object sender, RoutedEventArgs e)
    {
        var pin = TxtCardPin.Text.Trim();
        if (string.IsNullOrEmpty(pin) || pin.Length < 16)
        {
            MessageBox.Show("يرجى إدخال رمز الكرت المكون من 16 رقماً بصورة صحيحة.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        MessageBox.Show($"جاري التحقق من صلاحية الكرت والتواصل مع الخادم المركزي...", "طلب بدء جلسة", MessageBoxButton.OK, MessageBoxImage.Information);
    }
}

