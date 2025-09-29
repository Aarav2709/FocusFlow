using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using Yeolpumta.Models;

namespace Yeolpumta.Services
{
    public class FlashcardsService
    {
        private readonly DatabaseService _db;
        public FlashcardsService(DatabaseService db) => _db = db;

        public IEnumerable<Flashcard> GetAll(string? deck = null)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            if (string.IsNullOrWhiteSpace(deck))
            {
                cmd.CommandText = "SELECT Id, Front, Back, Deck, CorrectStreak, CreatedAt, UpdatedAt FROM Flashcards ORDER BY UpdatedAt DESC";
            }
            else
            {
                cmd.CommandText = "SELECT Id, Front, Back, Deck, CorrectStreak, CreatedAt, UpdatedAt FROM Flashcards WHERE Deck=$deck ORDER BY UpdatedAt DESC";
                cmd.Parameters.AddWithValue("$deck", deck);
            }
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                yield return new Flashcard
                {
                    Id = reader.GetInt32(0),
                    Front = reader.GetString(1),
                    Back = reader.GetString(2),
                    Deck = reader.IsDBNull(3) ? null : reader.GetString(3),
                    CorrectStreak = reader.GetInt32(4),
                    CreatedAt = DateTime.Parse(reader.GetString(5)),
                    UpdatedAt = DateTime.Parse(reader.GetString(6)),
                };
            }
        }

        public int Create(Flashcard card)
        {
            var now = DateTime.UtcNow;
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "INSERT INTO Flashcards (Front, Back, Deck, CorrectStreak, CreatedAt, UpdatedAt) VALUES ($f, $b, $d, 0, $ca, $ua); SELECT last_insert_rowid();";
            cmd.Parameters.AddWithValue("$f", card.Front);
            cmd.Parameters.AddWithValue("$b", card.Back);
            cmd.Parameters.AddWithValue("$d", (object?)card.Deck ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$ca", now.ToString("o"));
            cmd.Parameters.AddWithValue("$ua", now.ToString("o"));
            var id = (long)cmd.ExecuteScalar()!;
            return (int)id;
        }

        public void Update(Flashcard card)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "UPDATE Flashcards SET Front=$f, Back=$b, Deck=$d, UpdatedAt=$ua WHERE Id=$id";
            cmd.Parameters.AddWithValue("$f", card.Front);
            cmd.Parameters.AddWithValue("$b", card.Back);
            cmd.Parameters.AddWithValue("$d", (object?)card.Deck ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$ua", DateTime.UtcNow.ToString("o"));
            cmd.Parameters.AddWithValue("$id", card.Id);
            cmd.ExecuteNonQuery();
        }

        public void UpdateStreak(int id, bool correct)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = correct
                ? "UPDATE Flashcards SET CorrectStreak = CorrectStreak + 1, UpdatedAt=$ua WHERE Id=$id"
                : "UPDATE Flashcards SET CorrectStreak = 0, UpdatedAt=$ua WHERE Id=$id";
            cmd.Parameters.AddWithValue("$ua", DateTime.UtcNow.ToString("o"));
            cmd.Parameters.AddWithValue("$id", id);
            cmd.ExecuteNonQuery();
        }

        public void Delete(int id)
        {
            using var conn = _db.GetConnection();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM Flashcards WHERE Id=$id";
            cmd.Parameters.AddWithValue("$id", id);
            cmd.ExecuteNonQuery();
        }
    }
}
