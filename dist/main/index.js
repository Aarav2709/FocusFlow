"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const database_1 = require("./database");
const ipc_1 = require("./ipc");
const isDev = process.env.ELECTRON_IS_DEV === '1';
let mainWindow = null;
let database = null;
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
const createWindow = async () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1100,
        minHeight: 700,
        frame: false,
        backgroundColor: electron_1.nativeTheme.shouldUseDarkColors ? '#0f0f13' : '#ffffff',
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 16, y: 14 },
        webPreferences: {
            preload: node_path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            spellcheck: false
        }
    });
    mainWindow.setMenuBarVisibility(false);
    if (isDev) {
        await mainWindow.loadURL(devServerUrl);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        const indexHtml = node_path_1.default.join(__dirname, '../renderer/index.html');
        await mainWindow.loadFile(indexHtml);
    }
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url).catch((error) => console.error('Failed to open external URL', error));
        return { action: 'deny' };
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
const bootstrap = async () => {
    if (!electron_1.app.requestSingleInstanceLock()) {
        electron_1.app.quit();
        return;
    }
    electron_1.app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
    const dbPath = node_path_1.default.join(electron_1.app.getPath('userData'), 'ypt-desktop.db');
    database = new database_1.DatabaseService(dbPath);
    (0, ipc_1.registerIpcHandlers)(database, () => mainWindow);
    await electron_1.app.whenReady();
    await createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            void createWindow();
        }
    });
};
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
bootstrap().catch((error) => {
    console.error('Failed to bootstrap application', error);
    electron_1.app.quit();
});
//# sourceMappingURL=index.js.map