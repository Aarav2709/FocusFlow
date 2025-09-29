using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using Yeolpumta.Models;

namespace Yeolpumta.Services
{
    public class TasksService
    {
        private readonly DatabaseService _db;
        public TasksService(DatabaseService db) => _db = db;

        public IEnumerable<TaskItem> GetAll(bool includeCompleted = true)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = includeCompleted
                ? "SELECT Id, Title, Description, DueDate, Priority, IsCompleted, CreatedAt, UpdatedAt FROM Tasks ORDER BY IsCompleted, DueDate"
                : "SELECT Id, Title, Description, DueDate, Priority, IsCompleted, CreatedAt, UpdatedAt FROM Tasks WHERE IsCompleted=0 ORDER BY DueDate";
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                yield return new TaskItem
                {
                    Id = reader.GetInt32(0),
                    Title = reader.GetString(1),
                    Description = reader.IsDBNull(2) ? null : reader.GetString(2),
                    DueDate = reader.IsDBNull(3) ? null : DateTime.Parse(reader.GetString(3)),
                    Priority = (TaskPriority)reader.GetInt32(4),
                    IsCompleted = reader.GetInt32(5) == 1,
                    CreatedAt = DateTime.Parse(reader.GetString(6)),
                    UpdatedAt = DateTime.Parse(reader.GetString(7)),
                };
            }
        }

        public IEnumerable<TaskItem> GetUpcoming(int days = 7)
        {
            var until = DateTime.UtcNow.AddDays(days).ToString("o");
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Title, Description, DueDate, Priority, IsCompleted, CreatedAt, UpdatedAt FROM Tasks WHERE IsCompleted=0 AND DueDate IS NOT NULL AND DueDate <= $until ORDER BY DueDate";
            cmd.Parameters.AddWithValue("$until", until);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                yield return new TaskItem
                {
                    Id = reader.GetInt32(0),
                    Title = reader.GetString(1),
                    Description = reader.IsDBNull(2) ? null : reader.GetString(2),
                    DueDate = reader.IsDBNull(3) ? null : DateTime.Parse(reader.GetString(3)),
                    Priority = (TaskPriority)reader.GetInt32(4),
                    IsCompleted = reader.GetInt32(5) == 1,
                    CreatedAt = DateTime.Parse(reader.GetString(6)),
                    UpdatedAt = DateTime.Parse(reader.GetString(7)),
                };
            }
        }

        public int Create(TaskItem item)
        {
            var now = DateTime.UtcNow;
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "INSERT INTO Tasks (Title, Description, DueDate, Priority, IsCompleted, CreatedAt, UpdatedAt) VALUES ($t, $d, $due, $p, $c, $ca, $ua); SELECT last_insert_rowid();";
            cmd.Parameters.AddWithValue("$t", item.Title);
            cmd.Parameters.AddWithValue("$d", (object?)item.Description ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$due", (object?)item.DueDate?.ToString("o") ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$p", (int)item.Priority);
            cmd.Parameters.AddWithValue("$c", item.IsCompleted ? 1 : 0);
            cmd.Parameters.AddWithValue("$ca", now.ToString("o"));
            cmd.Parameters.AddWithValue("$ua", now.ToString("o"));
            var id = (long)cmd.ExecuteScalar()!;
            return (int)id;
        }

        public void Update(TaskItem item)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "UPDATE Tasks SET Title=$t, Description=$d, DueDate=$due, Priority=$p, IsCompleted=$c, UpdatedAt=$ua WHERE Id=$id";
            cmd.Parameters.AddWithValue("$t", item.Title);
            cmd.Parameters.AddWithValue("$d", (object?)item.Description ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$due", (object?)item.DueDate?.ToString("o") ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$p", (int)item.Priority);
            cmd.Parameters.AddWithValue("$c", item.IsCompleted ? 1 : 0);
            cmd.Parameters.AddWithValue("$ua", DateTime.UtcNow.ToString("o"));
            cmd.Parameters.AddWithValue("$id", item.Id);
            cmd.ExecuteNonQuery();
        }

        public void Delete(int id)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM Tasks WHERE Id=$id";
            cmd.Parameters.AddWithValue("$id", id);
            cmd.ExecuteNonQuery();
        }
    }
}
