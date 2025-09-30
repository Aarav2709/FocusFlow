"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
class DatabaseService {
    basePath;
    db;
    constructor(basePath) {
        this.basePath = basePath;
        const dbDir = node_path_1.default.dirname(basePath);
        if (!node_fs_1.default.existsSync(dbDir)) {
            node_fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        this.db = new better_sqlite3_1.default(basePath);
        this.db.pragma('journal_mode = WAL');
        this.migrate();
    }
    migrate() {
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
            const defaultPrefs = {
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
    listNotes() {
        const rows = this.db
            .prepare('SELECT * FROM notes ORDER BY updated_at DESC')
            .all();
        return rows.map((row) => this.mapNote(row));
    }
    createNote(payload) {
        const now = new Date().toISOString();
        const stmt = this.db.prepare('INSERT INTO notes (title, content, category, created_at, updated_at) VALUES (@title, @content, @category, @created_at, @updated_at)');
        const info = stmt.run({
            title: payload.title,
            content: payload.content,
            category: payload.category ?? null,
            created_at: now,
            updated_at: now
        });
        return this.getNote(info.lastInsertRowid);
    }
    updateNote(payload) {
        const now = new Date().toISOString();
        this.db.prepare('UPDATE notes SET title = @title, content = @content, category = @category, updated_at = @updated_at WHERE id = @id').run({
            id: payload.id,
            title: payload.title,
            content: payload.content,
            category: payload.category ?? null,
            updated_at: now
        });
        return this.getNote(payload.id);
    }
    deleteNote(id) {
        this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    }
    getNote(id) {
        const data = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
        if (!data) {
            throw new Error(`Note with id ${id} not found`);
        }
        return this.mapNote(data);
    }
    mapNote(row) {
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
    listTasks() {
        const rows = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
        return rows.map((row) => this.mapTask(row));
    }
    createTask(payload) {
        const now = new Date().toISOString();
        const info = this.db
            .prepare('INSERT INTO tasks (title, due_date, completed, created_at, updated_at) VALUES (@title, @due_date, @completed, @created_at, @updated_at)')
            .run({
            title: payload.title,
            due_date: payload.dueDate ?? null,
            completed: 0,
            created_at: now,
            updated_at: now
        });
        return this.getTask(info.lastInsertRowid);
    }
    toggleTask(payload) {
        const now = new Date().toISOString();
        this.db
            .prepare('UPDATE tasks SET completed = @completed, updated_at = @updated_at WHERE id = @id')
            .run({ id: payload.id, completed: payload.completed ? 1 : 0, updated_at: now });
        return this.getTask(payload.id);
    }
    deleteTask(id) {
        this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    }
    getTask(id) {
        const data = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        if (!data) {
            throw new Error(`Task with id ${id} not found`);
        }
        return this.mapTask(data);
    }
    mapTask(row) {
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
    listDecks() {
        const rows = this.db.prepare('SELECT * FROM decks ORDER BY updated_at DESC').all();
        return rows.map((row) => this.mapDeck(row));
    }
    createDeck(payload) {
        const now = new Date().toISOString();
        const info = this.db
            .prepare('INSERT INTO decks (name, description, created_at, updated_at) VALUES (@name, @description, @created_at, @updated_at)')
            .run({
            name: payload.name,
            description: payload.description ?? null,
            created_at: now,
            updated_at: now
        });
        return this.getDeck(info.lastInsertRowid);
    }
    deleteDeck(id) {
        const deleteCards = this.db.prepare('DELETE FROM cards WHERE deck_id = ?');
        const deleteDeck = this.db.prepare('DELETE FROM decks WHERE id = ?');
        const transaction = this.db.transaction((deckId) => {
            deleteCards.run(deckId);
            deleteDeck.run(deckId);
        });
        transaction(id);
    }
    getDeck(id) {
        const data = this.db.prepare('SELECT * FROM decks WHERE id = ?').get(id);
        if (!data) {
            throw new Error(`Deck with id ${id} not found`);
        }
        return this.mapDeck(data);
    }
    mapDeck(row) {
        return {
            id: Number(row.id),
            name: String(row.name ?? ''),
            description: row.description ? String(row.description) : null,
            createdAt: String(row.created_at ?? ''),
            updatedAt: String(row.updated_at ?? '')
        };
    }
    listCards(deckId) {
        const rows = this.db
            .prepare('SELECT * FROM cards WHERE deck_id = ? ORDER BY updated_at DESC')
            .all(deckId);
        return rows.map((row) => this.mapCard(row));
    }
    createCard(payload) {
        const now = new Date().toISOString();
        const info = this.db
            .prepare('INSERT INTO cards (deck_id, front, back, reviews, successes, failures, created_at, updated_at) VALUES (@deck_id, @front, @back, 0, 0, 0, @created_at, @updated_at)')
            .run({
            deck_id: payload.deckId,
            front: payload.front,
            back: payload.back,
            created_at: now,
            updated_at: now
        });
        return this.getCard(info.lastInsertRowid);
    }
    updateCard(payload) {
        const now = new Date().toISOString();
        this.db
            .prepare('UPDATE cards SET front = @front, back = @back, updated_at = @updated_at WHERE id = @id')
            .run({ id: payload.id, front: payload.front, back: payload.back, updated_at: now });
        return this.getCard(payload.id);
    }
    deleteCard(id) {
        this.db.prepare('DELETE FROM cards WHERE id = ?').run(id);
    }
    getCard(id) {
        const data = this.db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
        if (!data) {
            throw new Error(`Card with id ${id} not found`);
        }
        return this.mapCard(data);
    }
    mapCard(row) {
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
    logStudySession(payload) {
        const now = new Date().toISOString();
        this.db
            .prepare('INSERT INTO study_sessions (duration_minutes, mode, started_at) VALUES (@duration_minutes, @mode, @started_at)')
            .run({
            duration_minutes: payload.durationMinutes,
            mode: payload.mode,
            started_at: now
        });
    }
    listSessions() {
        const rows = this.db
            .prepare('SELECT * FROM study_sessions ORDER BY started_at DESC LIMIT 50')
            .all();
        return rows.map((row) => ({
            id: Number(row.id),
            durationMinutes: Number(row.duration_minutes ?? 0),
            mode: String(row.mode ?? 'focus'),
            startedAt: String(row.started_at ?? '')
        }));
    }
    summary() {
        const totals = this.db
            .prepare(`SELECT
          IFNULL(SUM(duration_minutes), 0) AS total_minutes,
          (SELECT COUNT(*) FROM tasks WHERE completed = 1) AS completed_tasks,
          (SELECT COUNT(*) FROM tasks WHERE completed = 0) AS pending_tasks,
          (SELECT COUNT(*) FROM decks) AS total_decks,
          (SELECT IFNULL(SUM(reviews), 0) FROM cards) AS cards_reviewed
        FROM study_sessions`)
            .get();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekly = this.db
            .prepare('SELECT COUNT(*) AS count FROM study_sessions WHERE started_at >= ?')
            .get(weekAgo.toISOString());
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
    getPreferences() {
        const rows = this.db.prepare('SELECT key, value FROM preferences').all();
        const result = new Map();
        rows.forEach((row) => {
            result.set(String(row.key), String(row.value));
        });
        const prefs = result.get('app');
        if (prefs) {
            return JSON.parse(prefs);
        }
        const fallback = {
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
    updatePreference(key, value) {
        const current = this.getPreferences();
        const next = { ...current, [key]: value };
        this.setPreferences(next);
        return next;
    }
    setPreferences(preferences) {
        const payload = JSON.stringify(preferences);
        this.db
            .prepare('INSERT INTO preferences (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
            .run({ key: 'app', value: payload });
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map