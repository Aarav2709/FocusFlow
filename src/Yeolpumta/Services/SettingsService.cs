using System;
using Microsoft.Data.Sqlite;

namespace Yeolpumta.Services
{
    public class SettingsService
    {
        private readonly DatabaseService _db;
        public SettingsService(DatabaseService db) => _db = db;

        public string? Get(string key)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Value FROM Preferences WHERE Key=$k";
            cmd.Parameters.AddWithValue("$k", key);
            var result = cmd.ExecuteScalar();
            return result as string;
        }

        public void Set(string key, string value)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "INSERT INTO Preferences (Key, Value) VALUES ($k, $v) ON CONFLICT(Key) DO UPDATE SET Value=$v";
            cmd.Parameters.AddWithValue("$k", key);
            cmd.Parameters.AddWithValue("$v", value);
            cmd.ExecuteNonQuery();
        }
    }
}
