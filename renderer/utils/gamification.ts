import { StudySubject } from '../context/StudyContext';

export const XP_PER_MINUTE = 12;

export type HistoryEntry = {
  focusSeconds: number;
  breakSeconds: number;
  perSubject: Record<string, number>;
};

export type StudyHistory = Record<string, HistoryEntry>;

export const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const computeLevel = (xp: number) => {
  let level = 1;
  let remainingXp = xp;
  let xpForLevel = 240;

  while (remainingXp >= xpForLevel) {
    remainingXp -= xpForLevel;
    level += 1;
    xpForLevel = Math.round(240 + level * 180);
  }

  const progress = xpForLevel === 0 ? 1 : Math.min(1, remainingXp / xpForLevel);

  return {
    level,
    xpIntoLevel: remainingXp,
    xpForNext: xpForLevel,
    progress
  };
};

export const tierFromLevel = (level: number) => {
  if (level >= 12) return 'Supernova Strategist';
  if (level >= 9) return 'Nebula Mentor';
  if (level >= 6) return 'Aurora Scholar';
  if (level >= 3) return 'Orbit Keeper';
  return 'Focus Initiate';
};

export const computeStudyStreak = (history: StudyHistory) => {
  const keys = new Set(Object.keys(history));
  if (!keys.size) return 0;
  let streak = 0;
  const cursor = new Date();
  while (streak <= keys.size) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    const entry = history[key];
    if (!entry || entry.focusSeconds <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const summarizeSubjects = (
  subjects: StudySubject[],
  history: StudyHistory,
  todayKey: string
) => {
  const summary = new Map<
    string,
    {
      id: string;
      name: string;
      color: string;
      todayMinutes: number;
      lifetimeMinutes: number;
    }
  >();

  const meta = new Map(subjects.map((subject) => [subject.id, { name: subject.name, color: subject.color }]));

  Object.entries(history).forEach(([key, entry]) => {
    Object.entries(entry.perSubject ?? {}).forEach(([subjectId, seconds]) => {
      const info = meta.get(subjectId);
      const existing = summary.get(subjectId) ?? {
        id: subjectId,
        name: info?.name ?? 'Archived lane',
        color: info?.color ?? '#7a6cff',
        todayMinutes: 0,
        lifetimeMinutes: 0
      };
      const minutes = Math.round(seconds / 60);
      existing.lifetimeMinutes += minutes;
      if (key === todayKey) {
        existing.todayMinutes += minutes;
      }
      summary.set(subjectId, existing);
    });
  });

  subjects.forEach((subject) => {
    const minutes = Math.round(subject.totalSeconds / 60);
    if (summary.has(subject.id)) {
      const current = summary.get(subject.id)!;
      current.name = subject.name;
      current.color = subject.color;
      current.todayMinutes = Math.max(current.todayMinutes, minutes);
      current.lifetimeMinutes = Math.max(current.lifetimeMinutes, minutes);
    } else {
      summary.set(subject.id, {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        todayMinutes: minutes,
        lifetimeMinutes: minutes
      });
    }
  });

  return Array.from(summary.values()).sort((a, b) => b.todayMinutes - a.todayMinutes);
};
