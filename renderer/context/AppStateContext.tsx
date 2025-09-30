import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AppPreferences,
  Card,
  CreateCardPayload,
  CreateDeckPayload,
  CreateNotePayload,
  CreateTaskPayload,
  Deck,
  Note,
  ProgressSummary,
  StudySession,
  StudySessionPayload,
  Task,
  ToggleTaskPayload,
  UpdateCardPayload,
  UpdateNotePayload
  , ID
} from '@shared/types';

interface AppStateContextValue {
  ready: boolean;
  notes: Note[];
  tasks: Task[];
  decks: Deck[];
  cards: Record<number, Card[]>;
  sessions: StudySession[];
  summary: ProgressSummary | null;
  preferences: AppPreferences | null;
  refreshAll: () => Promise<void>;
  notesApi: {
    create: (payload: CreateNotePayload) => Promise<Note>;
    update: (payload: UpdateNotePayload) => Promise<Note>;
    remove: (id: ID) => Promise<void>;
  };
  tasksApi: {
    create: (payload: CreateTaskPayload) => Promise<Task>;
    toggle: (payload: ToggleTaskPayload) => Promise<Task>;
    remove: (id: ID) => Promise<void>;
  };
  flashcardsApi: {
    createDeck: (payload: CreateDeckPayload) => Promise<Deck>;
    removeDeck: (id: ID) => Promise<void>;
    createCard: (payload: CreateCardPayload) => Promise<Card>;
    updateCard: (payload: UpdateCardPayload) => Promise<Card>;
    removeCard: (id: ID) => Promise<void>;
    preloadCards: (deckId: ID) => Promise<Card[]>;
  };
  logSession: (payload: StudySessionPayload) => Promise<void>;
  updatePreference: <T>(key: keyof AppPreferences | string, value: T) => Promise<AppPreferences>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

// Hook that returns the native API when available, otherwise a safe fallback
const useApi = () => {
  // read the runtime global
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeApi = (typeof window !== 'undefined' ? (window as any).ypt : undefined) as any | undefined;

  return useMemo(() => {
    if (runtimeApi) return runtimeApi;

    // fallback implementations return safe defaults so the renderer can run without the preload
    const noopEmpty = async () => [];
    const noopNull = async () => null;
    const noopVoid = async () => {};
    const noopFalse = async () => false;
    const createDummy = async (payload: any) => ({ id: Date.now(), ...payload } as any);

    return {
      notes: {
        list: noopEmpty,
        create: createDummy,
        update: createDummy,
        remove: noopVoid
      },
      tasks: {
        list: noopEmpty,
        create: createDummy,
        toggle: createDummy,
        remove: noopVoid
      },
      flashcards: {
        listDecks: noopEmpty,
        createDeck: createDummy,
        removeDeck: noopVoid,
        listCards: noopEmpty,
        createCard: createDummy,
        updateCard: createDummy,
        removeCard: noopVoid
      },
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Record<string, Card[]>>({});
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);

  const loadNotes = useCallback(async () => {
    const data = await api.notes.list();
    setNotes(data);
  }, [api.notes]);

  const loadTasks = useCallback(async () => {
    const data = await api.tasks.list();
    setTasks(data);
  }, [api.tasks]);

  const loadDecks = useCallback(async () => {
    const data = await api.flashcards.listDecks();
    setDecks(data);
  }, [api.flashcards]);

  const loadSummary = useCallback(async () => {
    const [progress, loadedSessions] = await Promise.all([
      api.progress.summary(),
      api.progress.sessions()
    ]);
    setSummary(progress);
    setSessions(loadedSessions);
  }, [api.progress]);

  const loadPreferences = useCallback(async () => {
    const prefs = await api.preferences.get();
    setPreferences(prefs);
  }, [api.preferences]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadNotes(), loadTasks(), loadDecks(), loadSummary(), loadPreferences()]);
    setReady(true);
  }, [loadNotes, loadTasks, loadDecks, loadSummary, loadPreferences]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const notesApi = useMemo(() => ({
    create: async (payload: CreateNotePayload) => {
      const note = await api.notes.create(payload);
      setNotes((prev: Note[]) => [note, ...prev]);
      return note;
    },
    update: async (payload: UpdateNotePayload) => {
      const note = await api.notes.update(payload);
      setNotes((prev: Note[]) => prev.map((item: Note) => (item.id === note.id ? note : item)));
      return note;
    },
    remove: async (id: ID) => {
      await api.notes.remove(id);
      setNotes((prev: Note[]) => prev.filter((item: Note) => item.id !== id));
    }
  }), [api.notes]);

  const tasksApi = useMemo(() => ({
    create: async (payload: CreateTaskPayload) => {
      const task = await api.tasks.create(payload);
      setTasks((prev: Task[]) => [task, ...prev]);
      void loadSummary();
      return task;
    },
    toggle: async (payload: ToggleTaskPayload) => {
      const task = await api.tasks.toggle(payload);
      setTasks((prev: Task[]) => prev.map((item: Task) => (item.id === task.id ? task : item)));
      void loadSummary();
      return task;
    },
    remove: async (id: ID) => {
      await api.tasks.remove(id);
      setTasks((prev: Task[]) => prev.filter((item: Task) => item.id !== id));
      void loadSummary();
    }
  }), [api.tasks, loadSummary]);

  const flashcardsApi = useMemo(() => ({
    createDeck: async (payload: CreateDeckPayload) => {
      const deck = await api.flashcards.createDeck(payload);
      setDecks((prev: Deck[]) => [deck, ...prev]);
      void loadSummary();
      return deck;
    },
    removeDeck: async (id: ID) => {
      await api.flashcards.removeDeck(id);
      setDecks((prev: Deck[]) => prev.filter((deck) => deck.id !== id));
      setCards((prev: Record<string, Card[]>) => {
        const next: Record<string, Card[]> = { ...prev };
        delete next[String(id)];
        return next;
      });
      void loadSummary();
    },
    createCard: async (payload: CreateCardPayload) => {
      const card = await api.flashcards.createCard(payload);
      const key = String(payload.deckId);
      setCards((prev: Record<string, Card[]>) => ({
        ...prev,
        [key]: [card, ...(prev[key] ?? [])]
      }));
      void loadSummary();
      return card;
    },
    updateCard: async (payload: UpdateCardPayload) => {
      const card = await api.flashcards.updateCard(payload);
      const key = String(card.deckId);
      setCards((prev: Record<string, Card[]>) => ({
        ...prev,
        [key]: (prev[key] ?? []).map((item: Card) => (item.id === card.id ? card : item))
      }));
      return card;
    },
    removeCard: async (id: ID) => {
      await api.flashcards.removeCard(id);
      setCards((prev: Record<string, Card[]>) => {
        const next: Record<string, Card[]> = {};
        Object.entries(prev).forEach(([deckId, items]) => {
          next[deckId] = items.filter((card: Card) => card.id !== id);
        });
        return next;
      });
      void loadSummary();
    },
    preloadCards: async (deckId: ID) => {
      const key = String(deckId);
      if (cards[key]) {
        return cards[key];
      }
      const result = await api.flashcards.listCards(deckId);
      setCards((prev: Record<string, Card[]>) => ({ ...prev, [key]: result }));
      return result;
    }
  }), [api.flashcards, cards, loadSummary]);

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

  const value = useMemo<AppStateContextValue>(
    () => ({
      ready,
      notes,
      tasks,
      decks,
      cards,
      sessions,
      summary,
      preferences,
      refreshAll,
      notesApi,
      tasksApi,
      flashcardsApi,
      logSession,
      updatePreference
    }),
    [
      ready,
      notes,
      tasks,
      decks,
      cards,
      sessions,
      summary,
      preferences,
      refreshAll,
      notesApi,
      tasksApi,
      flashcardsApi,
      logSession,
      updatePreference
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
