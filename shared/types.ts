/* Shared types used by main and renderer
   - Note: ids are intentionally flexible (string | number) so both the JSON StorageService
     (which uses string UUIDs) and the DatabaseService (which uses numeric autoincrement ids)
     can interoperate without type conflicts.
*/

export type ID = string | number;

export interface AppPreferences {
  theme?: 'dark' | 'light';
  notificationsEnabled?: boolean;
  pomodoro: { focus: number; shortBreak: number; longBreak: number };
}

export interface Subject {
  id: ID;
  name: string;
  createdAt: string;
}

export interface TimerSession {
  id: ID;
  subjectId: ID;
  start: string; // ISO timestamp
  end?: string; // ISO timestamp
}

export interface Note {
  id: ID;
  title: string;
  content: string;
  category?: string | null;
  subjectId?: ID;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: ID;
  title: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: ID;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: ID;
  deckId: ID;
  front: string;
  back: string;
  reviews: number;
  successes: number;
  failures: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateNotePayload = { title?: string; content: string; category?: string | null };
export type UpdateNotePayload = { id: ID; title?: string; content: string; category?: string | null };
export type CreateTaskPayload = { title: string; dueDate?: string | null };
export type ToggleTaskPayload = { id: ID; completed: boolean };
export type CreateDeckPayload = { name: string; description?: string | null };
export type CreateCardPayload = { deckId: ID; front: string; back: string };
export type UpdateCardPayload = { id: ID; front: string; back: string };

export interface ProgressSummary {
  totalMinutes: number;
  completedTasks: number;
  pendingTasks: number;
  totalDecks: number;
  cardsReviewed: number;
  sessionsThisWeek: number;
}

export interface StudySession {
  id: ID;
  durationMinutes: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  startedAt: string;
}

export type StudySessionPayload = { mode: 'focus' | 'shortBreak' | 'longBreak'; durationMinutes: number };

export type UpdatePreferencePayload<T = unknown> = { key: string; value: T };

export interface AppData {
  subjects: Subject[];
  sessions: TimerSession[];
  notes: Note[];
}

export type RendererApi = {
  notes: {
    list: () => Promise<Note[]>;
    create: (payload: CreateNotePayload) => Promise<Note>;
    update: (payload: UpdateNotePayload) => Promise<Note>;
    remove: (id: ID) => Promise<void>;
  };
  tasks: {
    list: () => Promise<Task[]>;
    create: (payload: CreateTaskPayload) => Promise<Task>;
    toggle: (payload: ToggleTaskPayload) => Promise<Task>;
    remove: (id: ID) => Promise<void>;
  };
  flashcards: {
    listDecks: () => Promise<Deck[]>;
    createDeck: (payload: CreateDeckPayload) => Promise<Deck>;
    removeDeck: (id: ID) => Promise<void>;
    listCards: (deckId: ID) => Promise<Card[]>;
    createCard: (payload: CreateCardPayload) => Promise<Card>;
    updateCard: (payload: UpdateCardPayload) => Promise<Card>;
    removeCard: (id: ID) => Promise<void>;
  };
  progress: {
    summary: () => Promise<ProgressSummary | null>;
    sessions: () => Promise<StudySession[]>;
    logSession: (payload: StudySessionPayload) => Promise<void>;
  };
  preferences: {
    get: () => Promise<AppPreferences | null>;
    update: <T = unknown>(payload: { key: string; value: T }) => Promise<AppPreferences | null>;
  };
  subjects?: {
    list: () => Promise<Subject[]>;
    create: (name: string) => Promise<Subject>;
    update: (subject: Subject) => Promise<Subject>;
    remove: (id: ID) => Promise<void>;
  };
  timers?: {
    start: (subjectId: ID) => Promise<TimerSession>;
    stop: (sessionId: ID) => Promise<TimerSession | null>;
    listSessions: (subjectId?: ID) => Promise<TimerSession[]>;
  };
  notesBySubject?: {
    get: (subjectId: ID) => Promise<Note | null>;
    save: (subjectId: ID, content: string) => Promise<Note>;
  };
  stats?: {
    totals: () => Promise<{ bySubject: Record<string, number>; overall: number }>;
    daily: (days?: number) => Promise<Record<string, number>>;
  };
  window?: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
};

declare global {
  interface Window {
    focusflow?: RendererApi;
  }
}


