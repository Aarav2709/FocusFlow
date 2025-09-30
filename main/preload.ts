// ensure module-alias is registered in the preload process so @shared/* resolves in compiled preload.js
// use a runtime require wrapped in try/catch to avoid bundlers (Vite) attempting to resolve this during renderer dev
try {
  // Only attempt to register in Electron runtime where module-alias will be available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('module-alias/register');
  }
} catch (err) {
  /* ignore — in dev the module may not be resolvable by the renderer bundler */
}

import { contextBridge, ipcRenderer } from 'electron';
import path from 'node:path';

// Load IPC_CHANNELS at runtime. During Vite dev the renderer sandbox may attempt to
// evaluate the preload bundle and fail to resolve the '@shared' alias. In that case
// fall back to loading the compiled file in dist/shared/ipc.js directly.
let IPC_CHANNELS: any = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IPC_CHANNELS = require('@shared/ipc').IPC_CHANNELS;
} catch (e) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    IPC_CHANNELS = require(path.join(__dirname, '..', 'shared', 'ipc.js')).IPC_CHANNELS;
  } catch (err) {
    // If this fails, expose an empty object so the renderer can still start in a degraded
    // mode and we can show a helpful error instead of a crash.
    // eslint-disable-next-line no-console
    console.error('[preload] Failed to load IPC channels from @shared or dist/shared:', err);
    IPC_CHANNELS = {};
  }
}
import type {
  CreateCardPayload,
  CreateDeckPayload,
  CreateNotePayload,
  CreateTaskPayload,
  RendererApi,
  StudySessionPayload,
  ToggleTaskPayload,
  UpdateCardPayload,
  UpdateNotePayload,
  UpdatePreferencePayload
} from '@shared/types';

const api: RendererApi = {
  notes: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.NOTES_LIST),
    create: (payload: CreateNotePayload) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_CREATE, payload),
    update: (payload: UpdateNotePayload) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_UPDATE, payload),
    remove: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_DELETE, id)
  },
  tasks: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.TASKS_LIST),
    create: (payload: CreateTaskPayload) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_CREATE, payload),
    toggle: (payload: ToggleTaskPayload) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_TOGGLE, payload),
    remove: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_DELETE, id)
  },
  flashcards: {
    listDecks: () => ipcRenderer.invoke(IPC_CHANNELS.DECKS_LIST),
    createDeck: (payload: CreateDeckPayload) => ipcRenderer.invoke(IPC_CHANNELS.DECKS_CREATE, payload),
    removeDeck: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DECKS_DELETE, id),
    listCards: (deckId: number) => ipcRenderer.invoke(IPC_CHANNELS.CARDS_LIST, deckId),
    createCard: (payload: CreateCardPayload) => ipcRenderer.invoke(IPC_CHANNELS.CARDS_CREATE, payload),
    updateCard: (payload: UpdateCardPayload) => ipcRenderer.invoke(IPC_CHANNELS.CARDS_UPDATE, payload),
    removeCard: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.CARDS_DELETE, id)
  },
  progress: {
    summary: () => ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_SUMMARY),
    sessions: () => ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_SESSIONS),
    logSession: (payload: StudySessionPayload) => ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_LOG, payload)
  },
  preferences: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.PREFERENCES_GET),
    update: <T>(payload: UpdatePreferencePayload<T>) =>
      ipcRenderer.invoke(IPC_CHANNELS.PREFERENCES_UPDATE, payload)
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED)
  }
};

contextBridge.exposeInMainWorld('ypt', api);
// Debug-only: indicate preload executed when running inside Electron
try {
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    // eslint-disable-next-line no-console
    console.log('[preload] preload loaded — IPC channels available:', Object.keys(IPC_CHANNELS || {}));
  }
} catch (err) {
  // ignore
}
