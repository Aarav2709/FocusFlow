import { create } from 'zustand';
import type { SetState, GetState } from 'zustand';
import { flashcardsApi, notesApi, progressApi, settingsApi, tasksApi } from './api';
import type {
  AppSettings,
  Card,
  Deck,
  Note,
  PageKey,
  ProgressSummary,
  StudySession,
  Task
} from './types';

interface BaseState {
  ready: boolean;
  activePage: PageKey;
  notes: Note[];
  tasks: Task[];
  decks: Deck[];
  cardsByDeck: Record<number, Card[]>;
  progress: ProgressSummary | null;
  studySessions: StudySession[];
  settings: AppSettings | null;
  loading: boolean;
}

interface Actions {
  setActivePage: (page: PageKey) => void;
  initialise: () => Promise<void>;
  reloadNotes: () => Promise<void>;
  createNote: (payload: { title: string; category?: string; content?: string }) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  reloadTasks: () => Promise<void>;
  createTask: (payload: { title: string; dueDate?: string | null }) => Promise<void>;
  toggleTask: (id: number, completed: boolean) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  reloadDecks: () => Promise<void>;
  createDeck: (payload: { name: string; description?: string | null }) => Promise<Deck | null>;
  deleteDeck: (id: number) => Promise<void>;
  loadCards: (deckId: number) => Promise<Card[]>;
  createCard: (payload: { deckId: number; front: string; back: string }) => Promise<Card | null>;
  updateCard: (card: Card) => Promise<Card | null>;
  deleteCard: (id: number, deckId: number) => Promise<void>;
  logStudySession: (payload: { durationMinutes: number; mode: string }) => Promise<void>;
  reloadProgress: () => Promise<void>;
  updateSetting: <T>(key: keyof AppSettings | string, value: T) => Promise<void>;
}

export type AppStore = BaseState & Actions;

const defaultSettings: AppSettings = {
  theme: 'dark',
  pomodoro: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15
  }
};

const storeCreator = (set: SetState<AppStore>, get: GetState<AppStore>): AppStore => ({
  ready: false,
  activePage: 'notes',
  notes: [],
  tasks: [],
  decks: [],
  cardsByDeck: {},
  progress: null,
  studySessions: [],
  settings: null,
  loading: false,
  setActivePage: (page: PageKey) => set({ activePage: page }),
  initialise: async () => {
    set({ loading: true });
    await Promise.all([
      get().reloadNotes(),
      get().reloadTasks(),
      get().reloadDecks(),
      get().reloadProgress(),
      (async () => {
        try {
          const loadedSettings = await settingsApi.getAll();
          set({ settings: loadedSettings });
        } catch (error) {
          console.error('Failed to load settings', error);
        }
      })()
    ]);
    set({ ready: true, loading: false });
  },
  reloadNotes: async () => {
    try {
      const notes = await notesApi.getAll();
      set({ notes });
    } catch (error) {
      console.error('Failed to load notes', error);
    }
  },
  createNote: async (payload: { title: string; category?: string; content?: string }) => {
    try {
      const created = await notesApi.create(payload);
  set((state: AppStore) => ({ notes: [created, ...state.notes] }));
    } catch (error) {
      console.error('Failed to create note', error);
    }
  },
  updateNote: async (note: Note) => {
    try {
      const updated = await notesApi.update(note);
      set((state: AppStore) => ({
        notes: state.notes.map((n: Note) => (n.id === updated.id ? updated : n))
      }));
    } catch (error) {
      console.error('Failed to update note', error);
    }
  },
  deleteNote: async (id: number) => {
    try {
      await notesApi.delete(id);
  set((state: AppStore) => ({ notes: state.notes.filter((n: Note) => n.id !== id) }));
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  },
  reloadTasks: async () => {
    try {
      const tasks = await tasksApi.getAll();
      set({ tasks: tasks.map((task) => ({ ...task, completed: !!task.completed })) });
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  },
  createTask: async (payload: { title: string; dueDate?: string | null }) => {
    try {
      const created = await tasksApi.create(payload);
  set((state: AppStore) => ({ tasks: [created, ...state.tasks] }));
    } catch (error) {
      console.error('Failed to create task', error);
    }
  },
  toggleTask: async (id: number, completed: boolean) => {
    try {
      await tasksApi.toggle({ id, completed });
      set((state: AppStore) => ({
        tasks: state.tasks.map((task: Task) => (task.id === id ? { ...task, completed } : task))
      }));
    } catch (error) {
      console.error('Failed to toggle task', error);
    }
  },
  deleteTask: async (id: number) => {
    try {
      await tasksApi.delete(id);
  set((state: AppStore) => ({ tasks: state.tasks.filter((task: Task) => task.id !== id) }));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  },
  reloadDecks: async () => {
    try {
      const decks = await flashcardsApi.getAllDecks();
      set({ decks });
    } catch (error) {
      console.error('Failed to load decks', error);
    }
  },
  createDeck: async (payload: { name: string; description?: string | null }) => {
    try {
      const deck = await flashcardsApi.createDeck(payload);
  set((state: AppStore) => ({ decks: [deck, ...state.decks] }));
      return deck;
    } catch (error) {
      console.error('Failed to create deck', error);
      return null;
    }
  },
  deleteDeck: async (id: number) => {
    try {
      await flashcardsApi.deleteDeck(id);
  set((state: AppStore) => {
        const nextCards = { ...state.cardsByDeck };
        delete nextCards[id];
        return {
          decks: state.decks.filter((deck) => deck.id !== id),
          cardsByDeck: nextCards
        };
      });
    } catch (error) {
      console.error('Failed to delete deck', error);
    }
  },
  loadCards: async (deckId: number) => {
    try {
      const cards = await flashcardsApi.getCards(deckId);
  set((state: AppStore) => ({ cardsByDeck: { ...state.cardsByDeck, [deckId]: cards } }));
      return cards;
    } catch (error) {
      console.error('Failed to load cards', error);
      return [];
    }
  },
  createCard: async (payload: { deckId: number; front: string; back: string }) => {
    try {
      const card = await flashcardsApi.createCard(payload);
  set((state: AppStore) => {
        const current = state.cardsByDeck[payload.deckId] ?? [];
        return {
          cardsByDeck: {
            ...state.cardsByDeck,
            [payload.deckId]: [card, ...current]
          }
        };
      });
      return card;
    } catch (error) {
      console.error('Failed to create card', error);
      return null;
    }
  },
  updateCard: async (card: Card) => {
    try {
      const updated = await flashcardsApi.updateCard(card);
  set((state: AppStore) => {
        const list = state.cardsByDeck[card.deckId] ?? [];
        return {
          cardsByDeck: {
            ...state.cardsByDeck,
            [card.deckId]: list.map((entry) => (entry.id === updated.id ? updated : entry))
          }
        };
      });
      return updated;
    } catch (error) {
      console.error('Failed to update card', error);
      return null;
    }
  },
  deleteCard: async (id: number, deckId: number) => {
    try {
      await flashcardsApi.deleteCard(id);
  set((state: AppStore) => {
        const list = state.cardsByDeck[deckId] ?? [];
        return {
          cardsByDeck: {
            ...state.cardsByDeck,
            [deckId]: list.filter((card) => card.id !== id)
          }
        };
      });
    } catch (error) {
      console.error('Failed to delete card', error);
    }
  },
  logStudySession: async (payload) => {
    try {
      await progressApi.logSession(payload);
      await get().reloadProgress();
    } catch (error) {
      console.error('Failed to log session', error);
    }
  },
  reloadProgress: async () => {
    try {
      const [summary, sessions] = await Promise.all([
        progressApi.getSummary(),
        progressApi.getSessions(20)
      ]);
      set({ progress: summary, studySessions: sessions });
    } catch (error) {
      console.error('Failed to load progress', error);
    }
  },
  updateSetting: async (key, value) => {
    try {
      await settingsApi.update({ key, value });
      set((state) => {
        const current = state.settings ?? defaultSettings;
        const next = { ...current, [key]: value } as AppSettings;
        return { settings: next };
      });
    } catch (error) {
      console.error('Failed to update setting', error);
    }
  }
});

export const useAppStore = create<AppStore>()(storeCreator);
