"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = void 0;
const electron_1 = require("electron");
const ipc_1 = require("@shared/ipc");
const registerIpcHandlers = (db, getWindow) => {
    const safeHandler = (handler) => {
        try {
            return Promise.resolve(handler());
        }
        catch (error) {
            console.error('IPC handler error', error);
            throw error;
        }
    };
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.NOTES_LIST, () => safeHandler(() => db.listNotes()));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.NOTES_CREATE, (_event, payload) => safeHandler(() => db.createNote(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.NOTES_UPDATE, (_event, payload) => safeHandler(() => db.updateNote(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.NOTES_DELETE, (_event, id) => safeHandler(() => db.deleteNote(id)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.TASKS_LIST, () => safeHandler(() => db.listTasks()));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.TASKS_CREATE, (_event, payload) => safeHandler(() => db.createTask(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.TASKS_TOGGLE, (_event, payload) => safeHandler(() => db.toggleTask(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.TASKS_DELETE, (_event, id) => safeHandler(() => db.deleteTask(id)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.DECKS_LIST, () => safeHandler(() => db.listDecks()));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.DECKS_CREATE, (_event, payload) => safeHandler(() => db.createDeck(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.DECKS_DELETE, (_event, id) => safeHandler(() => db.deleteDeck(id)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.CARDS_LIST, (_event, deckId) => safeHandler(() => db.listCards(deckId)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.CARDS_CREATE, (_event, payload) => safeHandler(() => db.createCard(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.CARDS_UPDATE, (_event, payload) => safeHandler(() => db.updateCard(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.CARDS_DELETE, (_event, id) => safeHandler(() => db.deleteCard(id)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.PROGRESS_SUMMARY, () => safeHandler(() => db.summary()));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.PROGRESS_SESSIONS, () => safeHandler(() => db.listSessions()));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.PROGRESS_LOG, (_event, payload) => safeHandler(() => db.logStudySession(payload)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.PREFERENCES_GET, () => safeHandler(() => db.getPreferences()));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.PREFERENCES_UPDATE, (_event, payload) => safeHandler(() => db.updatePreference(payload.key, payload.value)));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.WINDOW_MINIMIZE, () => safeHandler(() => {
        const win = getWindow();
        win?.minimize();
    }));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.WINDOW_MAXIMIZE, () => safeHandler(() => {
        const win = getWindow();
        if (!win)
            return;
        if (win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win.maximize();
        }
    }));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.WINDOW_CLOSE, () => safeHandler(() => {
        const win = getWindow();
        win?.close();
    }));
    electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => safeHandler(() => getWindow()?.isMaximized() ?? false));
};
exports.registerIpcHandlers = registerIpcHandlers;
//# sourceMappingURL=ipc.js.map