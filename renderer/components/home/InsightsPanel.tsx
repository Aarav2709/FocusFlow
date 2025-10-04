import React, { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useStudy, StudySubject } from '../../context/StudyContext';
import { useProfile, DEFAULT_DAILY_TARGET_MINUTES } from '../../context/ProfileContext';

const XP_PER_MINUTE = 12;

type HistoryEntry = { focusSeconds: number; breakSeconds: number; perSubject: Record<string, number> };
type StudyHistory = Record<string, HistoryEntry>;
type DailySeriesPoint = { day: string; minutes: number };
type SubjectDistributionItem = { name: string; seconds: number; minutes: number };
type Metric = { key: string; label: string; value: string; caption: string };

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const computeLevel = (xp: number) => {
  let level = 1;
  let remainingXp = xp;
  let xpForLevel = 240;

  while (remainingXp >= xpForLevel) {
    remainingXp -= xpForLevel;
    level += 1;
    xpForLevel = Math.round(240 + level * 180);
  }

  const progress = xpForLevel === 0 ? 1 : Math.min(1, remainingXp / xpForLevel);

  return {
    level,
    xpIntoLevel: remainingXp,
    xpForNext: xpForLevel,
    progress
  };
};

const tierFromLevel = (level: number) => {
  if (level >= 12) return 'Supernova Strategist';
  if (level >= 9) return 'Nebula Mentor';
  if (level >= 6) return 'Aurora Scholar';
  if (level >= 3) return 'Orbit Keeper';
  return 'Focus Initiate';
};

const InsightsPanel: React.FC = () => {
  const { subjects, totalFocusSeconds, history } = useStudy();
  const { profile } = useProfile();
  const dailyTargetMinutes = useMemo(
    () => Math.max(profile?.dailyTargetMinutes ?? DEFAULT_DAILY_TARGET_MINUTES, 1),
    [profile?.dailyTargetMinutes]
  );

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

  const lifetimeFocusSeconds = useMemo(
    () => Object.values(history as StudyHistory).reduce((acc: number, entry) => acc + entry.focusSeconds, 0),
    [history]
  );
  const lifetimeMinutes = useMemo(
    () => Math.max(Math.round(lifetimeFocusSeconds / 60), focusMinutes),
    [lifetimeFocusSeconds, focusMinutes]
  );
  const totalXp = useMemo(() => lifetimeMinutes * XP_PER_MINUTE, [lifetimeMinutes]);
  const { level, xpIntoLevel, xpForNext, progress: levelProgress } = useMemo(() => computeLevel(totalXp), [totalXp]);
  const tier = useMemo(() => tierFromLevel(level), [level]);
  const xpToNext = Math.max(xpForNext - xpIntoLevel, 0);

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

  const subjectDistribution = useMemo<SubjectDistributionItem[]>(
    () =>
      subjects
        .map((subject: StudySubject) => ({
          name: subject.name,
          seconds: subject.totalSeconds,
          minutes: Math.round(subject.totalSeconds / 60)
        }))
        .sort((a: SubjectDistributionItem, b: SubjectDistributionItem) => b.seconds - a.seconds),
    [subjects]
  );

  const dailySeries = useMemo(() => {
    const dates = Object.keys(history)
      .sort()
      .slice(-14);
    if (!dates.length) return [] as DailySeriesPoint[];
    return dates.map((day) => {
      const entry = history[day];
      const minutes = Math.round((entry?.focusSeconds ?? 0) / 60);
      return { day, minutes };
    });
  }, [history]);

  const hasSubjectData = subjectDistribution.some((subject: SubjectDistributionItem) => subject.seconds > 0);
  const hasDailyData = dailySeries.some((point: DailySeriesPoint) => point.minutes > 0);

  const metrics = useMemo<Metric[]>(
    () => [
      {
        key: 'seasonLevel',
        label: 'SEASON LEVEL',
        value: `Lv ${level}`,
        caption: `${tier} • ${Math.round(levelProgress * 100)}% to Lv ${level + 1}`
      },
      {
        key: 'lifetimeXp',
        label: 'LIFETIME XP',
        value: `${totalXp.toLocaleString()} XP`,
        caption: `${xpToNext} to next unlock`
      },
      {
        key: 'dailyAverage',
        label: 'DAILY AVERAGE',
        value: `${dailyAverageMinutes} min`,
        caption: `Across ${totalDaysWithData} day${totalDaysWithData === 1 ? '' : 's'}`
      },
      {
        key: 'activeSubjects',
        label: 'ACTIVE LANES',
        value: `${activeSubjects}`,
        caption: `Streak · ${studyStreak} day${studyStreak === 1 ? '' : 's'}`
      }
    ],
    [level, tier, levelProgress, totalXp, xpToNext, dailyAverageMinutes, totalDaysWithData, activeSubjects, studyStreak]
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

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ height: { xs: 320, md: 380 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="overline" color="text.secondary">
                  DAILY FOCUS (LAST 14 DAYS)
                </Typography>
                <Chip size="small" label={`Best: ${Math.max(...dailySeries.map((d: DailySeriesPoint) => d.minutes), 0)} min`} color="secondary" />
              </Stack>
              <Box sx={{ flex: 1 }}>
                {hasDailyData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="day" stroke="#bdbdbd" tickFormatter={(value: string) => value.slice(5)} tickLine={false} axisLine={false} />
                      <YAxis stroke="#bdbdbd" tickFormatter={(value: number) => `${value}m`} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        contentStyle={{
                          backgroundColor: '#111',
                          borderRadius: 0,
                          border: '1px solid rgba(255,255,255,0.12)'
                        }}
                        itemStyle={{ color: '#ffffff' }}
                        labelStyle={{ color: '#ffffff' }}
                        formatter={(value: number) => [`${value} min`, 'Focus']}
                      />
                      <Bar dataKey="minutes" fill="#64f4ac" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Start tracking sessions to unlock your daily trends.
                    </Typography>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: { xs: 320, md: 380 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="overline" color="text.secondary">
                TIME BY SUBJECT
              </Typography>
              <Box sx={{ flex: 1 }}>
                {hasSubjectData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="#bdbdbd" tickLine={false} axisLine={false} />
                      <YAxis stroke="#bdbdbd" tickFormatter={(value: number) => `${value}m`} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        contentStyle={{
                          backgroundColor: '#111',
                          borderRadius: 0,
                          border: '1px solid rgba(255,255,255,0.12)'
                        }}
                        itemStyle={{ color: '#ffffff' }}
                        labelStyle={{ color: '#ffffff' }}
                        formatter={(value: number) => [`${value} min`, 'Minutes']}
                      />
                      <Bar dataKey="minutes" fill="#64f4ac" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Track time for subjects to see distribution insights.
                    </Typography>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default InsightsPanel;
