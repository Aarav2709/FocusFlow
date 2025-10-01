import { BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import type { DatabaseService } from './database';
import { StorageService } from './storage';

export function registerIpcHandlers(db: DatabaseService, getWindow: () => BrowserWindow | null): void {
  const safeHandler = <T>(handler: () => T | Promise<T>) => {
    try {
      return Promise.resolve(handler());
    } catch (error) {
      console.error('IPC handler error', error);
      throw error;
    }
  };

  // Notes
  ipcMain.handle(IPC_CHANNELS.NOTES_LIST, () => safeHandler(() => (db as any).listNotes()));
  ipcMain.handle(IPC_CHANNELS.NOTES_CREATE, (_event, payload: any) => safeHandler(() => (db as any).createNote(payload)));
  ipcMain.handle(IPC_CHANNELS.NOTES_UPDATE, (_event, payload: any) => safeHandler(() => (db as any).updateNote({ ...payload, id: Number((payload as any).id) })));
  ipcMain.handle(IPC_CHANNELS.NOTES_DELETE, (_event, id: any) => safeHandler(() => (db as any).deleteNote(Number(id))));

  // Tasks
  ipcMain.handle(IPC_CHANNELS.TASKS_LIST, () => safeHandler(() => (db as any).listTasks()));
  ipcMain.handle(IPC_CHANNELS.TASKS_CREATE, (_event, payload: any) => safeHandler(() => (db as any).createTask(payload)));
  ipcMain.handle(IPC_CHANNELS.TASKS_TOGGLE, (_event, payload: any) => safeHandler(() => (db as any).toggleTask({ ...payload, id: Number((payload as any).id) })));
  ipcMain.handle(IPC_CHANNELS.TASKS_DELETE, (_event, id: any) => safeHandler(() => (db as any).deleteTask(Number(id))));

  // Decks & Cards
  ipcMain.handle(IPC_CHANNELS.DECKS_LIST, () => safeHandler(() => (db as any).listDecks()));
  ipcMain.handle(IPC_CHANNELS.DECKS_CREATE, (_event, payload: any) => safeHandler(() => (db as any).createDeck(payload)));
  ipcMain.handle(IPC_CHANNELS.DECKS_DELETE, (_event, id: any) => safeHandler(() => (db as any).deleteDeck(Number(id))));

  ipcMain.handle(IPC_CHANNELS.CARDS_LIST, (_event, deckId: any) => safeHandler(() => (db as any).listCards(Number(deckId))));
  ipcMain.handle(IPC_CHANNELS.CARDS_CREATE, (_event, payload: any) => safeHandler(() => (db as any).createCard({ ...payload, deckId: Number((payload as any).deckId) })));
  ipcMain.handle(IPC_CHANNELS.CARDS_UPDATE, (_event, payload: any) => safeHandler(() => (db as any).updateCard({ ...payload, id: Number((payload as any).id) })));
  ipcMain.handle(IPC_CHANNELS.CARDS_DELETE, (_event, id: any) => safeHandler(() => (db as any).deleteCard(Number(id))));

  // Progress
  ipcMain.handle(IPC_CHANNELS.PROGRESS_SUMMARY, () => safeHandler(() => (db as any).summary()));
  ipcMain.handle(IPC_CHANNELS.PROGRESS_SESSIONS, () => safeHandler(() => (db as any).listSessions()));
  ipcMain.handle(IPC_CHANNELS.PROGRESS_LOG, (_event, payload: any) => safeHandler(() => (db as any).logStudySession(payload)));

  // Preferences
  ipcMain.handle(IPC_CHANNELS.PREFERENCES_GET, () => safeHandler(() => (db as any).getPreferences()));
  ipcMain.handle(IPC_CHANNELS.PREFERENCES_UPDATE, (_event, payload: { key: string; value: unknown }) =>
    safeHandler(() => (db as any).updatePreference(payload.key, payload.value))
  );

  // Window controls
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () =>
    safeHandler(() => {
      const win = getWindow();
      win?.minimize();
    })
  );
  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () =>
    safeHandler(() => {
      const win = getWindow();
      if (!win) return;
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    })
  );
  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () =>
    safeHandler(() => {
      const win = getWindow();
      win?.close();
    })
  );
  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => safeHandler(() => getWindow()?.isMaximized() ?? false));
}

export function registerStorageIpcHandlers(storage: StorageService) {
  const id = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString());

  ipcMain.handle('subjects:list', () => storage.getSubjects());

  ipcMain.handle('subjects:create', (_e, name: string) => {
    const s = { id: id(), name, createdAt: new Date().toISOString() };
    return storage.addSubject(s);
  });

  ipcMain.handle('subjects:update', (_e, subject) => storage.updateSubject(subject));
  ipcMain.handle('subjects:remove', (_e, id: string) => storage.removeSubject(id));

  ipcMain.handle('timers:start', (_e, subjectId: string) => {
    const session = { id: id(), subjectId, start: new Date().toISOString() };
    return storage.addSession(session);
  });

  ipcMain.handle('timers:stop', (_e, sessionId: string) => storage.endSession(sessionId));
  ipcMain.handle('timers:list', (_e, subjectId?: string) => storage.listSessions(subjectId));

  ipcMain.handle('notes:get', (_e, subjectId: string) => storage.getNote(subjectId));
  ipcMain.handle('notes:save', (_e, subjectId: string, content: string) =>
    storage.saveNote({
      id: id(), subjectId, content, updatedAt: new Date().toISOString(),
      title: '',
      createdAt: ''
    })
  );

  ipcMain.handle('stats:totals', () => storage.totals());
  ipcMain.handle('stats:daily', (_e, days?: number) => storage.daily(days));
}
