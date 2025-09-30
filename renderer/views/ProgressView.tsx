import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import TimerIcon from '@mui/icons-material/TimerOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooksOutlined';
import type { StudySession } from '@shared/types';
import { useAppState } from '../context/AppStateContext';

const metricCards = [
  { key: 'totalMinutes', label: 'Minutes Logged', icon: <TimerIcon /> },
  { key: 'completedTasks', label: 'Completed Tasks', icon: <AssignmentTurnedInIcon /> },
  { key: 'cardsReviewed', label: 'Cards Reviewed', icon: <LibraryBooksIcon /> },
  { key: 'sessionsThisWeek', label: 'Sessions This Week', icon: <TrendingUpIcon /> }
] as const;

const ProgressView = () => {
  const { summary, sessions } = useAppState();

  const recentSessions = useMemo<StudySession[]>(() => {
    return [...sessions].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 10);
  }, [sessions]);

  const formatTimestamp = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));

  return (
    <Stack spacing={4}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Progress Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review your productivity trends and celebrate milestones.
          </Typography>
        </Box>
        <Chip
          color="primary"
          variant="outlined"
          icon={<HistoryIcon />}
          label={`${sessions.length} total sessions`}
        />
      </Stack>

      <Grid container spacing={3}>
        {metricCards.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.key}>
            <Card sx={{ borderRadius: 4, height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {metric.icon}
                    <Typography variant="subtitle2" color="text.secondary">
                      {metric.label}
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700}>
                    {summary ? summary[metric.key] : '--'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Recent Sessions
            </Typography>
            <Stack spacing={2}>
              {recentSessions.map((session: StudySession) => (
                <Stack
                  key={session.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    pb: 1.5,
                    mb: 1.5
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {session.mode === 'focus' ? 'Focus Session' : session.mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTimestamp(session.startedAt)}
                    </Typography>
                  </Stack>
                  <Chip label={`${session.durationMinutes} min`} color="primary" variant="outlined" />
                </Stack>
              ))}

              {recentSessions.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No sessions logged yet. Use the timer to track your study focus.
                </Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ProgressView;
