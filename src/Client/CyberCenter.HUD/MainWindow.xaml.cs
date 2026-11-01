using System.Windows;
using System.Windows.Input;

namespace CyberCenter.HUD;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        MouseDown += (s, e) =>
        {
            if (e.ChangedButton == MouseButton.Left)
                DragMove();
        };
    }
}

