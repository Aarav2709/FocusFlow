using System.Collections.ObjectModel;
using System.Linq;
using Yeolpumta.Models;

namespace Yeolpumta.ViewModels
{
    public class MainWindowViewModel : BaseViewModel
    {
        public ObservableCollection<NavigationItem> Navigation { get; } = new()
        {
            new NavigationItem{ Title = "Notes", Icon = "📒", Key = "notes" },
            new NavigationItem{ Title = "Tasks", Icon = "✅", Key = "tasks" },
            new NavigationItem{ Title = "Flashcards", Icon = "🃏", Key = "flashcards" },
            new NavigationItem{ Title = "Timer", Icon = "⏱️", Key = "timer" },
            new NavigationItem{ Title = "Progress", Icon = "📈", Key = "progress" },
            new NavigationItem{ Title = "Settings", Icon = "⚙️", Key = "settings" },
        };

        public BaseViewModel CurrentViewModel
        {
            get => _currentViewModel;
            set => SetProperty(ref _currentViewModel, value);
        }
        private BaseViewModel _currentViewModel;

        public RelayCommand NavigateCommand { get; }

        public NotesViewModel NotesVM { get; }
        public TasksViewModel TasksVM { get; }
        public FlashcardsViewModel FlashcardsVM { get; }
        public TimerViewModel TimerVM { get; }
        public ProgressViewModel ProgressVM { get; }
        public SettingsViewModel SettingsVM { get; }

        public MainWindowViewModel(NotesViewModel notes, TasksViewModel tasks, FlashcardsViewModel flashcards, TimerViewModel timer, ProgressViewModel progress, SettingsViewModel settings)
        {
            NotesVM = notes;
            TasksVM = tasks;
            FlashcardsVM = flashcards;
            TimerVM = timer;
            ProgressVM = progress;
            SettingsVM = settings;
            _currentViewModel = notes;
            NavigateCommand = new RelayCommand(p => Navigate((string)p!));
        }

        private void Navigate(string key)
        {
            CurrentViewModel = key switch
            {
                "notes" => NotesVM,
                "tasks" => TasksVM,
                "flashcards" => FlashcardsVM,
                "timer" => TimerVM,
                "progress" => ProgressVM,
                "settings" => SettingsVM,
                _ => NotesVM
            };
        }
    }
}
