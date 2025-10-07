import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import SportsEsportsIcon from '@mui/icons-material/SportsEsportsOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsOutlined';
import BarChartIcon from '@mui/icons-material/BarChartOutlined';

interface BottomNavProps {
  activePath: string;
  routes: ReadonlyArray<{ path: string; label: string }>;
}

const iconMap: Record<string, React.ReactNode> = {
  '/home': <HomeIcon fontSize="small" />,
  '/quests': <SportsEsportsIcon fontSize="small" />,
  '/achievements': <EmojiEventsIcon fontSize="small" />,
  '/analytics': <BarChartIcon fontSize="small" />,
  '/stats': <InsightsIcon fontSize="small" />,
  '/profile': <AccountCircleIcon fontSize="small" />
};

const BottomNav: React.FC<BottomNavProps> = ({ activePath, routes }) => {
  const navigate = useNavigate();

  const value = useMemo(() => routes.findIndex((r) => activePath === r.path), [activePath, routes]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        px: { xs: 0, md: 0 }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: 0,
          backdropFilter: 'blur(18px)',
          background: (theme) =>
            `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(theme.palette.background.paper, 0.85)})`,
          borderTop: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          borderBottom: 'none',
          boxShadow: 'none'
        }}
      >
        <BottomNavigation
          showLabels
          value={value === -1 ? 0 : value}
          onChange={(_, newValue) => navigate(routes[newValue]?.path ?? routes[0].path)}
          sx={{
            background: 'transparent',
            borderRadius: 0,
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(255,255,255,0.72)',
              minWidth: 96,
              py: 1.25,
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'common.white'
              }
            },
            '& .MuiSvgIcon-root': {
              fontSize: 22
            }
          }}
        >
          {routes.map((r) => (
            <BottomNavigationAction key={r.path} label={r.label} icon={iconMap[r.path] ?? undefined} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav;
