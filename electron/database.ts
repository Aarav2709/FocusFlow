import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export type NoteRecord = {
  id: number;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
};

export type TaskRecord = {
  id: number;
  title: string;
  dueDate: string | null;
  completed: number;
  createdAt: string;
};

export type DeckRecord = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
};

export type CardRecord = {
  id: number;
  deckId: number;
  front: string;
  back: string;
  successCount: number;
  failureCount: number;
  updatedAt: string;
};

export type StudySessionRecord = {
  id: number;
  durationMinutes: number;
  mode: string;
  loggedAt: string;
};

export type ProgressSummary = {
  totalStudyMinutes: number;
  completedTasks: number;
  pendingTasks: number;
  decksCount: number;
  cardsReviewed: number;
};

export class DatabaseService {
  private db: Database.Database;

  constructor(private readonly dbFilePath: string) {
    this.ensureDirectory();
    this.db = new Database(this.dbFilePath);
    this.db.pragma('journal_mode = WAL');
    this.initialiseSchema();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private initialiseSchema() {
    const migrations = `
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT DEFAULT '',
        content TEXT DEFAULT '',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration_minutes INTEGER NOT NULL,
        mode TEXT NOT NULL,
        logged_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    this.db.exec(migrations);
  }

  // NOTES
  getNotes(): NoteRecord[] {
    const stmt = this.db.prepare<never, NoteRecord>('SELECT id, title, category, content, updated_at as updatedAt FROM notes ORDER BY updated_at DESC');
    return stmt.all();
  }

  createNote(data: { title: string; category?: string; content?: string }): NoteRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO notes (title, category, content, updated_at) VALUES (?, ?, ?, ?)');
    const info = stmt.run(data.title, data.category ?? '', data.content ?? '', now);
    return {
      id: Number(info.lastInsertRowid),
      title: data.title,
      category: data.category ?? '',
      content: data.content ?? '',
      updatedAt: now
    };
  }

  updateNote(note: NoteRecord): NoteRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE notes SET title = ?, category = ?, content = ?, updated_at = ? WHERE id = ?');
    stmt.run(note.title, note.category, note.content, now, note.id);
    return { ...note, updatedAt: now };
  }

  deleteNote(id: number) {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(id);
  }

  // TASKS
  getTasks(): TaskRecord[] {
    const stmt = this.db.prepare<never, TaskRecord>('SELECT id, title, due_date as dueDate, completed, created_at as createdAt FROM tasks ORDER BY created_at DESC');
    return stmt.all();
  }

  createTask(data: { title: string; dueDate?: string | null }): TaskRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO tasks (title, due_date, completed, created_at) VALUES (?, ?, 0, ?)');
    const info = stmt.run(data.title, data.dueDate ?? null, now);
    return {
      id: Number(info.lastInsertRowid),
      title: data.title,
      dueDate: data.dueDate ?? null,
      completed: 0,
      createdAt: now
    };
  }

  toggleTask(id: number, completed: boolean) {
    const stmt = this.db.prepare('UPDATE tasks SET completed = ? WHERE id = ?');
    stmt.run(completed ? 1 : 0, id);
  }

  deleteTask(id: number) {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
  }

  // FLASHCARDS
  getDecks(): DeckRecord[] {
    const stmt = this.db.prepare<never, DeckRecord>('SELECT id, name, description, created_at as createdAt FROM decks ORDER BY created_at DESC');
    return stmt.all();
  }

  createDeck(data: { name: string; description?: string | null }): DeckRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO decks (name, description, created_at) VALUES (?, ?, ?)');
    const info = stmt.run(data.name, data.description ?? null, now);
    return {
      id: Number(info.lastInsertRowid),
      name: data.name,
      description: data.description ?? null,
      createdAt: now
    };
  }

  deleteDeck(id: number) {
    const stmt = this.db.prepare('DELETE FROM decks WHERE id = ?');
    stmt.run(id);
  }

  getCards(deckId: number): CardRecord[] {
    const stmt = this.db.prepare('SELECT id, deck_id as deckId, front, back, success_count as successCount, failure_count as failureCount, updated_at as updatedAt FROM cards WHERE deck_id = ? ORDER BY updated_at DESC');
    return stmt.all(deckId) as CardRecord[];
  }

  createCard(data: { deckId: number; front: string; back: string }): CardRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO cards (deck_id, front, back, success_count, failure_count, updated_at) VALUES (?, ?, ?, 0, 0, ?)');
    const info = stmt.run(data.deckId, data.front, data.back, now);
    return {
      id: Number(info.lastInsertRowid),
      deckId: data.deckId,
      front: data.front,
      back: data.back,
      successCount: 0,
      failureCount: 0,
      updatedAt: now
    };
  }

  updateCard(card: CardRecord): CardRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE cards SET front = ?, back = ?, success_count = ?, failure_count = ?, updated_at = ? WHERE id = ?');
    stmt.run(card.front, card.back, card.successCount, card.failureCount, now, card.id);
    return { ...card, updatedAt: now };
  }

  deleteCard(id: number) {
    const stmt = this.db.prepare('DELETE FROM cards WHERE id = ?');
    stmt.run(id);
  }

  // STUDY SESSIONS / PROGRESS
  logStudySession(data: { durationMinutes: number; mode: string }) {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO study_sessions (duration_minutes, mode, logged_at) VALUES (?, ?, ?)');
    stmt.run(data.durationMinutes, data.mode, now);
  }

  getStudySessions(limit = 30): StudySessionRecord[] {
    const stmt = this.db.prepare('SELECT id, duration_minutes as durationMinutes, mode, logged_at as loggedAt FROM study_sessions ORDER BY logged_at DESC LIMIT ?');
    return stmt.all(limit) as StudySessionRecord[];
  }

  getProgressSummary(): ProgressSummary {
    const totalStudyMinutes = this.db.prepare('SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions').pluck().get() as number;
    const completedTasks = this.db.prepare('SELECT COUNT(*) FROM tasks WHERE completed = 1').pluck().get() as number;
    const pendingTasks = this.db.prepare('SELECT COUNT(*) FROM tasks WHERE completed = 0').pluck().get() as number;
    const decksCount = this.db.prepare('SELECT COUNT(*) FROM decks').pluck().get() as number;
    const cardsReviewed = this.db.prepare('SELECT COALESCE(SUM(success_count + failure_count), 0) FROM cards').pluck().get() as number;
    return {
      totalStudyMinutes,
      completedTasks,
      pendingTasks,
      decksCount,
      cardsReviewed
    };
  }

  // SETTINGS
  getSetting<T = string>(key: string, defaultValue: T): T {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    if (!row) {
      return defaultValue;
    }
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return (row.value as unknown as T) ?? defaultValue;
    }
  }

  setSetting<T>(key: string, value: T) {
    const stringValue = JSON.stringify(value);
    const stmt = this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    stmt.run(key, stringValue);
  }
}
