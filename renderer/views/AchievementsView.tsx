import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAchievements, type Achievement } from '../context/AchievementsContext';

const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'bronze':
      return '#cd7f32';
    case 'silver':
      return '#c0c0c0';
    case 'gold':
      return '#ffd700';
    case 'platinum':
      return '#e5e4e2';
    default:
      return '#7a6cff';
  }
};

type AchievementCardProps = {
  achievement: Achievement;
};

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const tierColor = getTierColor(achievement.tier);
  const progressPercent = (achievement.progress / achievement.target) * 100;

  return (
    <Card
      sx={{
        borderRadius: 0,
        border: achievement.unlocked
          ? `1px solid ${alpha(tierColor, 0.4)}`
          : '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
        opacity: achievement.unlocked ? 1 : 0.6,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: achievement.unlocked ? 'translateY(-4px)' : 'none',
          boxShadow: achievement.unlocked ? `0 8px 24px ${alpha(tierColor, 0.2)}` : 'none'
        }
      }}
    >
      {achievement.unlocked && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 70% 30%, ${alpha(tierColor, 0.15)}, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />
      )}

      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                fontSize: 48,
                lineHeight: 1,
                filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
              }}
            >
              {achievement.icon}
            </Box>
            {achievement.unlocked ? (
              <CheckCircleIcon sx={{ color: tierColor, fontSize: 28 }} />
            ) : (
              <LockIcon sx={{ color: 'text.disabled', fontSize: 28 }} />
            )}
          </Stack>

          {/* Title & Description */}
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                {achievement.name}
              </Typography>
              <Chip
                label={achievement.tier}
                size="small"
                sx={{
                  bgcolor: alpha(tierColor, 0.2),
                  color: tierColor,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: 10,
                  height: 20
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {achievement.description}
            </Typography>
          </Stack>

          {/* Progress */}
          {!achievement.unlocked && (
            <Stack spacing={0.75}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: tierColor,
                    borderRadius: 999
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {achievement.progress} / {achievement.target} ({Math.round(progressPercent)}%)
              </Typography>
            </Stack>
          )}

          {/* Unlocked Date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <Typography variant="caption" color="text.secondary">
              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const AchievementsView: React.FC = () => {
  const { achievements, unlockedAchievements, lockedAchievements } = useAchievements();
  const [tabValue, setTabValue] = React.useState(0);

  const filteredAchievements = useMemo(() => {
    if (tabValue === 0) return achievements;
    if (tabValue === 1) return unlockedAchievements;
    return lockedAchievements;
  }, [tabValue, achievements, unlockedAchievements, lockedAchievements]);

  const stats = useMemo(
    () => ({
      total: achievements.length,
      unlocked: unlockedAchievements.length,
      progress: (unlockedAchievements.length / achievements.length) * 100
    }),
    [achievements, unlockedAchievements]
  );

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack spacing={1.5}>
        <Typography variant="h4" fontWeight={700}>
          Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Unlock badges by hitting milestones and staying consistent with your study sessions.
        </Typography>
      </Stack>

      {/* Stats Overview */}
      <Card sx={{ borderRadius: 0, border: '1px solid rgba(122,108,255,0.25)' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack>
                <Typography variant="overline" color="text.secondary">
                  ACHIEVEMENT PROGRESS
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {stats.unlocked} / {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(stats.progress)}% Complete
                </Typography>
              </Stack>
              <Box
                sx={{
                  fontSize: 72,
                  lineHeight: 1
                }}
              >
                🏆
              </Box>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={stats.progress}
              sx={{
                height: 10,
                borderRadius: 999,
                bgcolor: 'rgba(122,108,255,0.15)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#7a6cff',
                  borderRadius: 999
                }
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${achievements.length})`} />
          <Tab label={`Unlocked (${unlockedAchievements.length})`} />
          <Tab label={`Locked (${lockedAchievements.length})`} />
        </Tabs>
      </Box>

      {/* Achievement Grid */}
      <Grid container spacing={2}>
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => (
            <Grid key={achievement.key} item xs={12} sm={6} md={4} lg={3}>
              <AchievementCard achievement={achievement} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 0 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No achievements found in this category.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
};

export default AchievementsView;
