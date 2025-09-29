using Yeolpumta.Services;
using Yeolpumta.ViewModels;

namespace Yeolpumta
{
    internal static class Bootstrapper
    {
        public static MainWindowViewModel CreateMainWindowViewModel()
        {
            var db = new DatabaseService();
            db.Initialize();

            var notesService = new NotesService(db);
            var tasksService = new TasksService(db);
            var flashcardsService = new FlashcardsService(db);
            var settingsService = new SettingsService(db);
            var themeService = new ThemeService();
            var progressService = new ProgressService(db);
            var pomodoroService = new PomodoroService(progressService);

            var notesVM = new NotesViewModel(notesService);
            var tasksVM = new TasksViewModel(tasksService);
            var flashcardsVM = new FlashcardsViewModel(flashcardsService);
            var timerVM = new TimerViewModel(pomodoroService);
            var progressVM = new ProgressViewModel(progressService);
            var settingsVM = new SettingsViewModel(settingsService, themeService);

            return new MainWindowViewModel(
                notesVM, tasksVM, flashcardsVM, timerVM, progressVM, settingsVM);
        }
    }
}
