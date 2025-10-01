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
// don't import 'node:path' at module-eval time because Vite's sandbox may try to resolve
// node: imports and fail. Require it at runtime only when we're inside Electron.

// Load IPC_CHANNELS at runtime. During Vite dev the renderer sandbox may attempt to
// evaluate the preload bundle and fail to resolve the '@shared' alias. In that case
// fall back to loading the compiled file in dist/shared/ipc.js directly.
const IPC_FALLBACK_CHANNELS = {
  NOTES_LIST: 'ypt:notes:list',
  NOTES_CREATE: 'ypt:notes:create',
  NOTES_UPDATE: 'ypt:notes:update',
  NOTES_DELETE: 'ypt:notes:delete',
  TASKS_LIST: 'ypt:tasks:list',
  TASKS_CREATE: 'ypt:tasks:create',
  TASKS_TOGGLE: 'ypt:tasks:toggle',
  TASKS_DELETE: 'ypt:tasks:delete',
  DECKS_LIST: 'ypt:decks:list',
  DECKS_CREATE: 'ypt:decks:create',
  DECKS_DELETE: 'ypt:decks:delete',
  CARDS_LIST: 'ypt:cards:list',
  CARDS_CREATE: 'ypt:cards:create',
  CARDS_UPDATE: 'ypt:cards:update',
  CARDS_DELETE: 'ypt:cards:delete',
  PROGRESS_SUMMARY: 'ypt:progress:summary',
  PROGRESS_SESSIONS: 'ypt:progress:sessions',
  PROGRESS_LOG: 'ypt:progress:log',
  PREFERENCES_GET: 'ypt:prefs:get',
  PREFERENCES_UPDATE: 'ypt:prefs:update',
  WINDOW_MINIMIZE: 'ypt:window:minimize',
  WINDOW_MAXIMIZE: 'ypt:window:maximize',
  WINDOW_CLOSE: 'ypt:window:close',
  WINDOW_IS_MAXIMIZED: 'ypt:window:is-maximized'
} as const;

let IPC_CHANNELS: any = {};
// Only try to load the shared IPC constants when running inside Electron.
// The preload bundle may be evaluated by Vite in a sandboxed environment that
// doesn't have Node's require; guard to avoid module-not-found errors.
if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    IPC_CHANNELS = require('@shared/ipc').IPC_CHANNELS;
  } catch (e) {
    try {
      // Only attempt a filesystem fallback when __dirname is defined (Node/Electron runtime).
      if (typeof __dirname !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        IPC_CHANNELS = require(__dirname + '/../shared/ipc.js').IPC_CHANNELS;
      } else {
        throw new Error('__dirname is not defined in this evaluation environment');
      }
    } catch (err) {
      // If this fails while evaluating in a bundler sandbox, silence the noisy stack
      // and fall back to degraded mode; a one-time console.warn is emitted below
      // to indicate degraded mode.
  IPC_CHANNELS = { ...IPC_FALLBACK_CHANNELS };
    }
  }
} else {
  // Not running in Electron; don't attempt Node requires here.
  IPC_CHANNELS = { ...IPC_FALLBACK_CHANNELS };
}

if (!IPC_CHANNELS || Object.keys(IPC_CHANNELS).length === 0) {
  IPC_CHANNELS = { ...IPC_FALLBACK_CHANNELS };
}
import type {
  CreateCardPayload,
  CreateDeckPayload,
  CreateNotePayload,
  CreateTaskPayload,
  ID,
  RendererApi,
  StudySessionPayload,
  ToggleTaskPayload,
  UpdateCardPayload,
  UpdateNotePayload
} from '@shared/types';

// helper that only invokes ipcRenderer when the channel is available
const safeInvoke = (channel: string | undefined, fallback: any, ...args: any[]) => {
  if (channel) return ipcRenderer.invoke(channel, ...args);
  return Promise.resolve(fallback);
};

const api: RendererApi = {
  notes: {
    list: () => safeInvoke(IPC_CHANNELS.NOTES_LIST, []),
    create: (payload: CreateNotePayload) => safeInvoke(IPC_CHANNELS.NOTES_CREATE, { id: Date.now(), ...payload }, payload),
  update: (payload: UpdateNotePayload) => safeInvoke(IPC_CHANNELS.NOTES_UPDATE, payload, payload),
    remove: (id: ID) => safeInvoke(IPC_CHANNELS.NOTES_DELETE, undefined, id)
  },
  tasks: {
    list: () => safeInvoke(IPC_CHANNELS.TASKS_LIST, []),
    create: (payload: CreateTaskPayload) => safeInvoke(IPC_CHANNELS.TASKS_CREATE, { id: Date.now(), ...payload }, payload),
  toggle: (payload: ToggleTaskPayload) => safeInvoke(IPC_CHANNELS.TASKS_TOGGLE, payload, payload),
    remove: (id: ID) => safeInvoke(IPC_CHANNELS.TASKS_DELETE, undefined, id)
  },
  flashcards: {
    listDecks: () => safeInvoke(IPC_CHANNELS.DECKS_LIST, []),
    createDeck: (payload: CreateDeckPayload) => safeInvoke(IPC_CHANNELS.DECKS_CREATE, { id: Date.now(), ...payload }, payload),
    removeDeck: (id: ID) => safeInvoke(IPC_CHANNELS.DECKS_DELETE, undefined, id),
    listCards: (deckId: ID) => safeInvoke(IPC_CHANNELS.CARDS_LIST, [] , deckId),
    createCard: (payload: CreateCardPayload) => safeInvoke(IPC_CHANNELS.CARDS_CREATE, { id: Date.now(), ...payload }, payload),
  updateCard: (payload: UpdateCardPayload) => safeInvoke(IPC_CHANNELS.CARDS_UPDATE, payload, payload),
    removeCard: (id: ID) => safeInvoke(IPC_CHANNELS.CARDS_DELETE, undefined, id)
  },
  progress: {
    summary: () => safeInvoke(IPC_CHANNELS.PROGRESS_SUMMARY, null),
    sessions: () => safeInvoke(IPC_CHANNELS.PROGRESS_SESSIONS, []),
    logSession: (payload: StudySessionPayload) => safeInvoke(IPC_CHANNELS.PROGRESS_LOG, undefined, payload)
  },
  preferences: {
    get: () => safeInvoke(IPC_CHANNELS.PREFERENCES_GET, null),
    update: <T>(payload: { key: string; value: T }) => safeInvoke(IPC_CHANNELS.PREFERENCES_UPDATE, null, payload)
  },
  window: {
    minimize: () => safeInvoke(IPC_CHANNELS.WINDOW_MINIMIZE, undefined),
    maximize: () => safeInvoke(IPC_CHANNELS.WINDOW_MAXIMIZE, undefined),
    close: () => safeInvoke(IPC_CHANNELS.WINDOW_CLOSE, undefined),
    isMaximized: () => safeInvoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, false)
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

// One-time developer-visible warning when running without IPC channels in Electron.
try {
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    if (!IPC_CHANNELS || Object.keys(IPC_CHANNELS).length === 0) {
      // eslint-disable-next-line no-console
      console.warn('[preload] Running in degraded mode: IPC channels not available — native features will be mocked.');
    }
  }
} catch (err) {
  // ignore
}
