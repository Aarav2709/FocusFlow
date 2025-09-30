import fs from 'fs';
import path from 'path';
import { AppData, Note, Subject, TimerSession } from '../shared/types';

const DEFAULT_DATA: AppData = { subjects: [], sessions: [], notes: [] };

export class StorageService {
  private filePath: string;
  private data: AppData;

  constructor(userDataPath: string) {
    this.filePath = path.join(userDataPath, 'ypt-data.json');
    this.data = DEFAULT_DATA;
    this._load();
  }

  private _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw) as AppData;
      } else {
        this._save();
      }
    } catch (err) {
      console.error('Failed to load data, initializing with defaults', err);
      this.data = DEFAULT_DATA;
      this._save();
    }
  }

  private _save() {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save data', err);
    }
  }

  getAll(): AppData {
    return JSON.parse(JSON.stringify(this.data));
  }

  getSubjects(): Subject[] {
    return this.data.subjects;
  }

  addSubject(s: Subject) {
    this.data.subjects.push(s);
    this._save();
    return s;
  }

  updateSubject(subject: Subject) {
    this.data.subjects = this.data.subjects.map((x) => (x.id === subject.id ? subject : x));
    this._save();
    return subject;
  }

  removeSubject(id: string) {
    this.data.subjects = this.data.subjects.filter((s) => s.id !== id);
    this.data.sessions = this.data.sessions.filter((t) => t.subjectId !== id);
    this.data.notes = this.data.notes.filter((n) => n.subjectId !== id);
    this._save();
  }

  addSession(session: TimerSession) {
    this.data.sessions.push(session);
    this._save();
    return session;
  }

  endSession(sessionId: string) {
    const s = this.data.sessions.find((x) => x.id === sessionId);
    if (s) {
      s.end = new Date().toISOString();
      this._save();
    }
    return s;
  }

  listSessions(subjectId?: string) {
    return subjectId ? this.data.sessions.filter((s) => s.subjectId === subjectId) : this.data.sessions;
  }

  getNote(subjectId: string) {
    return this.data.notes.find((n) => n.subjectId === subjectId) ?? null;
  }

  saveNote(note: Note) {
    const existing = this.data.notes.find((n) => n.subjectId === note.subjectId);
    if (existing) {
      existing.content = note.content;
      existing.updatedAt = note.updatedAt;
    } else {
      this.data.notes.push(note);
    }
    this._save();
    return note;
  }

  totals() {
    const bySubject: Record<string, number> = {};
    let overall = 0;
    for (const s of this.data.sessions) {
      const end = s.end ? new Date(s.end) : new Date();
      const start = new Date(s.start);
      const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
      bySubject[s.subjectId] = (bySubject[s.subjectId] ?? 0) + mins;
      overall += mins;
    }
    return { bySubject, overall };
  }

  daily(days = 7) {
    const result: Record<string, number> = {};
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
    for (const s of this.data.sessions) {
      const start = new Date(s.start);
      if (start >= since) {
        const end = s.end ? new Date(s.end) : new Date();
        const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
        result[s.subjectId] = (result[s.subjectId] ?? 0) + mins;
      }
    }
    return result;
  }
}
