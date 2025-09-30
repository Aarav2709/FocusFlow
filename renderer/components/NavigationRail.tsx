import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import NoteIcon from '@mui/icons-material/ArticleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import FlashcardIcon from '@mui/icons-material/StyleOutlined';
import TimerIcon from '@mui/icons-material/TimerOutlined';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';

interface NavigationRailProps {
  activePath: string;
  routes: ReadonlyArray<{ path: string; label: string }>;
}

type NavigationItem = { path: string; label: string; icon: ReactNode };

const iconMap: Record<string, ReactNode> = {
  '/notes': <NoteIcon fontSize="small" />,
  '/tasks': <CheckCircleIcon fontSize="small" />,
  '/flashcards': <FlashcardIcon fontSize="small" />,
  '/timer': <TimerIcon fontSize="small" />,
  '/progress': <InsightsIcon fontSize="small" />,
  '/settings': <SettingsIcon fontSize="small" />
};

const NavigationRail = ({ activePath, routes }: NavigationRailProps) => {
  const navigate = useNavigate();

  const items = useMemo<NavigationItem[]>(
    () =>
      routes.map((route) => ({
        ...route,
        icon: iconMap[route.path] ?? <NoteIcon fontSize="small" />
      })),
    [routes]
  );

  return (
    <Box
      component="nav"
      sx={{
        width: 92,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(180deg, rgba(13,16,24,0.85) 0%, rgba(10,12,19,0.95) 100%)',
        backdropFilter: 'blur(12px)',
        py: 3,
        px: 1.5
      }}
    >
      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item) => {
          const selected = activePath === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ justifyContent: 'center' }}>
              <Tooltip title={item.label} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 18,
                    flexDirection: 'column',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(91,124,250,0.18)',
                      color: 'primary.light'
                    }
                  }}
                  selected={selected}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', color: 'inherit', mb: 0.5 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 12, fontWeight: selected ? 700 : 500 }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default NavigationRail;
