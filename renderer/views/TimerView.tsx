import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import type { StudySessionPayload } from '@shared/types';
import { useAppState } from '../context/AppStateContext';

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

type Mode = StudySessionPayload['mode'];

const TimerView = () => {
  const { preferences, updatePreference, logSession } = useAppState();
  const [mode, setMode] = useState<Mode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);

  const durations = useMemo(() => {
    const defaults = {
      focus: 25,
      shortBreak: 5,
      longBreak: 15
    };
    const pref = preferences?.pomodoro ?? defaults;
    return {
      focus: pref.focus * 60,
      shortBreak: pref.shortBreak * 60,
      longBreak: pref.longBreak * 60
    };
  }, [preferences]);

  useEffect(() => {
    setTimeLeft(durations[mode] ?? 1500);
    setIsRunning(false);
  }, [mode, durations]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const interval = window.setInterval(() => {
  setTimeLeft((prev: number) => {
        if (prev <= 1) {
          void logSession({ mode, durationMinutes: Math.round((durations[mode] ?? 0) / 60) });
          setCompletedSessions((count: number) => count + (mode === 'focus' ? 1 : 0));
          setIsRunning(false);
          return durations[mode] ?? 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, logSession, mode, durations]);

  const handleStartPause = () => {
  setIsRunning((prev: boolean) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode] ?? 0);
  };

  const handleModeChange = (_: unknown, value: Mode | null) => {
    if (!value) return;
    setMode(value);
  };

  const incrementPreference = async (key: 'focus' | 'shortBreak' | 'longBreak', delta: number) => {
    const current = preferences?.pomodoro[key] ?? (key === 'focus' ? 25 : key === 'shortBreak' ? 5 : 15);
    const next = Math.max(1, current + delta);
    await updatePreference('pomodoro', {
      ...preferences?.pomodoro,
      focus: preferences?.pomodoro.focus ?? 25,
      shortBreak: preferences?.pomodoro.shortBreak ?? 5,
      longBreak: preferences?.pomodoro.longBreak ?? 15,
      [key]: next
    });
  };

  return (
    <Stack spacing={4} alignItems="stretch" sx={{ height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Pomodoro Timer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay focused with guided intervals and automatic session logging.
          </Typography>
        </Box>
        <Chip label={`${completedSessions} focus sessions`} color="primary" variant="outlined" />
      </Stack>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={4} alignItems="center">
            <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} color="primary">
              <ToggleButton value="focus">Focus</ToggleButton>
              <ToggleButton value="shortBreak">Short Break</ToggleButton>
              <ToggleButton value="longBreak">Long Break</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="h2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={handleStartPause}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button variant="outlined" size="large" startIcon={<ReplayIcon />} onClick={handleReset}>
                Reset
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Session Lengths
            </Typography>
            <Stack spacing={2}>
              {(['focus', 'shortBreak', 'longBreak'] as const).map((key) => (
                <Stack key={key} direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} textTransform="capitalize">
                      {key === 'shortBreak' ? 'Short Break' : key === 'longBreak' ? 'Long Break' : 'Focus'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {preferences?.pomodoro[key] ?? (key === 'focus' ? 25 : key === 'shortBreak' ? 5 : 15)} minutes
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => incrementPreference(key, -1)}>
                      - 1
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => incrementPreference(key, 1)}>
                      + 1
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default TimerView;
