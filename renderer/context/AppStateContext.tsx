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

// Minimal API accessor with safe fallbacks
const useApi = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeApi = (typeof window !== 'undefined' ? (window as any).ypt : undefined) as any | undefined;

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
    const prefs = await api.preferences.get();
    setPreferences(prefs);
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
      const prefs = await api.preferences.update({ key, value });
      setPreferences(prefs);
      return prefs;
    },
    [api.preferences]
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
