import type { ElectronApi } from '../../electron/preload';

declare global {
  interface Window {
    ypt?: ElectronApi;
  }
}

export {};
