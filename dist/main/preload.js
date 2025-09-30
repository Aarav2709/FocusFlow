"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_1 = require("@shared/ipc");
const api = {
    notes: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.NOTES_LIST),
        create: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.NOTES_CREATE, payload),
        update: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.NOTES_UPDATE, payload),
        remove: (id) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.NOTES_DELETE, id)
    },
    tasks: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.TASKS_LIST),
        create: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.TASKS_CREATE, payload),
        toggle: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.TASKS_TOGGLE, payload),
        remove: (id) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.TASKS_DELETE, id)
    },
    flashcards: {
        listDecks: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.DECKS_LIST),
        createDeck: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.DECKS_CREATE, payload),
        removeDeck: (id) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.DECKS_DELETE, id),
        listCards: (deckId) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.CARDS_LIST, deckId),
        createCard: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.CARDS_CREATE, payload),
        updateCard: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.CARDS_UPDATE, payload),
        removeCard: (id) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.CARDS_DELETE, id)
    },
    progress: {
        summary: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.PROGRESS_SUMMARY),
        sessions: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.PROGRESS_SESSIONS),
        logSession: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.PROGRESS_LOG, payload)
    },
    preferences: {
        get: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.PREFERENCES_GET),
        update: (payload) => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.PREFERENCES_UPDATE, payload)
    },
    window: {
        minimize: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.WINDOW_MINIMIZE),
        maximize: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.WINDOW_MAXIMIZE),
        close: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.WINDOW_CLOSE),
        isMaximized: () => electron_1.ipcRenderer.invoke(ipc_1.IPC_CHANNELS.WINDOW_IS_MAXIMIZED)
    }
};
electron_1.contextBridge.exposeInMainWorld('ypt', api);
//# sourceMappingURL=preload.js.map