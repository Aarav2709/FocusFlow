import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Switch,
  Stack,
  Typography
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

type MoreOption = {
  label: string;
  description: string;
  disabled?: boolean;
  action?: () => void;
};

const MorePage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference } = useAppState();
  const [pending, setPending] = useState(false);

  const options = useMemo<MoreOption[]>(
    () => [
      { label: 'Nickname', description: 'Set the name shown in rankings', disabled: true },
      { label: 'Status message', description: 'Share your current mood or goal', disabled: true },
      { label: 'Theme', description: 'Dark theme enabled', disabled: true },
      {
        label: 'Settings',
        description: 'Manage account preferences',
        action: () => navigate('/settings')
      },
      { label: 'Region', description: 'Korea', disabled: true },
      { label: 'Language', description: 'English', disabled: true }
    ],
    [navigate]
  );

  const toggleNotifications = async (_: unknown, checked: boolean) => {
    setPending(true);
    try {
      await updatePreference('notificationsEnabled', checked);
    } finally {
      setPending(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          More
        </Typography>
        <SettingsIcon sx={{ color: 'text.secondary' }} />
      </Stack>
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={600}>
              Focus & notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep your routine in sync across devices.
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                Focus mode is always on to keep distractions away.
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600}>
                  Desktop notifications
                </Typography>
                <Switch
                  edge="end"
                  checked={preferences?.notificationsEnabled ?? false}
                  onChange={toggleNotifications}
                  disabled={pending || !preferences}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Get alerts when sessions start and finish.
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <List disablePadding>
            {options.map((option, index) => (
              <ListItem key={option.label} disablePadding divider={index !== options.length - 1}>
                <ListItemButton disabled={option.disabled} onClick={option.action}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600}>
                        {option.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default MorePage;
