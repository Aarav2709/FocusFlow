using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using Yeolpumta.Models;

namespace Yeolpumta.Services
{
    public class NotesService
    {
        private readonly DatabaseService _db;
        public NotesService(DatabaseService db) => _db = db;

        public IEnumerable<Note> GetAll()
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Title, Content, Category, CreatedAt, UpdatedAt FROM Notes ORDER BY UpdatedAt DESC";
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                yield return new Note
                {
                    Id = reader.GetInt32(0),
                    Title = reader.GetString(1),
                    Content = reader.GetString(2),
                    Category = reader.IsDBNull(3) ? null : reader.GetString(3),
                    CreatedAt = DateTime.Parse(reader.GetString(4)),
                    UpdatedAt = DateTime.Parse(reader.GetString(5)),
                };
            }
        }

        public int Create(Note note)
        {
            var now = DateTime.UtcNow;
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "INSERT INTO Notes (Title, Content, Category, CreatedAt, UpdatedAt) VALUES ($t, $c, $cat, $ca, $ua); SELECT last_insert_rowid();";
            cmd.Parameters.AddWithValue("$t", note.Title);
            cmd.Parameters.AddWithValue("$c", note.Content);
            cmd.Parameters.AddWithValue("$cat", (object?)note.Category ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$ca", now.ToString("o"));
            cmd.Parameters.AddWithValue("$ua", now.ToString("o"));
            var id = (long)cmd.ExecuteScalar()!;
            return (int)id;
        }

        public void Update(Note note)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "UPDATE Notes SET Title=$t, Content=$c, Category=$cat, UpdatedAt=$ua WHERE Id=$id";
            cmd.Parameters.AddWithValue("$t", note.Title);
            cmd.Parameters.AddWithValue("$c", note.Content);
            cmd.Parameters.AddWithValue("$cat", (object?)note.Category ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$ua", DateTime.UtcNow.ToString("o"));
            cmd.Parameters.AddWithValue("$id", note.Id);
            cmd.ExecuteNonQuery();
        }

        public void Delete(int id)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM Notes WHERE Id=$id";
            cmd.Parameters.AddWithValue("$id", id);
            cmd.ExecuteNonQuery();
        }
    }
}
