// register runtime aliases so the compiled Electron main process can resolve @shared/* inside packaged builds
import 'module-alias/register';
import './register-aliases';
import path from 'node:path';
import { app, BrowserWindow, nativeTheme, shell } from 'electron';
import { DatabaseService } from './database';
import { registerIpcHandlers, registerStorageIpcHandlers } from './ipc';
import { StorageService } from './storage';

const isDev = process.env.ELECTRON_IS_DEV === '1';
let mainWindow: BrowserWindow | null = null;
let database: DatabaseService | null = null;
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';

const createWindow = async (): Promise<void> => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0f0f13' : '#ffffff',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 14 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  const revealWindow = () => {
    if (!mainWindow) return;
    if (!mainWindow.isMaximized()) {
      mainWindow.maximize();
    }
    mainWindow.show();
  };

  mainWindow.once('ready-to-show', revealWindow);

  if (isDev) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(__dirname, '../renderer/index.html');
    await mainWindow.loadFile(indexHtml);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    shell.openExternal(url).catch((error: unknown) => console.error('Failed to open external URL', error));
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const bootstrap = async (): Promise<void> => {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  const dbPath = path.join(app.getPath('userData'), 'focusflow-desktop.db');
  try {
    database = new DatabaseService(dbPath);
    registerIpcHandlers(database, () => mainWindow);
  } catch (err) {
    console.warn('DatabaseService failed to initialize, falling back to JSON storage:', err);
    const storage = new StorageService(app.getPath('userData'));
    registerStorageIpcHandlers(storage);
  }

  await app.whenReady();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

bootstrap().catch((error) => {
  console.error('Failed to bootstrap application', error);
  app.quit();
});
