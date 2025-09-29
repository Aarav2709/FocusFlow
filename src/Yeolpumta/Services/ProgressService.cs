using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using Yeolpumta.Models;

namespace Yeolpumta.Services
{
    public class ProgressService
    {
        private readonly DatabaseService _db;
        public ProgressService(DatabaseService db) => _db = db;

        public void AddSession(DateTime start, DateTime end, string? tag = null)
        {
            var duration = (int)Math.Round((end - start).TotalMinutes);
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "INSERT INTO StudySessions (StartTime, EndTime, DurationMinutes, Tag) VALUES ($s, $e, $d, $t)";
            cmd.Parameters.AddWithValue("$s", start.ToString("o"));
            cmd.Parameters.AddWithValue("$e", end.ToString("o"));
            cmd.Parameters.AddWithValue("$d", duration);
            cmd.Parameters.AddWithValue("$t", (object?)tag ?? DBNull.Value);
            cmd.ExecuteNonQuery();
        }

        public int GetTotalMinutes(int days = 7)
        {
            using var conn = _db.GetConnection();
            var since = DateTime.UtcNow.AddDays(-days).ToString("o");
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT COALESCE(SUM(DurationMinutes),0) FROM StudySessions WHERE StartTime >= $since";
            cmd.Parameters.AddWithValue("$since", since);
            var result = cmd.ExecuteScalar();
            return Convert.ToInt32(result);
        }

        public IEnumerable<StudySession> GetRecent(int limit = 20)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, StartTime, EndTime, DurationMinutes, Tag FROM StudySessions ORDER BY StartTime DESC LIMIT $lim";
            cmd.Parameters.AddWithValue("$lim", limit);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                yield return new StudySession
                {
                    Id = reader.GetInt32(0),
                    StartTime = DateTime.Parse(reader.GetString(1)),
                    EndTime = DateTime.Parse(reader.GetString(2)),
                    DurationMinutes = reader.GetInt32(3),
                    Tag = reader.IsDBNull(4) ? null : reader.GetString(4),
                };
            }
        }
    }
}
