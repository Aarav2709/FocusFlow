export type ThemePreference = 'light' | 'dark';

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  reviews: number;
  successes: number;
  failures: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: number;
  durationMinutes: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  startedAt: string;
}

export interface AppPreferences {
  theme: ThemePreference;
  notificationsEnabled: boolean;
  pomodoro: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
}

export interface ProgressSummary {
  totalMinutes: number;
  completedTasks: number;
  pendingTasks: number;
  totalDecks: number;
  cardsReviewed: number;
  sessionsThisWeek: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  category?: string | null;
}

export interface UpdateNotePayload extends CreateNotePayload {
  id: number;
}

export interface CreateTaskPayload {
  title: string;
  dueDate?: string | null;
}

export interface ToggleTaskPayload {
  id: number;
  completed: boolean;
}

export interface CreateDeckPayload {
  name: string;
  description?: string | null;
}

export interface CreateCardPayload {
  deckId: number;
  front: string;
  back: string;
}

export interface UpdateCardPayload extends CreateCardPayload {
  id: number;
}

export interface StudySessionPayload {
  durationMinutes: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
}

export interface UpdatePreferencePayload<T = unknown> {
  key: keyof AppPreferences | string;
  value: T;
}

export interface RendererApi {
  notes: {
    list: () => Promise<Note[]>;
    create: (payload: CreateNotePayload) => Promise<Note>;
    update: (payload: UpdateNotePayload) => Promise<Note>;
    remove: (id: number) => Promise<void>;
  };
  tasks: {
    list: () => Promise<Task[]>;
    create: (payload: CreateTaskPayload) => Promise<Task>;
    toggle: (payload: ToggleTaskPayload) => Promise<Task>;
    remove: (id: number) => Promise<void>;
  };
  flashcards: {
    listDecks: () => Promise<Deck[]>;
    createDeck: (payload: CreateDeckPayload) => Promise<Deck>;
    removeDeck: (id: number) => Promise<void>;
    listCards: (deckId: number) => Promise<Card[]>;
    createCard: (payload: CreateCardPayload) => Promise<Card>;
    updateCard: (payload: UpdateCardPayload) => Promise<Card>;
    removeCard: (id: number) => Promise<void>;
  };
  progress: {
    summary: () => Promise<ProgressSummary>;
    sessions: () => Promise<StudySession[]>;
    logSession: (payload: StudySessionPayload) => Promise<void>;
  };
  preferences: {
    get: () => Promise<AppPreferences>;
    update: <T>(payload: UpdatePreferencePayload<T>) => Promise<AppPreferences>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    ypt: RendererApi;
  }
}
