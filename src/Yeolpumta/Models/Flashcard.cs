using System;

namespace Yeolpumta.Models
{
    public class Flashcard
    {
        public int Id { get; set; }
        public string Front { get; set; } = string.Empty;
        public string Back { get; set; } = string.Empty;
        public string? Deck { get; set; }
        public int CorrectStreak { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
