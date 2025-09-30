using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Avalonia.Themes.Fluent;
using Avalonia.Media;
using Yeolpumta.ViewModels;
using Yeolpumta.Views;

namespace Yeolpumta
{
    public partial class App : Application
    {
        public override void Initialize()
        {
            AvaloniaXamlLoader.Load(this);
            // Programmatically add Fluent theme and sensible brushes so the UI is usable
            // even if XAML theme declarations are not present or mismatch package versions.
            try
            {
                // Add FluentTheme without setting version-specific properties to avoid
                // compile/runtime mismatches across Avalonia 11 subversions.
                Styles.Add(new FluentTheme());
            }
            catch
            {
                // If FluentTheme isn't available for any reason, ignore — we still set
                // base brushes below so the UI remains usable.
            }

            // Provide basic brushes used by views (dark background, light foreground)
            Resources["ThemeBackgroundBrush"] = new SolidColorBrush(Color.Parse("#111217"));
            Resources["ThemeSurfaceBrush"] = new SolidColorBrush(Color.Parse("#16161A"));
            Resources["ThemeForegroundBrush"] = new SolidColorBrush(Color.Parse("#E6E6E6"));
        }

        public override void OnFrameworkInitializationCompleted()
        {
            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                var mainWindow = new MainWindow
                {
                    DataContext = Bootstrapper.CreateMainWindowViewModel()
                };
                desktop.MainWindow = mainWindow;
            }
            base.OnFrameworkInitializationCompleted();
        }
    }
}
