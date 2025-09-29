using System.Collections.ObjectModel;
using Yeolpumta.Models;
using Yeolpumta.Services;

namespace Yeolpumta.ViewModels
{
    public class ProgressViewModel : BaseViewModel
    {
        private readonly ProgressService _service;
        public int TotalMinutesWeek { get => _total; set => SetProperty(ref _total, value); }
        private int _total;
        public ObservableCollection<StudySession> Recent { get; } = new();

        public ProgressViewModel(ProgressService service)
        {
            _service = service;
            Refresh();
        }

        public void Refresh()
        {
            TotalMinutesWeek = _service.GetTotalMinutes(7);
            Recent.Clear();
            foreach (var s in _service.GetRecent()) Recent.Add(s);
        }
    }
}
