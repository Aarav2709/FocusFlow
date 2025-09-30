import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import type { AppPreferences } from '@shared/types';
import { useAppState } from '../context/AppStateContext';

const SettingsView = () => {
  const { preferences, updatePreference } = useAppState();
  const [pending, setPending] = useState(false);

  const pomodoroDurations = useMemo(() => {
    const defaults = { focus: 25, shortBreak: 5, longBreak: 15 };
    return preferences?.pomodoro ?? defaults;
  }, [preferences]);

  const handleThemeChange = async (event: { target: { value: string } }) => {
    setPending(true);
    try {
      await updatePreference('theme', event.target.value as AppPreferences['theme']);
    } finally {
      setPending(false);
    }
  };

  const handleNotifications = async (_: unknown, checked: boolean) => {
    setPending(true);
    try {
      await updatePreference('notificationsEnabled', checked);
    } finally {
      setPending(false);
    }
  };

  const handlePomodoroChange = async (key: keyof AppPreferences['pomodoro'], value: number) => {
    setPending(true);
    try {
      await updatePreference('pomodoro', {
        ...pomodoroDurations,
        [key]: Math.max(1, value)
      });
    } finally {
      setPending(false);
    }
  };

  if (!preferences) {
    return (
      <Stack spacing={2} color="text.secondary">
        <Typography variant="body1">Loading preferences…</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your study environment and sync it with every device.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Appearance
            </Typography>
            <FormControl sx={{ maxWidth: 240 }}>
              <InputLabel id="theme-select-label">Theme</InputLabel>
              <Select
                labelId="theme-select-label"
                label="Theme"
                value={preferences.theme}
                onChange={handleThemeChange}
                disabled={pending}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Focus & Notifications
            </Typography>
            <FormControlLabel
              control={<Switch checked={preferences.notificationsEnabled} onChange={handleNotifications} />}
              label="Enable desktop notifications"
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Pomodoro Timers (minutes)
            </Typography>
            <Stack direction="row" spacing={3}>
              {(['focus', 'shortBreak', 'longBreak'] as const).map((key) => (
                <TextField
                  key={key}
                  type="number"
                  label={key === 'focus' ? 'Focus' : key === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  value={pomodoroDurations[key]}
                  onChange={(event) => handlePomodoroChange(key, Number(event.target.value))}
                  disabled={pending}
                  inputProps={{ min: 1 }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default SettingsView;
