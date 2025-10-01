import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type SubjectTodo = {
  id: string;
  text: string;
  completed: boolean;
};

export type StudySubject = {
  id: string;
  name: string;
  color: string;
  totalSeconds: number;
  todos: SubjectTodo[];
  createdAt: string;
};

type HistoryEntry = {
  focusSeconds: number;
  breakSeconds: number;
  perSubject: Record<string, number>;
};

type StudyStorage = {
  subjects: StudySubject[];
  breakSeconds: number;
  history: Record<string, HistoryEntry>;
};

type TimerMode = { type: 'subject'; subjectId: string } | { type: 'break' } | null;

const STORAGE_KEY = 'ypt:study-state:v1';
const DEFAULT_SUBJECTS: StudySubject[] = [
  { id: 'maths', name: 'Maths', color: '#ff6b6b', totalSeconds: 0, todos: [], createdAt: new Date().toISOString() },
  { id: 'science', name: 'Science', color: '#4dabf7', totalSeconds: 0, todos: [], createdAt: new Date().toISOString() }
];

const DEFAULT_STATE: StudyStorage = {
  subjects: DEFAULT_SUBJECTS,
  breakSeconds: 0,
  history: {}
};

const SUBJECT_COLORS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#63e6be', '#b197fc', '#ffa94d', '#ff8787', '#74c0fc'];

const loadState = (): StudyStorage => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as StudyStorage;
    if (!parsed.subjects || !Array.isArray(parsed.subjects)) return DEFAULT_STATE;
    return {
      subjects: parsed.subjects.map((subject) => ({
        ...subject,
        todos: subject.todos ?? []
      })),
      breakSeconds: parsed.breakSeconds ?? 0,
      history: parsed.history ?? {}
    };
  } catch (err) {
    console.warn('[StudyContext] Failed to load study state', err);
    return DEFAULT_STATE;
  }
};

const persistState = (state: StudyStorage) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[StudyContext] Failed to persist study state', err);
  }
};

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const randomId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const pickColor = (used: string[]) => {
  const palette = SUBJECT_COLORS.filter((color) => !used.includes(color));
  if (palette.length) return palette[Math.floor(Math.random() * palette.length)];
  return SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
};

export interface StudyContextValue {
  subjects: StudySubject[];
  breakSeconds: number;
  history: Record<string, HistoryEntry>;
  totalFocusSeconds: number;
  activeSubjectId: string | null;
  isBreakActive: boolean;
  isRunning: boolean;
  startSubject: (subjectId: string) => void;
  pauseTimer: () => void;
  toggleSubject: (subjectId: string) => void;
  startBreak: () => void;
  resetSubject: (subjectId: string) => void;
  resetAll: () => void;
  addSubject: (name: string, color?: string) => void;
  updateSubject: (subjectId: string, updates: Partial<Pick<StudySubject, 'name' | 'color'>>) => void;
  removeSubject: (subjectId: string) => void;
  addTodo: (subjectId: string, text: string) => void;
  toggleTodo: (subjectId: string, todoId: string) => void;
  removeTodo: (subjectId: string, todoId: string) => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StudyStorage>(() => loadState());
  const [mode, setMode] = useState<TimerMode>(null);
  const lastTickRef = useRef<number>(Date.now());

  const persist = useCallback((next: StudyStorage) => {
    persistState(next);
  }, []);

  useEffect(() => {
    persist(state);
  }, [state, persist]);

  useEffect(() => {
    if (!mode) return undefined;
    lastTickRef.current = Date.now();
    const step = () => {
      const now = Date.now();
      const diffSeconds = Math.max(1, Math.floor((now - lastTickRef.current) / 1000));
      lastTickRef.current = now;

      setState((prev) => {
        if (!mode) return prev;
        const next: StudyStorage = {
          subjects: prev.subjects.map((subject) => ({ ...subject, todos: subject.todos.map((todo) => ({ ...todo })) })),
          breakSeconds: prev.breakSeconds,
          history: Object.entries(prev.history).reduce<Record<string, HistoryEntry>>((acc, [key, value]) => {
            acc[key] = {
              focusSeconds: value.focusSeconds,
              breakSeconds: value.breakSeconds,
              perSubject: { ...value.perSubject }
            };
            return acc;
          }, {})
        };
        const todayKey = getTodayKey();
        if (!next.history[todayKey]) {
          next.history[todayKey] = { focusSeconds: 0, breakSeconds: 0, perSubject: {} };
        }

        if (mode.type === 'subject') {
          const subjectIndex = next.subjects.findIndex((s) => s.id === mode.subjectId);
          if (subjectIndex === -1) {
            return prev;
          }
          next.subjects[subjectIndex].totalSeconds += diffSeconds;
          next.history[todayKey].focusSeconds += diffSeconds;
          next.history[todayKey].perSubject[mode.subjectId] =
            (next.history[todayKey].perSubject[mode.subjectId] ?? 0) + diffSeconds;
        } else {
          next.breakSeconds += diffSeconds;
          next.history[todayKey].breakSeconds += diffSeconds;
        }

        return next;
      });
    };

    const interval = window.setInterval(step, 1000);
    return () => window.clearInterval(interval);
  }, [mode]);

  const totalFocusSeconds = useMemo(
    () => state.subjects.reduce((acc, subject) => acc + subject.totalSeconds, 0),
    [state.subjects]
  );

  const startSubject = useCallback((subjectId: string) => {
    setMode({ type: 'subject', subjectId });
  }, []);

  const startBreak = useCallback(() => {
    setMode((current) => (current?.type === 'break' ? null : { type: 'break' }));
  }, []);

  const pauseTimer = useCallback(() => {
    setMode((current) => {
      if (current?.type === 'break') return null;
      return { type: 'break' };
    });
  }, []);

  const toggleSubject = useCallback(
    (subjectId: string) => {
      setMode((current) => {
        if (current?.type === 'subject' && current.subjectId === subjectId) {
          return null;
        }
        return { type: 'subject', subjectId };
      });
    },
    []
  );

  const resetSubject = useCallback((subjectId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, totalSeconds: 0 } : subject
      )
    }));
    setMode((current) => (current?.type === 'subject' && current.subjectId === subjectId ? null : current));
  }, []);

  const resetAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) => ({ ...subject, totalSeconds: 0 })),
      breakSeconds: 0
    }));
    setMode(null);
  }, []);

  const addSubject = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => {
      const usedColors = prev.subjects.map((subject) => subject.color);
      const subject: StudySubject = {
        id: randomId(),
        name: trimmed,
        color: color?.trim() || pickColor(usedColors),
        totalSeconds: 0,
        todos: [],
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        subjects: [subject, ...prev.subjects]
      };
    });
  }, []);

  const updateSubject = useCallback((subjectId: string, updates: Partial<Pick<StudySubject, 'name' | 'color'>>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              ...updates,
              color: updates.color ? (updates.color.startsWith('#') ? updates.color : `#${updates.color}`) : subject.color
            }
          : subject
      )
    }));
  }, []);

  const removeSubject = useCallback((subjectId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((subject) => subject.id !== subjectId)
    }));
    setMode((current) => (current?.type === 'subject' && current.subjectId === subjectId ? null : current));
  }, []);

  const addTodo = useCallback((subjectId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              todos: [{ id: randomId(), text: trimmed, completed: false }, ...subject.todos]
            }
          : subject
      )
    }));
  }, []);

  const toggleTodo = useCallback((subjectId: string, todoId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              todos: subject.todos.map((todo) =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
              )
            }
          : subject
      )
    }));
  }, []);

  const removeTodo = useCallback((subjectId: string, todoId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === subjectId
          ? { ...subject, todos: subject.todos.filter((todo) => todo.id !== todoId) }
          : subject
      )
    }));
  }, []);

  const value = useMemo<StudyContextValue>(() => ({
    subjects: state.subjects,
    breakSeconds: state.breakSeconds,
    history: state.history,
    totalFocusSeconds,
    activeSubjectId: mode?.type === 'subject' ? mode.subjectId : null,
  isBreakActive: mode?.type === 'break',
    isRunning: mode !== null,
    startSubject,
    pauseTimer,
    toggleSubject,
    startBreak,
    resetSubject,
    resetAll,
    addSubject,
    updateSubject,
    removeSubject,
    addTodo,
    toggleTodo,
    removeTodo
  }), [state, totalFocusSeconds, mode, startSubject, pauseTimer, toggleSubject, startBreak, resetSubject, resetAll, addSubject, updateSubject, removeSubject, addTodo, toggleTodo, removeTodo]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
};
