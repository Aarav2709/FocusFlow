# YPT-PC

Yeolpumta, but for PC!

## Yeolpumta — Minimalist Study App

Cross-platform desktop app built with C#, .NET 9, and Avalonia UI.

Features:

- Notes with Markdown preview (SQLite)
- Tasks with deadlines, priorities, and upcoming list
- Flashcards with simple review and streaks
- Pomodoro / Focus Timer with configurable durations
- Progress tracking of study sessions
- Settings with light/dark theme toggle

### Run

Requires .NET 9 SDK.

```bash
cd src/Yeolpumta
dotnet restore
dotnet run
```

On Linux, the database is stored under `~/.config/Yeolpumta/yeolpumta.db`.

Project layout follows MVVM with `Models`, `Services`, `ViewModels`, and `Views`.
