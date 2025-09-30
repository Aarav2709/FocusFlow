import { contextBridge, ipcRenderer } from 'electron';

const api = {
  notes: {
    getAll: () => ipcRenderer.invoke('notes:getAll'),
    create: (payload: { title: string; category?: string; content?: string }) => ipcRenderer.invoke('notes:create', payload),
    update: (payload: unknown) => ipcRenderer.invoke('notes:update', payload),
    delete: (id: number) => ipcRenderer.invoke('notes:delete', id)
  },
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    create: (payload: { title: string; dueDate?: string | null }) => ipcRenderer.invoke('tasks:create', payload),
    toggle: (payload: { id: number; completed: boolean }) => ipcRenderer.invoke('tasks:toggle', payload),
    delete: (id: number) => ipcRenderer.invoke('tasks:delete', id)
  },
  decks: {
    getAll: () => ipcRenderer.invoke('decks:getAll'),
    create: (payload: { name: string; description?: string | null }) => ipcRenderer.invoke('decks:create', payload),
    delete: (id: number) => ipcRenderer.invoke('decks:delete', id)
  },
  cards: {
    getByDeck: (deckId: number) => ipcRenderer.invoke('cards:getByDeck', deckId),
    create: (payload: { deckId: number; front: string; back: string }) => ipcRenderer.invoke('cards:create', payload),
    update: (payload: unknown) => ipcRenderer.invoke('cards:update', payload),
    delete: (id: number) => ipcRenderer.invoke('cards:delete', id)
  },
  progress: {
    getSummary: () => ipcRenderer.invoke('progress:getSummary'),
    getSessions: (limit?: number) => ipcRenderer.invoke('progress:getSessions', limit),
    logSession: (payload: { durationMinutes: number; mode: string }) => ipcRenderer.invoke('progress:logSession', payload)
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    update: (payload: { key: string; value: unknown }) => ipcRenderer.invoke('settings:update', payload)
  }
} as const;

contextBridge.exposeInMainWorld('ypt', api);

export type ElectronApi = typeof api;
