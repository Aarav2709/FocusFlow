import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import Layout from '@components/Layout';
import PageTransition from '@components/PageTransition';
import NotesPage from '@pages/NotesPage';
import TasksPage from '@pages/TasksPage';
import FlashcardsPage from '@pages/FlashcardsPage';
import TimerPage from '@pages/TimerPage';
import ProgressPage from '@pages/ProgressPage';
import SettingsPage from '@pages/SettingsPage';
import { useAppStore } from '@state/store';
import type { PageKey } from '@state/types';

const routeKeys: PageKey[] = ['notes', 'tasks', 'flashcards', 'timer', 'progress', 'settings'];

const getPageFromPath = (pathname: string): PageKey => {
  const key = pathname.replace('/', '') as PageKey;
  return routeKeys.includes(key) ? key : 'notes';
};

const App = () => {
  const location = useLocation();
  const ready = useAppStore((state) => state.ready);
  const initialise = useAppStore((state) => state.initialise);
  const setActivePage = useAppStore((state) => state.setActivePage);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  useEffect(() => {
    const key = getPageFromPath(location.pathname);
    setActivePage(key);
  }, [location.pathname, setActivePage]);

  if (!ready) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="brand.400" />
      </Center>
    );
  }

  return (
    <Layout>
      <PageTransition routeKey={location.pathname}>
        <Routes location={location}>
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
      </PageTransition>
    </Layout>
  );
};

export default App;
