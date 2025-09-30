import type { Note, Task, Deck, Card, ProgressSummary, StudySession, AppSettings } from './types';

type NotesApi = {
  getAll: () => Promise<Note[]>;
  create: (payload: { title: string; category?: string; content?: string }) => Promise<Note>;
  update: (payload: Note) => Promise<Note>;
  delete: (id: number) => Promise<{ success: boolean }>;
};

type TasksApi = {
  getAll: () => Promise<Task[]>;
  create: (payload: { title: string; dueDate?: string | null }) => Promise<Task>;
  toggle: (payload: { id: number; completed: boolean }) => Promise<{ success: boolean }>;
  delete: (id: number) => Promise<{ success: boolean }>;
};

type FlashcardsApi = {
  getAllDecks: () => Promise<Deck[]>;
  createDeck: (payload: { name: string; description?: string | null }) => Promise<Deck>;
  deleteDeck: (id: number) => Promise<{ success: boolean }>;
  getCards: (deckId: number) => Promise<Card[]>;
  createCard: (payload: { deckId: number; front: string; back: string }) => Promise<Card>;
  updateCard: (payload: Card) => Promise<Card>;
  deleteCard: (id: number) => Promise<{ success: boolean }>;
};

type ProgressApi = {
  getSummary: () => Promise<ProgressSummary>;
  getSessions: (limit?: number) => Promise<StudySession[]>;
  logSession: (payload: { durationMinutes: number; mode: string }) => Promise<{ success: boolean }>;
};

type SettingsApi = {
  getAll: () => Promise<AppSettings>;
  update: (payload: { key: string; value: unknown }) => Promise<{ success: boolean }>;
};

const fallbackReject = () => Promise.reject(new Error('Electron API is not available in this context.'));

export const notesApi: NotesApi = {
  getAll: () => window.ypt?.notes.getAll() ?? fallbackReject(),
  create: (payload) => window.ypt?.notes.create(payload) ?? fallbackReject(),
  update: (payload) => window.ypt?.notes.update(payload) ?? fallbackReject(),
  delete: (id) => window.ypt?.notes.delete(id) ?? fallbackReject()
};

export const tasksApi: TasksApi = {
  getAll: () => window.ypt?.tasks.getAll() ?? fallbackReject(),
  create: (payload) => window.ypt?.tasks.create(payload) ?? fallbackReject(),
  toggle: (payload) => window.ypt?.tasks.toggle(payload) ?? fallbackReject(),
  delete: (id) => window.ypt?.tasks.delete(id) ?? fallbackReject()
};

export const flashcardsApi: FlashcardsApi = {
  getAllDecks: () => window.ypt?.decks.getAll() ?? fallbackReject(),
  createDeck: (payload) => window.ypt?.decks.create(payload) ?? fallbackReject(),
  deleteDeck: (id) => window.ypt?.decks.delete(id) ?? fallbackReject(),
  getCards: (deckId) => window.ypt?.cards.getByDeck(deckId) ?? fallbackReject(),
  createCard: (payload) => window.ypt?.cards.create(payload) ?? fallbackReject(),
  updateCard: (payload) => window.ypt?.cards.update(payload) ?? fallbackReject(),
  deleteCard: (id) => window.ypt?.cards.delete(id) ?? fallbackReject()
};

export const progressApi: ProgressApi = {
  getSummary: () => window.ypt?.progress.getSummary() ?? fallbackReject(),
  getSessions: (limit) => window.ypt?.progress.getSessions(limit) ?? fallbackReject(),
  logSession: (payload) => window.ypt?.progress.logSession(payload) ?? fallbackReject()
};

export const settingsApi: SettingsApi = {
  getAll: () => window.ypt?.settings.getAll() ?? fallbackReject(),
  update: (payload) => window.ypt?.settings.update(payload) ?? fallbackReject()
};
