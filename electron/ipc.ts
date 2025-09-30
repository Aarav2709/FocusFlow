import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { DatabaseService, NoteRecord, TaskRecord, CardRecord } from './database.js';

type Handler<TArgs extends unknown[], TResult> = (event: IpcMainInvokeEvent, ...args: TArgs) => TResult | Promise<TResult>;

function registerHandler<TArgs extends unknown[], TResult>(channel: string, handler: Handler<TArgs, TResult>) {
  ipcMain.handle(channel, async (event: IpcMainInvokeEvent, ...args: unknown[]) => handler(event, ...(args as TArgs)));
}

export function registerIpcHandlers(db: DatabaseService) {
  // Notes
  registerHandler('notes:getAll', () => db.getNotes());
  registerHandler('notes:create', (_event, payload: { title: string; category?: string; content?: string }) => db.createNote(payload));
  registerHandler('notes:update', (_event, payload: NoteRecord) => db.updateNote(payload));
  registerHandler('notes:delete', (_event, id: number) => {
    db.deleteNote(id);
    return { success: true };
  });

  // Tasks
  registerHandler('tasks:getAll', () => db.getTasks());
  registerHandler('tasks:create', (_event, payload: { title: string; dueDate?: string | null }) => db.createTask(payload));
  registerHandler('tasks:toggle', (_event, payload: { id: number; completed: boolean }) => {
    db.toggleTask(payload.id, payload.completed);
    return { success: true };
  });
  registerHandler('tasks:delete', (_event, id: number) => {
    db.deleteTask(id);
    return { success: true };
  });

  // Flashcards
  registerHandler('decks:getAll', () => db.getDecks());
  registerHandler('decks:create', (_event, payload: { name: string; description?: string | null }) => db.createDeck(payload));
  registerHandler('decks:delete', (_event, id: number) => {
    db.deleteDeck(id);
    return { success: true };
  });
  registerHandler('cards:getByDeck', (_event, deckId: number) => db.getCards(deckId));
  registerHandler('cards:create', (_event, payload: { deckId: number; front: string; back: string }) => db.createCard(payload));
  registerHandler('cards:update', (_event, payload: CardRecord) => db.updateCard(payload));
  registerHandler('cards:delete', (_event, id: number) => {
    db.deleteCard(id);
    return { success: true };
  });

  // Study sessions
  registerHandler('progress:logSession', (_event, payload: { durationMinutes: number; mode: string }) => {
    db.logStudySession(payload);
    return { success: true };
  });
  registerHandler('progress:getSummary', () => db.getProgressSummary());
  registerHandler('progress:getSessions', (_event, limit?: number) => db.getStudySessions(limit));

  // Settings
  registerHandler('settings:getAll', () => ({
    theme: db.getSetting('theme', 'dark'),
    pomodoro: db.getSetting('pomodoro', { focus: 25, shortBreak: 5, longBreak: 15 })
  }));
  registerHandler('settings:update', (_event, payload: { key: string; value: unknown }) => {
    db.setSetting(payload.key, payload.value);
    return { success: true };
  });
}
