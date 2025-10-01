import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Stack } from '@mui/material';
import TitleBar from './components/TitleBar';
import BottomNav from './components/BottomNav';
import OnboardingScreen from './components/OnboardingScreen';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import { useAppState } from './context/AppStateContext';
import { useProfile } from './context/ProfileContext';

const routes = [
  { path: '/home', label: 'Home' },
  { path: '/stats', label: 'Stats' },
  { path: '/settings', label: 'Settings' }
] as const;

const App = () => {
  const { ready } = useAppState();
  const location = useLocation();
  const { profile } = useProfile();

  const activeRoute = useMemo(() => {
    const match = routes.find((route) => location.pathname.startsWith(route.path));
    return match?.path ?? '/home';
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

  if (!profile?.nickname || !profile?.country) {
    return <OnboardingScreen />;
  }

  return (
    <Stack direction="column" sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TitleBar />
      <Box component="main" sx={{ flex: 1, px: 4, pt: 2, pb: 4, overflow: 'auto' }}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Box>
      <BottomNav activePath={activeRoute} routes={routes} />
    </Stack>
  );
};

export default App;
