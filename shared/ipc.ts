export const IPC_CHANNELS = {
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

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
