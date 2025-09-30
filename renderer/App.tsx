import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Stack } from '@mui/material';
import TitleBar from './components/TitleBar';
import BottomNav from './components/BottomNav';
import TimerView from './views/TimerView';
import SettingsView from './views/SettingsView';
import { useAppState } from './context/AppStateContext';

const routes = [
  { path: '/timer', label: 'Time' },
  { path: '/settings', label: 'Settings' }
] as const;

const App = () => {
  const { ready } = useAppState();
  const location = useLocation();

  const activeRoute = useMemo(() => {
    const match = routes.find((route) => location.pathname.startsWith(route.path));
    return match?.path ?? '/timer';
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
      <Box component="main" sx={{ flex: 1, p: 4, overflow: 'auto' }}>
        <Routes>
          <Route path="/timer" element={<TimerView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/timer" replace />} />
        </Routes>
      </Box>
      <BottomNav activePath={activeRoute} routes={routes} />
    </Stack>
  );
};

export default App;
