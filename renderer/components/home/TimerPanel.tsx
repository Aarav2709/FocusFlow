import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClearIcon from '@mui/icons-material/Clear';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useStudy, StudySubject, SubjectTodo } from '../../context/StudyContext';
import { useProfile, DEFAULT_DAILY_TARGET_MINUTES } from '../../context/ProfileContext';
import { useAchievements, StudyStats } from '../../context/AchievementsContext';
import { useSnackbar } from 'notistack';
import {
  XP_PER_MINUTE,
  computeLevel,
  tierFromLevel,
  computeStudyStreak,
  getTodayKey,
  summarizeSubjects,
  StudyHistory
} from '../../utils/gamification';

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

type SubjectMenuState = {
  anchor: HTMLElement | null;
  subject: StudySubject | null;
};

type SubjectSummary = {
  id: string;
  name: string;
  color: string;
  todayMinutes: number;
  lifetimeMinutes: number;
};

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
};

const MetricCard = ({ icon, label, primary, secondary }: MetricCardProps) => (
  <Box
    sx={{
      flex: 1,
      borderRadius: 0,
      px: 2.25,
      py: 1.75,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(10,14,40,0.55)'
    }}
  >
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
          {label.toUpperCase()}
        </Typography>
      </Stack>
      <Typography variant="h6" fontWeight={700}>
        {primary}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {secondary}
      </Typography>
    </Stack>
  </Box>
);

const TimerPanel: React.FC = () => {
  const {
    subjects,
    totalFocusSeconds,
    breakSeconds,
    history,
    activeSubjectId,
    lastSubjectId,
    isRunning,
    isBreakActive,
    toggleSubject,
    pauseTimer,
  startBreak,
  resetSubject,
    addSubject,
    updateSubject,
    removeSubject,
    addTodo,
    toggleTodo,
    removeTodo
  } = useStudy();

  const [newSubject, setNewSubject] = useState('');
  const [menuState, setMenuState] = useState<SubjectMenuState>({ anchor: null, subject: null });
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [todoDrafts, setTodoDrafts] = useState<Record<string, string>>({});
  const { profile } = useProfile();
  const { checkAchievements } = useAchievements();
  const { enqueueSnackbar } = useSnackbar();
  const dailyTargetMinutes = useMemo(
    () => Math.max(profile?.dailyTargetMinutes ?? DEFAULT_DAILY_TARGET_MINUTES, 1),
    [profile?.dailyTargetMinutes]
  );

  const activeSubject = activeSubjectId ? subjects.find((subject) => subject.id === activeSubjectId) ?? null : null;
  const lastSubject = lastSubjectId ? subjects.find((subject) => subject.id === lastSubjectId) ?? null : null;

  const primaryTime = useMemo(() => formatDuration(totalFocusSeconds), [totalFocusSeconds]);

  const todayKey = getTodayKey();
  const todayHistory = history[todayKey];

  const todayFocusMinutes = useMemo(() => {
    if (todayHistory) {
      return Math.round(todayHistory.focusSeconds / 60);
    }
    return Math.round(totalFocusSeconds / 60);
  }, [todayHistory, totalFocusSeconds]);

  const overallDailyProgress = useMemo(
    () => (dailyTargetMinutes > 0 ? Math.min(1, todayFocusMinutes / dailyTargetMinutes) : 0),
    [todayFocusMinutes, dailyTargetMinutes]
  );

  const lifetimeFocusSeconds = useMemo(() => {
    const recorded = Object.values(history as StudyHistory).reduce((acc, entry) => acc + entry.focusSeconds, 0);
    return Math.max(recorded, totalFocusSeconds);
  }, [history, totalFocusSeconds]);

  const lifetimeMinutes = useMemo(() => Math.max(Math.round(lifetimeFocusSeconds / 60), Math.round(totalFocusSeconds / 60)), [
    lifetimeFocusSeconds,
    totalFocusSeconds
  ]);

  const totalXp = useMemo(() => lifetimeMinutes * XP_PER_MINUTE, [lifetimeMinutes]);
  const { level, xpIntoLevel, xpForNext, progress: levelProgress } = useMemo(() => computeLevel(totalXp), [totalXp]);
  const xpToNextLevel = Math.max(xpForNext - xpIntoLevel, 0);
  const tier = useMemo(() => tierFromLevel(level), [level]);
  const studyStreak = useMemo(() => computeStudyStreak(history as StudyHistory), [history]);

  const subjectSummaries = useMemo(
    () => summarizeSubjects(subjects, history as StudyHistory, todayKey),
    [subjects, history, todayKey]
  );
  const subjectSummaryMap = useMemo(
    () => new Map(subjectSummaries.map((summary: SubjectSummary) => [summary.id, summary])),
    [subjectSummaries]
  );

  const statusText = useMemo(() => {
    if (isBreakActive) {
      return lastSubject ? `Mindful break • ${lastSubject.name} on standby` : 'Mindful break in progress';
    }
    if (activeSubject) {
      return `Focusing on ${activeSubject.name}`;
    }
    if (lastSubject) {
      return `Ready to resume ${lastSubject.name}`;
    }
    return 'Awaiting your next mission';
  }, [isBreakActive, activeSubject, lastSubject]);

  const dateString = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(new Date()),
    []
  );

  // Calculate completed todos across all subjects
  const completedQuests = useMemo(
    () => subjects.reduce((acc, subject: StudySubject) => acc + subject.todos.filter((todo) => todo.completed).length, 0),
    [subjects]
  );

  // Count time-based sessions (early bird, night owl, weekend)
  const timeBasedSessions = useMemo(() => {
    let earlyBird = 0;
    let nightOwl = 0;
    let weekend = 0;

    Object.entries(history as StudyHistory).forEach(([dateKey, entry]) => {
      if (entry.focusSeconds > 0) {
        const date = new Date(dateKey);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();

        // Approximation: if they studied, count as a session
        if (hour < 8) earlyBird++;
        if (hour >= 22) nightOwl++;
        if (dayOfWeek === 0 || dayOfWeek === 6) weekend++;
      }
    });

    return { earlyBird, nightOwl, weekend };
  }, [history]);

  // Count consecutive days hitting daily target
  const dailyGoalsHit = useMemo(() => {
    const keys = Object.keys(history).sort().reverse();
    let consecutive = 0;

    for (const key of keys) {
      const entry = history[key];
      const minutes = Math.round(entry.focusSeconds / 60);
      if (minutes >= dailyTargetMinutes) {
        consecutive++;
      } else {
        break;
      }
    }

    return consecutive;
  }, [history, dailyTargetMinutes]);

  // Calculate total sessions
  const totalSessions = useMemo(() => Object.keys(history).length, [history]);

  // Check achievements periodically when stats change
  React.useEffect(() => {
    const stats: StudyStats = {
      totalFocusMinutes: lifetimeMinutes,
      currentStreak: studyStreak,
      totalSessions,
      earlyBirdSessions: timeBasedSessions.earlyBird,
      nightOwlSessions: timeBasedSessions.nightOwl,
      weekendSessions: timeBasedSessions.weekend,
      dailyGoalsHit,
      completedQuests,
      currentLevel: level
    };

    const newAchievements = checkAchievements(stats);

    // Show toast for each new unlock
    newAchievements.forEach((achievement) => {
      enqueueSnackbar(`🎉 Achievement Unlocked: ${achievement.name}!`, {
        variant: 'success',
        autoHideDuration: 5000
      });
    });
  }, [
    lifetimeMinutes,
    studyStreak,
    totalSessions,
    timeBasedSessions,
    dailyGoalsHit,
    completedQuests,
    level,
    checkAchievements,
    enqueueSnackbar
  ]);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    addSubject(newSubject.trim());
    setNewSubject('');
  };

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, subject: StudySubject) => {
    setMenuState({ anchor: event.currentTarget, subject });
  };

  const closeMenu = () => setMenuState({ anchor: null, subject: null });

  const openEditDialog = () => {
    if (!menuState.subject) return;
    setEditName(menuState.subject.name);
    setEditColor(menuState.subject.color);
    setEditDialogOpen(true);
    closeMenu();
  };

  const handleEditSave = () => {
    if (!menuState.subject) return;
    updateSubject(menuState.subject.id, {
      name: editName.trim() || menuState.subject.name,
      color: editColor.trim() || menuState.subject.color
    });
    setEditDialogOpen(false);
  };

  const handleDeleteSubject = () => {
    if (!menuState.subject) return;
    removeSubject(menuState.subject.id);
    closeMenu();
  };

  const handleTodoDraftChange = (subjectId: string, value: string) => {
    setTodoDrafts((prev) => ({ ...prev, [subjectId]: value }));
  };

  const submitTodo = (subjectId: string) => {
    const draft = (todoDrafts[subjectId] ?? '').trim();
    if (!draft) return;
    addTodo(subjectId, draft);
    setTodoDrafts((prev) => ({ ...prev, [subjectId]: '' }));
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar - 1 }}>
        <Card sx={{ position: 'relative', overflow: 'hidden', borderRadius: 0, border: '1px solid rgba(122,108,255,0.28)' }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 20% 20%, rgba(122,108,255,0.32), transparent 55%), radial-gradient(circle at 80% 0%, rgba(67,255,210,0.28), transparent 50%)',
              opacity: 0.85,
              pointerEvents: 'none'
            }}
          />
          <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Stack spacing={1.5} alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <RocketLaunchIcon fontSize="small" />
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                    FOCUS REACTOR
                  </Typography>
                  <Chip size="small" label={dateString} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.35)' }} />
                </Stack>
                <Typography
                  variant="h2"
                  sx={{ fontVariantNumeric: 'tabular-nums', fontSize: { xs: 34, sm: 42, md: 50 }, lineHeight: 1 }}
                >
                  {primaryTime}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {statusText}
                </Typography>
                <Stack spacing={1} alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>
                      Level {level}
                    </Typography>
                    <Chip size="small" color="secondary" label={tier} sx={{ fontWeight: 600 }} />
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.round(levelProgress * 100)} sx={{ width: '100%', maxWidth: 320 }} />
                  <Typography variant="caption" color="text.secondary">
                    {xpToNextLevel} XP to level {level + 1} • {lifetimeMinutes} min lifetime focus
                  </Typography>
                </Stack>
              </Stack>

              <Divider flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', width: '100%' }} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                <MetricCard
                  icon={<BoltIcon fontSize="small" />}
                  label="Focus today"
                  primary={`${todayFocusMinutes} min`}
                  secondary={`${Math.round(overallDailyProgress * 100)}% of ${dailyTargetMinutes} min target`}
                />
                <MetricCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  label="Lifetime"
                  primary={`${lifetimeMinutes} min`}
                  secondary="Total focus logged"
                />
                <MetricCard
                  icon={<MilitaryTechIcon fontSize="small" />}
                  label="Streak"
                  primary={`${studyStreak} day${studyStreak === 1 ? '' : 's'}`}
                  secondary="Keep the orbit alive"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ borderRadius: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BoltIcon fontSize="small" />
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                FOCUS LANES
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1 }}
            >
              <TextField
                fullWidth
                placeholder="Name a new focus lane"
                value={newSubject}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewSubject(event.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                color="inherit"
                onClick={handleAddSubject}
                size="small"
                sx={{ whiteSpace: 'nowrap', fontSize: 13, px: 2.5 }}
              >
                Add lane
              </Button>
            </Stack>

            <Stack spacing={2}>
              {subjects.length ? (
                subjects.map((subject: StudySubject) => {
                  const summary = subjectSummaryMap.get(subject.id);
                  const todayMinutes = summary?.todayMinutes ?? Math.round(subject.totalSeconds / 60);
                  const lifetimeMinutesForSubject = summary?.lifetimeMinutes ?? todayMinutes;
                  const progress = Math.min(1, todayMinutes / dailyTargetMinutes);
                  const isActive = activeSubjectId === subject.id && !isBreakActive;
                  const isRecentBreakFocus = isBreakActive && lastSubjectId === subject.id;
                  const highlight = isActive || isRecentBreakFocus;
                  const showPause = isActive && isRunning && !isBreakActive;
                  const canStartBreak = isActive && !isBreakActive;
                  return (
                    <Box
                      key={subject.id}
                      sx={{
                        borderRadius: 0,
                        p: 2.5,
                        border: `1px solid ${alpha(subject.color, 0.35)}`,
                        background: alpha(subject.color, highlight ? 0.35 : 0.15)
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 42, height: 42, bgcolor: subject.color, color: '#050217', fontWeight: 700 }}>
                              {subject.name.slice(0, 2).toUpperCase()}
                            </Avatar>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {subject.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {todayMinutes} min today • {lifetimeMinutesForSubject} min lifetime
                              </Typography>
                            </Stack>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title={showPause ? 'Pause lane' : isRecentBreakFocus ? 'Resume lane' : 'Launch lane'}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (showPause) {
                                    pauseTimer();
                                    return;
                                  }
                                  toggleSubject(subject.id);
                                }}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.12)',
                                  color: 'common.white'
                                }}
                              >
                                {showPause ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            {canStartBreak ? (
                              <Tooltip title="Mindful break">
                                <IconButton
                                  size="small"
                                  onClick={startBreak}
                                  sx={{
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    color: 'common.white'
                                  }}
                                >
                                  <AccessTimeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            <Tooltip title="Reset lane">
                              <IconButton size="small" onClick={() => resetSubject(subject.id)}>
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More actions">
                              <IconButton size="small" onClick={(event: React.MouseEvent<HTMLButtonElement>) => openMenu(event, subject)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                        <Stack spacing={0.75}>
                          <LinearProgress variant="determinate" value={Math.round(progress * 100)} />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(progress * 100)}% of your {dailyTargetMinutes} min target
                          </Typography>
                        </Stack>
                        <Stack spacing={1.25}>
                          {subject.todos.length ? (
                            subject.todos.map((todo: SubjectTodo) => {
                              const completed = todo.completed;
                              return (
                                <Box
                                  key={todo.id}
                                  onClick={() => toggleTodo(subject.id, todo.id)}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 0,
                                    cursor: 'pointer',
                                    border: completed
                                      ? '1px solid rgba(67,255,210,0.45)'
                                      : '1px solid rgba(255,255,255,0.12)',
                                    background: completed ? 'rgba(67,255,210,0.15)' : 'rgba(12,16,34,0.6)'
                                  }}
                                >
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {completed ? (
                                      <CheckCircleIcon fontSize="small" color="secondary" />
                                    ) : (
                                      <CheckCircleOutlineIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                    )}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        textDecoration: completed ? 'line-through' : 'none',
                                        color: completed ? 'text.disabled' : 'text.primary'
                                      }}
                                    >
                                      {todo.text}
                                    </Typography>
                                  </Stack>
                                  <IconButton size="small" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                    event.stopPropagation();
                                    removeTodo(subject.id, todo.id);
                                  }}>
                                    <ClearIcon fontSize="inherit" />
                                  </IconButton>
                                </Box>
                              );
                            })
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No quests logged yet. Add one below to track progress.
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Add a quest for this lane"
                              value={todoDrafts[subject.id] ?? ''}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTodoDraftChange(subject.id, event.target.value)}
                              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  submitTodo(subject.id);
                                }
                              }}
                            />
                            <Button variant="contained" color="inherit" onClick={() => submitTodo(subject.id)}>
                              Add
                            </Button>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })
              ) : (
                <Stack spacing={1} alignItems="center" py={4}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Craft your first focus lane
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 320 }}>
                    Organize sessions by subjects or goals. Each lane can have its own quests and streaks.
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Menu anchorEl={menuState.anchor} open={Boolean(menuState.anchor)} onClose={closeMenu}>
        <MenuItem onClick={openEditDialog}>Edit lane</MenuItem>
        <MenuItem onClick={handleDeleteSubject}>Archive lane</MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update focus lane</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditName(event.target.value)}
              autoFocus
            />
            <TextField
              label="Accent color"
              helperText="Use a hex value, e.g. #7a6cff"
              value={editColor}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditColor(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="inherit" onClick={handleEditSave}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TimerPanel;
