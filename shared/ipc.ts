export const IPC_CHANNELS = {
  NOTES_LIST: 'focusflow:notes:list',
  NOTES_CREATE: 'focusflow:notes:create',
  NOTES_UPDATE: 'focusflow:notes:update',
  NOTES_DELETE: 'focusflow:notes:delete',
  TASKS_LIST: 'focusflow:tasks:list',
  TASKS_CREATE: 'focusflow:tasks:create',
  TASKS_TOGGLE: 'focusflow:tasks:toggle',
  TASKS_DELETE: 'focusflow:tasks:delete',
  DECKS_LIST: 'focusflow:decks:list',
  DECKS_CREATE: 'focusflow:decks:create',
  DECKS_DELETE: 'focusflow:decks:delete',
  CARDS_LIST: 'focusflow:cards:list',
  CARDS_CREATE: 'focusflow:cards:create',
  CARDS_UPDATE: 'focusflow:cards:update',
  CARDS_DELETE: 'focusflow:cards:delete',
  PROGRESS_SUMMARY: 'focusflow:progress:summary',
  PROGRESS_SESSIONS: 'focusflow:progress:sessions',
  PROGRESS_LOG: 'focusflow:progress:log',
  PREFERENCES_GET: 'focusflow:prefs:get',
  PREFERENCES_UPDATE: 'focusflow:prefs:update',
  WINDOW_MINIMIZE: 'focusflow:window:minimize',
  WINDOW_MAXIMIZE: 'focusflow:window:maximize',
  WINDOW_CLOSE: 'focusflow:window:close',
  WINDOW_IS_MAXIMIZED: 'focusflow:window:is-maximized'
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
