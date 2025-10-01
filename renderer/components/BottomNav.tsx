import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import TimerIcon from '@mui/icons-material/TimerOutlined';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';

interface BottomNavProps {
  activePath: string;
  routes: ReadonlyArray<{ path: string; label: string }>;
}

const iconMap: Record<string, React.ReactNode> = {
  '/timer': <TimerIcon fontSize="small" />,
  '/insights': <InsightsIcon fontSize="small" />,
  '/settings': <SettingsIcon fontSize="small" />
};

const BottomNav: React.FC<BottomNavProps> = ({ activePath, routes }) => {
  const navigate = useNavigate();

  const value = useMemo(() => routes.findIndex((r) => activePath === r.path), [activePath, routes]);

  return (
    <Paper elevation={6} sx={{ position: 'sticky', bottom: 0, left: 0, right: 0 }} square>
      <BottomNavigation
        showLabels
        value={value === -1 ? 0 : value}
        onChange={(_, newValue) => navigate(routes[newValue]?.path ?? routes[0].path)}
        sx={{ bgcolor: 'background.paper' }}
      >
        {routes.map((r) => (
          <BottomNavigationAction
            key={r.path}
            label={r.label}
            icon={iconMap[r.path] ?? undefined}
            sx={{ borderRadius: 0, minWidth: 84, py: 1.25 }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
