import { BrowserWindow } from 'electron';
import type { DatabaseService } from './database';
export declare const registerIpcHandlers: (db: DatabaseService, getWindow: () => BrowserWindow | null) => void;
