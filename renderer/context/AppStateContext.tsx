import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppPreferences, ProgressSummary, StudySession, StudySessionPayload } from '@shared/types';

interface AppStateContextValue {
  ready: boolean;
  sessions: StudySession[];
  summary: ProgressSummary | null;
  preferences: AppPreferences | null;
  refreshAll: () => Promise<void>;
  logSession: (payload: StudySessionPayload) => Promise<void>;
  updatePreference: <T>(key: keyof AppPreferences | string, value: T) => Promise<AppPreferences>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'dark',
  notificationsEnabled: false,
  pomodoro: { focus: 25, shortBreak: 5, longBreak: 15 }
};

const PREFERENCES_STORAGE_KEY = 'focusflow:preferences:v1';

const mergePreferences = (incoming?: AppPreferences | null): AppPreferences => ({
  theme: incoming?.theme ?? DEFAULT_PREFERENCES.theme,
  notificationsEnabled: incoming?.notificationsEnabled ?? DEFAULT_PREFERENCES.notificationsEnabled,
  pomodoro: {
    focus: incoming?.pomodoro?.focus ?? DEFAULT_PREFERENCES.pomodoro.focus,
    shortBreak: incoming?.pomodoro?.shortBreak ?? DEFAULT_PREFERENCES.pomodoro.shortBreak,
    longBreak: incoming?.pomodoro?.longBreak ?? DEFAULT_PREFERENCES.pomodoro.longBreak
  }
});

const readLocalPreferences = (): AppPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as AppPreferences;
    return mergePreferences(parsed);
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const writeLocalPreferences = (prefs: AppPreferences) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota failures
  }
};

// Minimal API accessor with safe fallbacks
const useApi = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeApi = (typeof window !== 'undefined' ? (window as any).focusflow : undefined) as any | undefined;

  return useMemo(() => {
    if (runtimeApi) return runtimeApi;
    const noopEmpty = async () => [];
    const noopNull = async () => null;
    const noopVoid = async () => {};
    const noopFalse = async () => false;
    return {
      progress: {
        summary: noopNull,
        sessions: noopEmpty,
        logSession: noopVoid
      },
      preferences: {
        get: noopNull,
        update: async () => null
      },
      window: {
        minimize: noopVoid,
        maximize: noopVoid,
        close: noopVoid,
        isMaximized: noopFalse
      }
    } as any;
  }, [runtimeApi]);
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const api = useApi();
  const [ready, setReady] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);

  const loadSummary = useCallback(async () => {
    const [progress, loadedSessions] = await Promise.all([api.progress.summary(), api.progress.sessions()]);
    setSummary(progress);
    setSessions(loadedSessions);
  }, [api.progress]);

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await api.preferences.get();
      if (prefs) {
        const merged = mergePreferences(prefs);
        setPreferences(merged);
        writeLocalPreferences(merged);
        return;
      }
    } catch {
      // fall back to local
    }
    setPreferences(readLocalPreferences());
  }, [api.preferences]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadSummary(), loadPreferences()]);
    setReady(true);
  }, [loadSummary, loadPreferences]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const logSession = useCallback(
    async (payload: StudySessionPayload) => {
      await api.progress.logSession(payload);
      await loadSummary();
    },
    [api.progress, loadSummary]
  );

  const updatePreference = useCallback(
    async <T,>(key: keyof AppPreferences | string, value: T) => {
      let prefs: AppPreferences | null = null;
      try {
        prefs = await api.preferences.update({ key, value });
      } catch {
        // use local fallback
      }

      let next: AppPreferences;

      if (prefs) {
        next = mergePreferences(prefs);
      } else {
        const current = mergePreferences(preferences ?? readLocalPreferences());
        if (key === 'pomodoro' && typeof value === 'object' && value) {
          const pomodoroValue = value as Partial<AppPreferences['pomodoro']>;
          next = mergePreferences({
            ...current,
            pomodoro: { ...current.pomodoro, ...pomodoroValue }
          });
        } else {
          next = mergePreferences({
            ...current,
            [key]: value
          } as AppPreferences);
        }
      }

      setPreferences(next);
      writeLocalPreferences(next);
      return next;
    },
    [api.preferences, preferences]
  );

  const value = useMemo<AppStateContextValue>(() => ({
    ready,
    sessions,
    summary,
    preferences,
    refreshAll,
    logSession,
    updatePreference
  }), [ready, sessions, summary, preferences, refreshAll, logSession, updatePreference]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};
