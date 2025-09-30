import { BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import type {
  CreateCardPayload,
  CreateDeckPayload,
  CreateNotePayload,
  CreateTaskPayload,
  StudySessionPayload,
  ToggleTaskPayload,
  UpdateCardPayload,
  UpdateNotePayload
} from '@shared/types';
import type { DatabaseService } from './database';

export const registerIpcHandlers = (db: DatabaseService, getWindow: () => BrowserWindow | null): void => {
  const safeHandler = <T>(handler: () => T | Promise<T>) => {
    try {
      return Promise.resolve(handler());
    } catch (error) {
      console.error('IPC handler error', error);
      throw error;
    }
  };

  ipcMain.handle(IPC_CHANNELS.NOTES_LIST, () => safeHandler(() => db.listNotes()));
  ipcMain.handle(IPC_CHANNELS.NOTES_CREATE, (_event, payload: CreateNotePayload) =>
    safeHandler(() => db.createNote(payload))
  );
  ipcMain.handle(IPC_CHANNELS.NOTES_UPDATE, (_event, payload: UpdateNotePayload) =>
    safeHandler(() => db.updateNote(payload))
  );
  ipcMain.handle(IPC_CHANNELS.NOTES_DELETE, (_event, id: number) => safeHandler(() => db.deleteNote(id)));

  ipcMain.handle(IPC_CHANNELS.TASKS_LIST, () => safeHandler(() => db.listTasks()));
  ipcMain.handle(IPC_CHANNELS.TASKS_CREATE, (_event, payload: CreateTaskPayload) =>
    safeHandler(() => db.createTask(payload))
  );
  ipcMain.handle(IPC_CHANNELS.TASKS_TOGGLE, (_event, payload: ToggleTaskPayload) =>
    safeHandler(() => db.toggleTask(payload))
  );
  ipcMain.handle(IPC_CHANNELS.TASKS_DELETE, (_event, id: number) => safeHandler(() => db.deleteTask(id)));

  ipcMain.handle(IPC_CHANNELS.DECKS_LIST, () => safeHandler(() => db.listDecks()));
  ipcMain.handle(IPC_CHANNELS.DECKS_CREATE, (_event, payload: CreateDeckPayload) =>
    safeHandler(() => db.createDeck(payload))
  );
  ipcMain.handle(IPC_CHANNELS.DECKS_DELETE, (_event, id: number) => safeHandler(() => db.deleteDeck(id)));

  ipcMain.handle(IPC_CHANNELS.CARDS_LIST, (_event, deckId: number) => safeHandler(() => db.listCards(deckId)));
  ipcMain.handle(IPC_CHANNELS.CARDS_CREATE, (_event, payload: CreateCardPayload) =>
    safeHandler(() => db.createCard(payload))
  );
  ipcMain.handle(IPC_CHANNELS.CARDS_UPDATE, (_event, payload: UpdateCardPayload) =>
    safeHandler(() => db.updateCard(payload))
  );
  ipcMain.handle(IPC_CHANNELS.CARDS_DELETE, (_event, id: number) => safeHandler(() => db.deleteCard(id)));

  ipcMain.handle(IPC_CHANNELS.PROGRESS_SUMMARY, () => safeHandler(() => db.summary()));
  ipcMain.handle(IPC_CHANNELS.PROGRESS_SESSIONS, () => safeHandler(() => db.listSessions()));
  ipcMain.handle(IPC_CHANNELS.PROGRESS_LOG, (_event, payload: StudySessionPayload) =>
    safeHandler(() => db.logStudySession(payload))
  );

  ipcMain.handle(IPC_CHANNELS.PREFERENCES_GET, () => safeHandler(() => db.getPreferences()));
  ipcMain.handle(IPC_CHANNELS.PREFERENCES_UPDATE, (_event, payload: { key: string; value: unknown }) =>
    safeHandler(() => db.updatePreference(payload.key, payload.value))
  );

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
};
