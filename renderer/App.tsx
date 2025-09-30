import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Stack } from '@mui/material';
import TitleBar from './components/TitleBar';
import NavigationRail from './components/NavigationRail';
import NotesView from './views/NotesView';
import TasksView from './views/TasksView';
import FlashcardsView from './views/FlashcardsView';
import TimerView from './views/TimerView';
import ProgressView from './views/ProgressView';
import SettingsView from './views/SettingsView';
import { useAppState } from './context/AppStateContext';

const routes = [
  { path: '/notes', label: 'Notes' },
  { path: '/tasks', label: 'Tasks' },
  { path: '/flashcards', label: 'Flashcards' },
  { path: '/timer', label: 'Timer' },
  { path: '/progress', label: 'Progress' },
  { path: '/settings', label: 'Settings' }
] as const;

const App = () => {
  const { ready } = useAppState();
  const location = useLocation();

  const activeRoute = useMemo(() => {
    const match = routes.find((route) => location.pathname.startsWith(route.path));
    return match?.path ?? '/notes';
  }, [location.pathname]);

  if (!ready) {
    return (
      <Stack
        sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}
      >
        <CircularProgress color="primary" size={48} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TitleBar />
      <Stack direction="row" sx={{ flex: 1 }}>
        <NavigationRail activePath={activeRoute} routes={routes} />
        <Box component="main" sx={{ flex: 1, p: 4, overflow: 'auto' }}>
          <Routes>
            <Route path="/notes" element={<NotesView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/flashcards" element={<FlashcardsView />} />
            <Route path="/timer" element={<TimerView />} />
            <Route path="/progress" element={<ProgressView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/notes" replace />} />
          </Routes>
        </Box>
      </Stack>
    </Stack>
  );
};

export default App;
