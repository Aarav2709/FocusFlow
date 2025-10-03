import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useAppState } from '../context/AppStateContext';

type Subject = { id: string; name: string; color?: string };

const SUBJECT_STORAGE_KEY = 'focusflow:subjects:v1';
const ELAPSED_STORAGE_KEY = 'focusflow:elapsed:v1';
const SUBJECT_EVENT = 'focusflow:subjects-changed';
const ELAPSED_EVENT = 'focusflow:elapsed-changed';

const readSubjects = (): Subject[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SUBJECT_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Subject[]) : [];
  } catch {
    return [];
  }
};

const readElapsed = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ELAPSED_STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return typeof data === 'object' && data ? (data as Record<string, number>) : {};
  } catch {
    return {};
  }
};

const formatDuration = (seconds: number) => {
  if (!seconds) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

const InsightsView: React.FC = () => {
  const { summary, sessions } = useAppState();
  const [subjects, setSubjects] = useState<Subject[]>(() => readSubjects());
  const [elapsed, setElapsed] = useState<Record<string, number>>(() => readElapsed());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refreshSubjects = () => setSubjects(readSubjects());
    const refreshElapsed = () => setElapsed(readElapsed());
    const refreshAll = () => {
      refreshSubjects();
      refreshElapsed();
    };

    refreshAll();
    window.addEventListener('focus', refreshAll);
    window.addEventListener('visibilitychange', refreshAll);
    window.addEventListener(SUBJECT_EVENT, refreshSubjects);
    window.addEventListener(ELAPSED_EVENT, refreshElapsed);
    window.addEventListener('storage', refreshAll);

    return () => {
      window.removeEventListener('focus', refreshAll);
      window.removeEventListener('visibilitychange', refreshAll);
      window.removeEventListener(SUBJECT_EVENT, refreshSubjects);
      window.removeEventListener(ELAPSED_EVENT, refreshElapsed);
      window.removeEventListener('storage', refreshAll);
    };
  }, []);

  const totalSeconds = useMemo(() => Object.values(elapsed).reduce((acc, value) => acc + value, 0), [elapsed]);
  const totalMinutes = useMemo(() => Math.round(totalSeconds / 60), [totalSeconds]);

  const subjectStats = useMemo(() => {
    return subjects
      .map((subject) => {
        const seconds = elapsed[subject.id] ?? 0;
        const percent = totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0;
        return { subject, seconds, percent };
      })
      .sort((a, b) => b.seconds - a.seconds);
  }, [subjects, elapsed, totalSeconds]);

  const activeSubjects = subjectStats.filter((stat) => stat.seconds > 0).length;
  const dailyAverage = Math.round(totalMinutes / 7);
  const topSubject = subjectStats[0];
  const sessionsThisWeek = summary?.sessionsThisWeek ?? sessions.length;

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 5);
  }, [sessions]);

  return (
    <Stack spacing={3} sx={{ p: 2, pb: 8 }}>
      <Stack spacing={0.5}>
        <Typography variant="h4" fontWeight={700}>
          Insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your focus habits across subjects and sessions.
        </Typography>
      </Stack>

  <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Total Focus Time
          </Typography>
          <Typography variant="h3" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatDuration(totalSeconds)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalSeconds
              ? `Across ${activeSubjects || subjects.length} ${subjects.length === 1 ? 'subject' : 'subjects'}`
              : 'Start a timer to generate insights.'}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Daily average
              </Typography>
              <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {dailyAverage} min
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on the past seven days.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Most focused
              </Typography>
              <Typography variant="h5" noWrap>
                {topSubject?.subject.name ?? '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topSubject?.seconds ? `${formatDuration(topSubject.seconds)} logged` : 'No data yet'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Sessions this week
              </Typography>
              <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {sessionsThisWeek}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Logged focus blocks in the last 7 days.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

  <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            By subject
          </Typography>
          <Stack spacing={1.5}>
            {subjectStats.length ? (
              subjectStats.map(({ subject, seconds, percent }) => (
                <Box key={subject.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography variant="body2" fontWeight={600}>
                      {subject.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDuration(seconds)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      borderRadius: 0,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: subject.color ?? '#999',
                        borderRadius: 0
                      }
                    }}
                  />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Add a subject and start a timer to see distribution insights.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

  <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent sessions
          </Typography>
          {recentSessions.length ? (
            <Stack spacing={1.5}>
              {recentSessions.map((session) => {
                const started = new Date(session.startedAt);
                return (
                  <Box key={session.id}>
                    <Typography variant="body2" fontWeight={600}>
                      {session.mode === 'focus' ? 'Focus' : session.mode === 'shortBreak' ? 'Short Break' : 'Long Break'} ·{' '}
                      {session.durationMinutes} min
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {started.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}{' '}
                      at {started.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No sessions logged yet. Finish a pomodoro to build your history.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ opacity: 0.12 }} />
    </Stack>
  );
};

export default InsightsView;
