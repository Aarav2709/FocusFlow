import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Stack } from '@mui/material';
import TitleBar from './components/TitleBar';
import BottomNav from './components/BottomNav';
import OnboardingScreen from './components/OnboardingScreen';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import QuestsPage from '@renderer/pages/QuestsPage';
import AchievementsPage from './pages/AchievementsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useAppState } from './context/AppStateContext';
import { useProfile } from './context/ProfileContext';

const routes = [
  { path: '/home', label: 'Home' },
  { path: '/quests', label: 'Quests' },
  { path: '/achievements', label: 'Achievements' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/stats', label: 'Stats' },
  { path: '/profile', label: 'Profile' }
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
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 10% 20%, rgba(122,108,255,0.18) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(67,255,210,0.18) 0%, transparent 45%), radial-gradient(circle at 50% 85%, rgba(255,140,201,0.18) 0%, transparent 55%)'
        }}
      />
      <Stack direction="column" sx={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TitleBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 6 },
            pt: { xs: 8, md: 10 },
            pb: { xs: 12, md: 14 },
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 1240 }}>
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/quests" element={<QuestsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Box>
        </Box>
        <BottomNav activePath={activeRoute} routes={routes} />
      </Stack>
    </Box>
  );
};

export default App;
