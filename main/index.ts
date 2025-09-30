import { app, BrowserWindow, nativeTheme, shell } from 'electron';
import path from 'node:path';
import { DatabaseService } from './database';
import { registerIpcHandlers } from './ipc';

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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

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

  const dbPath = path.join(app.getPath('userData'), 'ypt-desktop.db');
  database = new DatabaseService(dbPath);
  registerIpcHandlers(database, () => mainWindow);

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
