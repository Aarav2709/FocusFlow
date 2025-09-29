using System;
using Yeolpumta.Services;

namespace Yeolpumta.ViewModels
{
    public class TimerViewModel : BaseViewModel
    {
        private readonly PomodoroService _service;
        public int WorkMinutes { get => _work; set { _service.WorkMinutes = value; SetProperty(ref _work, value); } }
        private int _work = 25;
        public int ShortBreakMinutes { get => _short; set { _service.ShortBreakMinutes = value; SetProperty(ref _short, value); } }
        private int _short = 5;
        public int LongBreakMinutes { get => _long; set { _service.LongBreakMinutes = value; SetProperty(ref _long, value); } }
        private int _long = 15;

        public string RemainingDisplay { get => _remainingDisplay; set => SetProperty(ref _remainingDisplay, value); }
        private string _remainingDisplay = "00:00";

        public RelayCommand StartWorkCommand { get; }
        public RelayCommand StartShortBreakCommand { get; }
        public RelayCommand StartLongBreakCommand { get; }
        public RelayCommand StopCommand { get; }

        public event Action? NotifyCompleted; // could be wired to OS notifications later

        public TimerViewModel(PomodoroService service)
        {
            _service = service;
            StartWorkCommand = new RelayCommand(_ => _service.StartWork());
            StartShortBreakCommand = new RelayCommand(_ => _service.StartBreak(false));
            StartLongBreakCommand = new RelayCommand(_ => _service.StartBreak(true));
            StopCommand = new RelayCommand(_ => _service.Stop());

            _service.Tick += s => RemainingDisplay = TimeSpan.FromSeconds(s).ToString(@"mm\:ss");
            _service.SessionCompleted += () => NotifyCompleted?.Invoke();
        }
    }
}
