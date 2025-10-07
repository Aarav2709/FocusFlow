import React, { useMemo } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useStudy, StudySubject } from '../../context/StudyContext';
import { useProfile, DEFAULT_DDAY_DATE } from '../../context/ProfileContext';

type HistoryEntry = { focusSeconds: number; breakSeconds: number; perSubject: Record<string, number> };
type Metric = { key: string; label: string; value: string; caption: string };

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const InsightsPanel: React.FC = () => {
  const { subjects, totalFocusSeconds, history } = useStudy();
  const { profile } = useProfile();

  const totalDaysWithData = useMemo(() => Math.max(1, Object.keys(history).length), [history]);

  const focusMinutes = useMemo(() => Math.round(totalFocusSeconds / 60), [totalFocusSeconds]);
  const dailyAverageMinutes = useMemo(
    () => Math.round(totalFocusSeconds / totalDaysWithData / 60),
    [totalFocusSeconds, totalDaysWithData]
  );

  const activeSubjects = useMemo(
    () => subjects.filter((subject: StudySubject) => subject.totalSeconds > 0).length,
    [subjects]
  );

  const studyStreak = useMemo(() => {
    const keys = new Set(Object.keys(history));
    if (!keys.size) return 0;
    let streak = 0;
    const cursor = new Date();
    while (streak <= keys.size) {
      const key = toDateKey(cursor);
      const entry = history[key];
      if (!entry || entry.focusSeconds <= 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [history]);

  // Calculate D-Day (days until target date)
  const targetDate = useMemo(() => {
    const dateStr = profile?.dDayDate ?? DEFAULT_DDAY_DATE;
    return new Date(dateStr);
  }, [profile?.dDayDate]);

  const dDay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [targetDate]);

  const metrics = useMemo<Metric[]>(
    () => [
      {
        key: 'dDay',
        label: 'D-DAY',
        value: dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-DAY!' : `D+${Math.abs(dDay)}`,
        caption: targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      },
      {
        key: 'totalFocus',
        label: 'TOTAL FOCUS',
        value: `${Math.round(focusMinutes / 60)}h ${focusMinutes % 60}m`,
        caption: `${focusMinutes} minutes today`
      },
      {
        key: 'dailyAverage',
        label: 'DAILY AVERAGE',
        value: `${dailyAverageMinutes} min`,
        caption: `Across ${totalDaysWithData} day${totalDaysWithData === 1 ? '' : 's'}`
      },
      {
        key: 'activeSubjects',
        label: 'STUDY STREAK',
        value: `${studyStreak}`,
        caption: `${studyStreak} day${studyStreak === 1 ? '' : 's'} • ${activeSubjects} active subjects`
      }
    ],
    [dDay, targetDate, focusMinutes, dailyAverageMinutes, totalDaysWithData, studyStreak, activeSubjects]
  );

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {metrics.map((metric: Metric) => (
          <Grid key={metric.key} item xs={12} sm={6} md={3}>
            <Box sx={{ width: '100%', minHeight: { xs: 130, sm: 150 } }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  border: '1px solid rgba(122,108,255,0.22)',
                  background: 'linear-gradient(155deg, rgba(12,16,42,0.82), rgba(19,24,58,0.62))'
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1,
                    height: '100%'
                  }}
                >
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                    {metric.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontVariantNumeric: 'tabular-nums', fontSize: { xs: 26, sm: 28, md: 30 }, lineHeight: 1.15 }}
                  >
                    {metric.value}
                  </Typography>
                  {metric.caption ? (
                    <Typography variant="body2" color="text.secondary">
                      {metric.caption}
                    </Typography>
                  ) : null}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default InsightsPanel;
