import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Stack } from '@mui/material';
import TitleBar from './components/TitleBar';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import MorePage from './pages/MorePage';
import SettingsPage from './pages/SettingsPage';
import { useAppState } from './context/AppStateContext';

const routes = [
  { path: '/home', label: 'Home' },
  { path: '/stats', label: 'Stats' },
  { path: '/more', label: 'More' }
] as const;

const App = () => {
  const { ready } = useAppState();
  const location = useLocation();

  const activeRoute = useMemo(() => {
    const match = routes.find((route) => location.pathname.startsWith(route.path));
    if (match) return match.path;
    if (location.pathname.startsWith('/settings')) return '/more';
    return '/home';
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Box>
      <BottomNav activePath={activeRoute} routes={routes} />
    </Stack>
  );
};

export default App;
