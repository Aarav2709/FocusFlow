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
import { IPC_CHANNELS } from '@shared/ipc';
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
