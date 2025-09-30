using Avalonia;
using Avalonia.Styling;

namespace Yeolpumta.Services
{
    public class ThemeService
    {
        public void ApplyDarkMode(bool dark)
        {
            if (Application.Current is { } app)
            {
                app.RequestedThemeVariant = dark ? ThemeVariant.Dark : ThemeVariant.Light;
            }
        }
    }
}
