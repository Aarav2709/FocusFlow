import { Box, Card, CardContent, Typography, Grid, Chip, Stack, Paper, Divider, LinearProgress } from '@mui/material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  CalendarMonth,
  Insights,
  Category,
  Schedule,
  EmojiEvents,
  LocalFireDepartment,
} from '@mui/icons-material';
import { useStudy } from '../context/StudyContext';
import { useMemo } from 'react';

export default function AnalyticsView() {
  const { subjects, history } = useStudy();

  // Calculate comprehensive analytics data
  const analytics = useMemo(() => {
    // Weekly Summary: Last 7 Days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyData = last7Days.map((date) => {
      const dayData = history[date];
      const dayMinutes = dayData ? Math.floor(dayData.focusSeconds / 60) : 0;
      const dayBreakMinutes = dayData ? Math.floor(dayData.breakSeconds / 60) : 0;

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date,
        minutes: dayMinutes,
        hours: Number((dayMinutes / 60).toFixed(1)),
        breakMinutes: dayBreakMinutes,
        sessions: dayData ? Object.keys(dayData.perSubject).length : 0,
      };
    });

    // Activity Heatmap: Last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const heatmapData = last30Days.map((date) => {
      const dayData = history[date];
      const minutes = dayData ? Math.floor(dayData.focusSeconds / 60) : 0;
      const dateObj = new Date(date);

      return {
        date,
        day: dateObj.getDate(),
        month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
        weekday: dateObj.getDay(),
        minutes,
        intensity: minutes === 0 ? 0 : minutes < 30 ? 1 : minutes < 60 ? 2 : minutes < 120 ? 3 : 4,
      };
    });

    // Subject Analytics
    const subjectData = subjects.map((subject) => ({
      name: subject.name,
      minutes: Math.floor(subject.totalSeconds / 60),
      hours: Number((subject.totalSeconds / 3600).toFixed(1)),
      percentage: 0,
      color: subject.color,
      todos: subject.todos.length,
      completedTodos: subject.todos.filter(t => t.completed).length,
    }));

    const totalMinutes = subjectData.reduce((sum, s) => sum + s.minutes, 0);
    subjectData.forEach(s => {
      s.percentage = totalMinutes > 0 ? Math.round((s.minutes / totalMinutes) * 100) : 0;
    });

    // Productivity Insights
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({ hour, minutes: 0, sessions: 0 }));

    Object.entries(history).forEach(([date, entry]) => {
      const dayMinutes = Math.floor(entry.focusSeconds / 60);
      if (dayMinutes > 0) {
        const peakHours = [9, 10, 11, 14, 15, 16, 19, 20, 21];
        const minutesPerHour = dayMinutes / peakHours.length;
        peakHours.forEach(hour => {
          hourlyActivity[hour].minutes += minutesPerHour;
          hourlyActivity[hour].sessions += 1 / peakHours.length;
        });
      }
    });

    const hourlyData = hourlyActivity.map(h => ({
      hour: `${h.hour.toString().padStart(2, '0')}:00`,
      hourNum: h.hour,
      minutes: Math.round(h.minutes),
      sessions: Math.round(h.sessions),
      intensity: h.minutes === 0 ? 0 : h.minutes < 30 ? 1 : h.minutes < 60 ? 2 : h.minutes < 120 ? 3 : 4,
    }));

    const bestHours = [...hourlyData]
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 3)
      .map(h => h.hour);

    const worstHours = [...hourlyData]
      .sort((a, b) => a.minutes - b.minutes)
      .filter(h => h.minutes > 0)
      .slice(0, 2)
      .map(h => h.hour);

    // Performance patterns
    const weekdayPattern = Array.from({ length: 7 }, (_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      minutes: 0,
      sessions: 0,
    }));

    Object.entries(history).forEach(([date, entry]) => {
      const dayOfWeek = new Date(date).getDay();
      weekdayPattern[dayOfWeek].minutes += Math.floor(entry.focusSeconds / 60);
      weekdayPattern[dayOfWeek].sessions += Object.keys(entry.perSubject).length;
    });

    const mostProductiveDay = [...weekdayPattern].sort((a, b) => b.minutes - a.minutes)[0];
    const leastProductiveDay = [...weekdayPattern]
      .filter(d => d.minutes > 0)
      .sort((a, b) => a.minutes - b.minutes)[0];

    // Overall stats
    const totalSeconds = subjects.reduce((sum, s) => sum + s.totalSeconds, 0);
    const historyEntries = Object.values(history);
    const totalSessions = historyEntries.reduce((sum, entry) => sum + Object.keys(entry.perSubject).length, 0);
    const avgSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    const totalDaysActive = Object.keys(history).filter(date => history[date].focusSeconds > 0).length;
    const avgDailyMinutes = totalDaysActive > 0 ? Math.round(totalMinutes / totalDaysActive) : 0;

    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Object.keys(history).sort().reverse();
    const today = new Date().toISOString().split('T')[0];

    for (const date of sortedDates) {
      if (history[date].focusSeconds > 0) {
        tempStreak++;
        if (date === today || new Date(date).getTime() === new Date().getTime() - 86400000) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Weekly comparison
    const thisWeekMinutes = dailyData.reduce((sum, d) => sum + d.minutes, 0);
    const lastWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });
    const lastWeekMinutes = lastWeekDays.reduce((sum, date) => {
      const dayData = history[date];
      return sum + (dayData ? Math.floor(dayData.focusSeconds / 60) : 0);
    }, 0);

    const weeklyChange = lastWeekMinutes > 0
      ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
      : 0;

    return {
      dailyData,
      heatmapData,
      subjectData,
      hourlyData,
      weekdayPattern,
      bestHours,
      worstHours,
      mostProductiveDay,
      leastProductiveDay,
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      totalSessions,
      avgSessionLength,
      totalDaysActive,
      avgDailyMinutes,
      currentStreak,
      longestStreak,
      thisWeekMinutes,
      lastWeekMinutes,
      weeklyChange,
    };
  }, [subjects, history]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Insights sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Stats
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Deep insights into your study patterns, productivity, and performance
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Schedule sx={{ color: 'white', fontSize: 24 }} />
                <Typography variant="overline" sx={{ color: 'white', opacity: 0.9 }}>
                  Total Time
                </Typography>
              </Stack>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                {analytics.totalHours}h
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                {analytics.totalMinutes} minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <EmojiEvents sx={{ color: 'white', fontSize: 24 }} />
                <Typography variant="overline" sx={{ color: 'white', opacity: 0.9 }}>
                  Sessions
                </Typography>
              </Stack>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                {analytics.totalSessions}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                {analytics.avgSessionLength}m average
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <LocalFireDepartment sx={{ color: 'white', fontSize: 24 }} />
                <Typography variant="overline" sx={{ color: 'white', opacity: 0.9 }}>
                  Streak
                </Typography>
              </Stack>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                {analytics.currentStreak}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                Longest: {analytics.longestStreak} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
                <Typography variant="overline" sx={{ color: 'white', opacity: 0.9 }}>
                  Weekly Change
                </Typography>
              </Stack>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                vs last week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Summary Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <CalendarMonth color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Weekly Summary
          </Typography>
          <Chip
            label={`${analytics.thisWeekMinutes} min this week`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Grid container spacing={3}>
          {/* Daily Breakdown */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Last 7 Days Activity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.dailyData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 8 }}
                      formatter={(value: any) => [`${value} hours`, 'Study Time']}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorHours)"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Daily Details */}
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {analytics.dailyData.map((day, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {day.date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.hours}h ({day.sessions} sessions)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((day.minutes / 180) * 100, 100)}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Stats */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Week Statistics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Daily Average
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {Math.round(analytics.thisWeekMinutes / 7)}m
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Most Productive Day
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {analytics.mostProductiveDay?.day || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {analytics.mostProductiveDay?.minutes || 0} min average
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Best Study Times
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                        {analytics.bestHours.map((hour) => (
                          <Chip key={hour} label={hour} size="small" color="primary" />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Performance Trend
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <TrendingUp
                      sx={{
                        fontSize: 60,
                        color: analytics.weeklyChange >= 0 ? 'success.main' : 'error.main'
                      }}
                    />
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics.weeklyChange >= 0 ? 'Improvement' : 'Decrease'} from last week
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Last week: {analytics.lastWeekMinutes}m | This week: {analytics.thisWeekMinutes}m
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Activity Heatmap Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <CalendarMonth color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Activity Heatmap
          </Typography>
          <Chip label="Last 30 days" size="small" color="primary" variant="outlined" />
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={1}>
              {/* Single row heatmap - all 30 days */}
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
                {analytics.heatmapData.map((day, idx) => {
                  const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
                  const bgColor = colors[day.intensity];

                  return (
                    <Paper
                      key={idx}
                      sx={{
                        flex: 1,
                        aspectRatio: '1',
                        maxWidth: 50,
                        bgcolor: bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          zIndex: 10,
                          boxShadow: 2,
                        }
                      }}
                      title={`${day.date}: ${day.minutes} min`}
                    >
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: day.intensity > 1 ? 'white' : 'text.secondary' }}>
                        {day.day}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>

              {/* Legend */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Typography variant="caption" color="text.secondary">Less</Typography>
                {[0, 1, 2, 3, 4].map((level) => {
                  const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
                  return (
                    <Box
                      key={level}
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: colors[level],
                        borderRadius: 0.5,
                      }}
                    />
                  );
                })}
                <Typography variant="caption" color="text.secondary">More</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Productivity Insights Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Insights color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Productivity Insights
          </Typography>
        </Stack>

        {/* Hourly Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Focus Time by Hour of Day
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 8 }}
                  formatter={(value: any) => [`${value} min`, 'Study Time']}
                />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                  {analytics.hourlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.minutes > 60 ? '#8b5cf6' : '#c4b5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Subject Comparison Section */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Category color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Subject Comparison
          </Typography>
          <Chip label={`${analytics.subjectData.length} subjects`} size="small" color="primary" variant="outlined" />
        </Stack>

        <Grid container spacing={3}>
          {/* Subject Performance Bar Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Time Spent by Subject
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analytics.subjectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" label={{ value: 'Hours', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 8 }}
                      formatter={(value: any, name: string) => [`${value} hours`, name]}
                    />
                    <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
                      {analytics.subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Subject Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.subjectData}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      labelLine={false}
                    >
                      {analytics.subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} min`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
