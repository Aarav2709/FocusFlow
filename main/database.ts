import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type {
  AppPreferences,
  Card,
  CreateCardPayload,
  CreateDeckPayload,
  CreateNotePayload,
  CreateTaskPayload,
  Deck,
  Note,
  ProgressSummary,
  StudySession,
  StudySessionPayload,
  Task,
  ToggleTaskPayload,
  UpdateCardPayload,
  UpdateNotePayload
} from '@shared/types';

type Row = Record<string, unknown>;

export class DatabaseService {
  private readonly db: Database.Database;

  constructor(private readonly basePath: string) {
    const dbDir = path.dirname(basePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(basePath);
    this.db.pragma('journal_mode = WAL');
    this.migrate();
  }

  private migrate(): void {
    const migration = `
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        reviews INTEGER DEFAULT 0,
        successes INTEGER DEFAULT 0,
        failures INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration_minutes INTEGER NOT NULL,
        mode TEXT NOT NULL,
        started_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    this.db.exec(migration);

    const hasTheme = this.db.prepare('SELECT 1 FROM preferences WHERE key = ?').get('theme');
    if (!hasTheme) {
      const defaultPrefs: AppPreferences = {
        theme: 'dark',
        notificationsEnabled: false,
        pomodoro: {
          focus: 25,
          shortBreak: 5,
          longBreak: 15
        }
      };
      this.setPreferences(defaultPrefs);
    }
  }

  // NOTES
  listNotes(): Note[] {
    const rows = this.db
      .prepare('SELECT * FROM notes ORDER BY updated_at DESC')
      .all() as Row[];
    return rows.map((row) => this.mapNote(row));
  }

  createNote(payload: CreateNotePayload): Note {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(
      'INSERT INTO notes (title, content, category, created_at, updated_at) VALUES (@title, @content, @category, @created_at, @updated_at)'
    );
    const info = stmt.run({
      title: payload.title,
      content: payload.content,
      category: payload.category ?? null,
      created_at: now,
      updated_at: now
    });

    return this.getNote(info.lastInsertRowid as number);
  }

  updateNote(payload: UpdateNotePayload): Note {
    const now = new Date().toISOString();
    this.db.prepare(
      'UPDATE notes SET title = @title, content = @content, category = @category, updated_at = @updated_at WHERE id = @id'
    ).run({
      id: payload.id,
      title: payload.title,
      content: payload.content,
      category: payload.category ?? null,
      updated_at: now
    });

    return this.getNote(payload.id);
  }

  deleteNote(id: number): void {
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }

  private getNote(id: number): Note {
    const data = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Row | undefined;
    if (!data) {
      throw new Error(`Note with id ${id} not found`);
    }
    return this.mapNote(data);
  }

  private mapNote(row: Row): Note {
    return {
      id: Number(row.id),
      title: String(row.title ?? ''),
      content: String(row.content ?? ''),
      category: row.category ? String(row.category) : null,
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? '')
    };
  }

  // TASKS
  listTasks(): Task[] {
    const rows = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as Row[];
    return rows.map((row) => this.mapTask(row));
  }

  createTask(payload: CreateTaskPayload): Task {
    const now = new Date().toISOString();
    const info = this.db
      .prepare(
        'INSERT INTO tasks (title, due_date, completed, created_at, updated_at) VALUES (@title, @due_date, @completed, @created_at, @updated_at)'
      )
      .run({
        title: payload.title,
        due_date: payload.dueDate ?? null,
        completed: 0,
        created_at: now,
        updated_at: now
      });
    return this.getTask(info.lastInsertRowid as number);
  }

  toggleTask(payload: ToggleTaskPayload): Task {
    const now = new Date().toISOString();
    this.db
      .prepare('UPDATE tasks SET completed = @completed, updated_at = @updated_at WHERE id = @id')
      .run({ id: payload.id, completed: payload.completed ? 1 : 0, updated_at: now });
    return this.getTask(payload.id);
  }

  deleteTask(id: number): void {
    this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }

  private getTask(id: number): Task {
    const data = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Row | undefined;
    if (!data) {
      throw new Error(`Task with id ${id} not found`);
    }
    return this.mapTask(data);
  }

  private mapTask(row: Row): Task {
    return {
      id: Number(row.id),
      title: String(row.title ?? ''),
      dueDate: row.due_date ? String(row.due_date) : null,
      completed: Number(row.completed ?? 0) === 1,
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? '')
    };
  }

  // DECKS & CARDS
  listDecks(): Deck[] {
    const rows = this.db.prepare('SELECT * FROM decks ORDER BY updated_at DESC').all() as Row[];
    return rows.map((row) => this.mapDeck(row));
  }

  createDeck(payload: CreateDeckPayload): Deck {
    const now = new Date().toISOString();
    const info = this.db
      .prepare(
        'INSERT INTO decks (name, description, created_at, updated_at) VALUES (@name, @description, @created_at, @updated_at)'
      )
      .run({
        name: payload.name,
        description: payload.description ?? null,
        created_at: now,
        updated_at: now
      });
    return this.getDeck(info.lastInsertRowid as number);
  }

  deleteDeck(id: number): void {
    const deleteCards = this.db.prepare('DELETE FROM cards WHERE deck_id = ?');
    const deleteDeck = this.db.prepare('DELETE FROM decks WHERE id = ?');
    const transaction = this.db.transaction((deckId: number) => {
      deleteCards.run(deckId);
      deleteDeck.run(deckId);
    });
    transaction(id);
  }

  private getDeck(id: number): Deck {
    const data = this.db.prepare('SELECT * FROM decks WHERE id = ?').get(id) as Row | undefined;
    if (!data) {
      throw new Error(`Deck with id ${id} not found`);
    }
    return this.mapDeck(data);
  }

  private mapDeck(row: Row): Deck {
    return {
      id: Number(row.id),
      name: String(row.name ?? ''),
      description: row.description ? String(row.description) : null,
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? '')
    };
  }

  listCards(deckId: number): Card[] {
    const rows = this.db
      .prepare('SELECT * FROM cards WHERE deck_id = ? ORDER BY updated_at DESC')
      .all(deckId) as Row[];
    return rows.map((row) => this.mapCard(row));
  }

  createCard(payload: CreateCardPayload): Card {
    const now = new Date().toISOString();
    const info = this.db
      .prepare(
        'INSERT INTO cards (deck_id, front, back, reviews, successes, failures, created_at, updated_at) VALUES (@deck_id, @front, @back, 0, 0, 0, @created_at, @updated_at)'
      )
      .run({
        deck_id: payload.deckId,
        front: payload.front,
        back: payload.back,
        created_at: now,
        updated_at: now
      });
    return this.getCard(info.lastInsertRowid as number);
  }

  updateCard(payload: UpdateCardPayload): Card {
    const now = new Date().toISOString();
    this.db
      .prepare('UPDATE cards SET front = @front, back = @back, updated_at = @updated_at WHERE id = @id')
      .run({ id: payload.id, front: payload.front, back: payload.back, updated_at: now });
    return this.getCard(payload.id);
  }

  deleteCard(id: number): void {
    this.db.prepare('DELETE FROM cards WHERE id = ?').run(id);
  }

  private getCard(id: number): Card {
    const data = this.db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as Row | undefined;
    if (!data) {
      throw new Error(`Card with id ${id} not found`);
    }
    return this.mapCard(data);
  }

  private mapCard(row: Row): Card {
    return {
      id: Number(row.id),
      deckId: Number(row.deck_id ?? 0),
      front: String(row.front ?? ''),
      back: String(row.back ?? ''),
      reviews: Number(row.reviews ?? 0),
      successes: Number(row.successes ?? 0),
      failures: Number(row.failures ?? 0),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? '')
    };
  }

  // STUDY SESSIONS & PROGRESS
  logStudySession(payload: StudySessionPayload): void {
    const now = new Date().toISOString();
    this.db
      .prepare('INSERT INTO study_sessions (duration_minutes, mode, started_at) VALUES (@duration_minutes, @mode, @started_at)')
      .run({
        duration_minutes: payload.durationMinutes,
        mode: payload.mode,
        started_at: now
      });
  }

  listSessions(): StudySession[] {
    const rows = this.db
      .prepare('SELECT * FROM study_sessions ORDER BY started_at DESC LIMIT 50')
      .all() as Row[];
    return rows.map((row) => ({
      id: Number(row.id),
      durationMinutes: Number(row.duration_minutes ?? 0),
      mode: String(row.mode ?? 'focus') as StudySession['mode'],
      startedAt: String(row.started_at ?? '')
    }));
  }

  summary(): ProgressSummary {
    const totals = this.db
      .prepare(
        `SELECT
          IFNULL(SUM(duration_minutes), 0) AS total_minutes,
          (SELECT COUNT(*) FROM tasks WHERE completed = 1) AS completed_tasks,
          (SELECT COUNT(*) FROM tasks WHERE completed = 0) AS pending_tasks,
          (SELECT COUNT(*) FROM decks) AS total_decks,
          (SELECT IFNULL(SUM(reviews), 0) FROM cards) AS cards_reviewed
        FROM study_sessions`
      )
  .get() as Row;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekly = this.db
      .prepare('SELECT COUNT(*) AS count FROM study_sessions WHERE started_at >= ?')
  .get(weekAgo.toISOString()) as Row;

    return {
      totalMinutes: Number(totals.total_minutes ?? 0),
      completedTasks: Number(totals.completed_tasks ?? 0),
      pendingTasks: Number(totals.pending_tasks ?? 0),
      totalDecks: Number(totals.total_decks ?? 0),
      cardsReviewed: Number(totals.cards_reviewed ?? 0),
      sessionsThisWeek: Number(weekly.count ?? 0)
    };
  }

  // PREFERENCES
  getPreferences(): AppPreferences {
    const rows = this.db.prepare('SELECT key, value FROM preferences').all() as Row[];
    const result = new Map<string, string>();
    rows.forEach((row) => {
      result.set(String(row.key), String(row.value));
    });

    const prefs = result.get('app');
    if (prefs) {
      return JSON.parse(prefs) as AppPreferences;
    }

    const fallback: AppPreferences = {
      theme: 'dark',
      notificationsEnabled: false,
      pomodoro: {
        focus: 25,
        shortBreak: 5,
        longBreak: 15
      }
    };
    this.setPreferences(fallback);
    return fallback;
  }

  updatePreference<T>(key: string, value: T): AppPreferences {
    const current = this.getPreferences();
    const next = { ...current, [key]: value } as AppPreferences;
    this.setPreferences(next);
    return next;
  }

  private setPreferences(preferences: AppPreferences): void {
    const payload = JSON.stringify(preferences);
    this.db
      .prepare('INSERT INTO preferences (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run({ key: 'app', value: payload });
  }
}
