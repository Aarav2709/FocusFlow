using System;

namespace Yeolpumta.Models
{
    public class StudySession
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public string? Tag { get; set; }
    }
}
