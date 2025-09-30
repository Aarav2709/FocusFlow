export type PageKey = 'notes' | 'tasks' | 'flashcards' | 'timer' | 'progress' | 'settings';

export interface Note {
  id: number;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export interface Deck {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  successCount: number;
  failureCount: number;
  updatedAt: string;
}

export interface StudySession {
  id: number;
  durationMinutes: number;
  mode: string;
  loggedAt: string;
}

export interface ProgressSummary {
  totalStudyMinutes: number;
  completedTasks: number;
  pendingTasks: number;
  decksCount: number;
  cardsReviewed: number;
}

export interface PomodoroSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  pomodoro: PomodoroSettings;
}
