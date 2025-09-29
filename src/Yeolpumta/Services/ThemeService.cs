using Avalonia;
using Avalonia.Themes.Fluent;

namespace Yeolpumta.Services
{
    public class ThemeService
    {
        public void ApplyDarkMode(bool dark)
        {
            if (Application.Current is { } app)
            {
                foreach (var style in app.Styles)
                {
                    if (style is FluentTheme ft)
                    {
                        ft.Mode = dark ? FluentThemeMode.Dark : FluentThemeMode.Light;
                    }
                }
            }
        }
    }
}
