using System;
using System.IO;
using Microsoft.Data.Sqlite;

namespace Yeolpumta.Services
{
    public class DatabaseService
    {
        public string DbPath { get; }

        public DatabaseService()
        {
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var dir = Path.Combine(appData, "Yeolpumta");
            Directory.CreateDirectory(dir);
            DbPath = Path.Combine(dir, "yeolpumta.db");
        }

        public SqliteConnection GetConnection()
        {
            var conn = new SqliteConnection($"Data Source={DbPath}");
            conn.Open();
            return conn;
        }

        public void Initialize()
        {
            using var conn = GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
CREATE TABLE IF NOT EXISTS Notes (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Title TEXT NOT NULL,
  Content TEXT NOT NULL,
  Category TEXT,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Tasks (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Title TEXT NOT NULL,
  Description TEXT,
  DueDate TEXT,
  Priority INTEGER NOT NULL,
  IsCompleted INTEGER NOT NULL,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Flashcards (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Front TEXT NOT NULL,
  Back TEXT NOT NULL,
  Deck TEXT,
  CorrectStreak INTEGER NOT NULL,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS StudySessions (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  StartTime TEXT NOT NULL,
  EndTime TEXT NOT NULL,
  DurationMinutes INTEGER NOT NULL,
  Tag TEXT
);

CREATE TABLE IF NOT EXISTS Preferences (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Key TEXT NOT NULL UNIQUE,
  Value TEXT NOT NULL
);
";
            cmd.ExecuteNonQuery();
        }
    }
}
