using Yeolpumta.Services;

namespace Yeolpumta.ViewModels
{
    public class SettingsViewModel : BaseViewModel
    {
    private readonly SettingsService _service;
    private readonly ThemeService _theme;
        public bool DarkMode
        {
            get => _darkMode;
            set { SetProperty(ref _darkMode, value); _service.Set("theme", value ? "dark" : "light"); _theme.ApplyDarkMode(value); }
        }
        private bool _darkMode = true;

        public SettingsViewModel(SettingsService service, ThemeService theme)
        {
            _service = service;
            _theme = theme;
            var mode = _service.Get("theme");
            _darkMode = mode != "light"; // default dark
            _theme.ApplyDarkMode(_darkMode);
        }
    }
}
