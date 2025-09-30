import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseService } from './database.js';
import { registerIpcHandlers } from './ipc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let database: DatabaseService | null = null;

const isDev = !app.isPackaged;

async function createWindow() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const browserWindow = new BrowserWindow({
    width: 420,
    height: 780,
    minWidth: 360,
    minHeight: 640,
    show: false,
    backgroundColor: '#111217',
    title: 'Yeolpumta',
    icon: nativeImage.createFromPath(iconPath),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
    if (isDev) {
      browserWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  if (isDev) {
    await browserWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    await browserWindow.loadFile(indexPath);
  }

  mainWindow = browserWindow;
}

function initialiseDatabase() {
  if (database) {
    return database;
  }
  const storageDir = path.join(app.getPath('userData'), 'storage');
  const dbPath = path.join(storageDir, 'yeolpumta.db');
  database = new DatabaseService(dbPath);
  registerIpcHandlers(database);
  return database;
}

app.on('ready', async () => {
  initialiseDatabase();
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
