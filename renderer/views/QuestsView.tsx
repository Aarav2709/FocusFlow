import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useStudy, StudySubject } from '../context/StudyContext';
import { useProfile, DEFAULT_DAILY_TARGET_MINUTES } from '../context/ProfileContext';
import { XP_PER_MINUTE, computeLevel, tierFromLevel, computeStudyStreak, getTodayKey, StudyHistory } from '../utils/gamification';

type QuestDefinition = {
  id: string;
  title: string;
  target: number;
  unit: string;
  reward: string;
  progressSource: 'focus' | 'streak' | 'todos';
};

type QuestProgress = QuestDefinition & {
  progressValue: number;
  progressPct: number;
  complete: boolean;
};

const QuestsView: React.FC = () => {
  const { subjects, history, totalFocusSeconds, breakSeconds } = useStudy();
  const { profile } = useProfile();
  const dailyTargetMinutes = useMemo(
    () => Math.max(profile?.dailyTargetMinutes ?? DEFAULT_DAILY_TARGET_MINUTES, 1),
    [profile?.dailyTargetMinutes]
  );

  const todayKey = getTodayKey();
  const todayHistory = history[todayKey];

  const todayFocusMinutes = useMemo(() => {
    if (todayHistory) {
      return Math.round(todayHistory.focusSeconds / 60);
    }
    return Math.round(totalFocusSeconds / 60);
  }, [todayHistory, totalFocusSeconds]);

  const todayBreakMinutes = useMemo(() => {
    if (todayHistory) {
      return Math.round(todayHistory.breakSeconds / 60);
    }
    return Math.round(breakSeconds / 60);
  }, [todayHistory, breakSeconds]);

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

  const completedTodos = useMemo(
    () => subjects.reduce((acc, subject: StudySubject) => acc + subject.todos.filter((todo) => todo.completed).length, 0),
    [subjects]
  );

  const quests: QuestProgress[] = useMemo(() => {
    const questSources: Record<QuestDefinition['progressSource'], number> = {
      focus: todayFocusMinutes,
      streak: studyStreak,
      todos: completedTodos
    };

    const definitions: QuestDefinition[] = [
      {
        id: 'daily-focus',
        title: `Log ${dailyTargetMinutes} minutes of deep focus`,
        target: dailyTargetMinutes,
        unit: 'min',
        reward: '+120 XP boost',
        progressSource: 'focus'
      },
      {
        id: 'streak-keeper',
        title: 'Hold a 3-day streak',
        target: 3,
        unit: 'days',
        reward: 'Aurora badge fragment',
        progressSource: 'streak'
      },
      {
        id: 'quest-master',
        title: 'Complete 3 focus quests',
        target: 3,
        unit: 'todos',
        reward: '+1 Momentum charge',
        progressSource: 'todos'
      }
    ];

    return definitions.map((definition) => {
      const progressValue = questSources[definition.progressSource];
      const progressPct = Math.min(1, definition.target === 0 ? 1 : progressValue / definition.target);
      return {
        ...definition,
        progressValue,
        progressPct,
        complete: progressValue >= definition.target
      };
    });
  }, [todayFocusMinutes, studyStreak, completedTodos, dailyTargetMinutes]);

  const nickname = profile?.nickname && profile.nickname.trim().length ? profile.nickname : 'You';

  return (
    <Stack spacing={3}>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 0, border: '1px solid rgba(122,108,255,0.28)', height: '100%', display: 'flex' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SportsEsportsIcon fontSize="small" />
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                  DAILY QUEST BOARD
                </Typography>
              </Stack>
              <Stack spacing={2} sx={{ flex: 1 }}>
                {quests.map((quest) => (
                  <Box
                    key={quest.id}
                    sx={{
                      borderRadius: 0,
                      p: 2.25,
                      border: '1px solid rgba(122,108,255,0.32)',
                      background: quest.complete
                        ? 'linear-gradient(135deg, rgba(122,108,255,0.35), rgba(67,255,210,0.2))'
                        : 'rgba(10,14,40,0.4)'
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {quest.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {quest.progressValue}/{quest.target} {quest.unit}
                          </Typography>
                        </Stack>
                        <Chip
                          size="small"
                          color={quest.complete ? 'secondary' : 'default'}
                          label={quest.complete ? 'Claimed' : quest.reward}
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                      <LinearProgress variant="determinate" value={Math.round(quest.progressPct * 100)} />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card
            sx={{
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.12)',
              height: '100%',
              display: 'flex'
            }}
          >
            <CardContent
              sx={{
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2.5,
                flex: 1
              }}
            >
              <Stack spacing={0.75} alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  Momentum status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep pushing, {nickname}. Claim your rewards once quests hit 100%.
                </Typography>
              </Stack>
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Stack spacing={1.25} alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BoltIcon fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Level {level} • {tier}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {xpToNextLevel} XP to level {level + 1}.
                  </Typography>
                  <LinearProgress variant="determinate" value={Math.round(levelProgress * 100)} />
                </Stack>
                <Stack spacing={1.25} alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {todayBreakMinutes} min of mindful breaks logged today.
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MilitaryTechIcon fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {studyStreak} day{studyStreak === 1 ? '' : 's'} on streak • {completedTodos} quests complete.
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default QuestsView;
