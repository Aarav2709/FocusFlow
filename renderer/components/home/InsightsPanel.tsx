import React, { useMemo } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useStudy } from '../../context/StudyContext';

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const InsightsPanel: React.FC = () => {
  const { subjects, totalFocusSeconds, breakSeconds, history } = useStudy();

  const totalDaysWithData = useMemo(() => Math.max(1, Object.keys(history).length), [history]);
  const totalSeconds = totalFocusSeconds + breakSeconds;

  const focusMinutes = useMemo(() => Math.round(totalFocusSeconds / 60), [totalFocusSeconds]);
  const breakMinutes = useMemo(() => Math.round(breakSeconds / 60), [breakSeconds]);
  const dailyAverageMinutes = useMemo(
    () => Math.round(totalFocusSeconds / totalDaysWithData / 60),
    [totalFocusSeconds, totalDaysWithData]
  );

  const activeSubjects = useMemo(
    () => subjects.filter((subject) => subject.totalSeconds > 0).length,
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

  const subjectDistribution = useMemo(
    () =>
      subjects
        .map((subject) => ({
          name: subject.name,
          seconds: subject.totalSeconds,
          minutes: Math.round(subject.totalSeconds / 60)
        }))
        .sort((a, b) => b.seconds - a.seconds),
    [subjects]
  );

  const dailySeries = useMemo(() => {
    const dates = Object.keys(history)
      .sort()
      .slice(-14);
    if (!dates.length) return [] as { day: string; minutes: number }[];
    return dates.map((day) => {
      const entry = history[day];
      const minutes = Math.round((entry?.focusSeconds ?? 0) / 60);
      return { day, minutes };
    });
  }, [history]);

  const pieData = useMemo(
    () => [
      { name: 'Focus', value: totalFocusSeconds, fill: '#64f4ac' },
      { name: 'Break', value: breakSeconds, fill: '#9e9e9e' }
    ],
    [totalFocusSeconds, breakSeconds]
  );

  const hasSubjectData = subjectDistribution.some((subject) => subject.seconds > 0);
  const hasPieData = totalSeconds > 0;
  const hasDailyData = dailySeries.some((d) => d.minutes > 0);

  const metrics = useMemo(
    () => [
      {
        key: 'totalFocus',
        label: 'TOTAL FOCUS',
        value: formatDuration(totalFocusSeconds),
        caption: `${focusMinutes} min overall`
      },
      {
        key: 'breakTime',
        label: 'BREAK TIME',
        value: formatDuration(breakSeconds),
        caption: `${breakMinutes} min logged`
      },
      {
        key: 'dailyAverage',
        label: 'DAILY AVERAGE',
        value: `${dailyAverageMinutes} min`,
        caption: `Across ${totalDaysWithData} day${totalDaysWithData === 1 ? '' : 's'}`
      },
      {
        key: 'activeSubjects',
        label: 'ACTIVE SUBJECTS',
        value: `${activeSubjects}`,
        caption: `Streak · ${studyStreak} day${studyStreak === 1 ? '' : 's'}`
      }
    ],
    [
      totalFocusSeconds,
      focusMinutes,
      breakSeconds,
      breakMinutes,
      dailyAverageMinutes,
      totalDaysWithData,
      activeSubjects,
      studyStreak
    ]
  );

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.key} item xs={12} sm={6} md={3}>
            <Box sx={{ width: '100%', minHeight: { xs: 130, sm: 150 } }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)'
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
                  <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
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
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ height: 260, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="overline" color="text.secondary">
                DAILY FOCUS (LAST 14 DAYS)
              </Typography>
              <Box sx={{ flex: 1 }}>
                {hasDailyData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="day" stroke="#bdbdbd" tickFormatter={(value: string) => value.slice(5)} tickLine={false} axisLine={false} />
                      <YAxis stroke="#bdbdbd" tickFormatter={(value) => `${value}m`} tickLine={false} axisLine={false} allowDecimals={false} />
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
        <Grid item xs={12} md={7}>
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
                      <YAxis stroke="#bdbdbd" tickFormatter={(value) => `${value}m`} tickLine={false} axisLine={false} allowDecimals={false} />
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

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: { xs: 320, md: 380 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="overline" color="text.secondary">
                FOCUS VS BREAK
              </Typography>
              <Box sx={{ flex: 1 }}>
                {hasPieData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        contentStyle={{
                          backgroundColor: '#111',
                          borderRadius: 0,
                          border: '1px solid rgba(255,255,255,0.12)'
                        }}
                        itemStyle={{ color: '#ffffff' }}
                        labelStyle={{ color: '#ffffff' }}
                        formatter={(value: number, name: string) => [formatDuration(Number(value)), name]}
                        labelFormatter={() => ''}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ color: '#e0e0e0', paddingTop: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Start a focus or break session to populate this chart.
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
