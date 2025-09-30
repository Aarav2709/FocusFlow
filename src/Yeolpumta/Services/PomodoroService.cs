using System;
using System.Timers;

namespace Yeolpumta.Services
{
    public class PomodoroService
    {
        private readonly ProgressService _progress;
    private System.Timers.Timer? _timer;
        private DateTime _sessionStart;
        private int _remainingSeconds;

        public event Action<int>? Tick; // remaining seconds
        public event Action? SessionCompleted;

        public int WorkMinutes { get; set; } = 25;
        public int ShortBreakMinutes { get; set; } = 5;
        public int LongBreakMinutes { get; set; } = 15;

        public PomodoroService(ProgressService progress)
        {
            _progress = progress;
        }

        public void StartWork()
        {
            StartSession(WorkMinutes);
        }

        public void StartBreak(bool longBreak = false)
        {
            StartSession(longBreak ? LongBreakMinutes : ShortBreakMinutes, trackProgress: false);
        }

        private void StartSession(int minutes, bool trackProgress = true)
        {
            Stop();
            _remainingSeconds = minutes * 60;
            _sessionStart = DateTime.UtcNow;
            _timer = new System.Timers.Timer(1000);
            _timer.Elapsed += (s, e) =>
            {
                _remainingSeconds--;
                Tick?.Invoke(Math.Max(0, _remainingSeconds));
                if (_remainingSeconds <= 0)
                {
                    Stop();
                    if (trackProgress)
                    {
                        _progress.AddSession(_sessionStart, DateTime.UtcNow, tag: "Pomodoro");
                    }
                    SessionCompleted?.Invoke();
                }
            };
            _timer.AutoReset = true;
            _timer.Start();
            Tick?.Invoke(_remainingSeconds);
        }

        public void Stop()
        {
            if (_timer != null)
            {
                _timer.Stop();
                _timer.Dispose();
                _timer = null;
            }
        }
    }
}
