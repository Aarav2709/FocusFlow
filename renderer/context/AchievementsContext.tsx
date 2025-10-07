import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AchievementKey =
  | 'first_session'
  | 'focus_10h'
  | 'focus_50h'
  | 'focus_100h'
  | 'focus_500h'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_100'
  | 'sessions_10'
  | 'sessions_50'
  | 'sessions_100'
  | 'sessions_500'
  | 'daily_goal_7'
  | 'daily_goal_30'
  | 'early_bird'
  | 'night_owl'
  | 'weekend_warrior'
  | 'quest_master'
  | 'level_5'
  | 'level_10'
  | 'level_20';

export type Achievement = {
  key: AchievementKey;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  target: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
};

type AchievementContextValue = {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  checkAchievements: (stats: StudyStats) => Achievement[];
  unlockAchievement: (key: AchievementKey) => void;
};

export type StudyStats = {
  totalFocusMinutes: number;
  currentStreak: number;
  totalSessions: number;
  earlyBirdSessions: number;
  nightOwlSessions: number;
  weekendSessions: number;
  dailyGoalsHit: number;
  completedQuests: number;
  currentLevel: number;
};

const STORAGE_KEY = 'focusflow:achievements:v1';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  // Focus Time Milestones
  {
    key: 'first_session',
    name: 'First Steps',
    description: 'Complete your first focus session.',
    icon: '🌱',
    tier: 'bronze',
    target: 1
  },
  {
    key: 'focus_10h',
    name: 'Focus Initiate',
    description: 'Log 10 hours of total focus time.',
    icon: '⏱️',
    tier: 'bronze',
    target: 600
  },
  {
    key: 'focus_50h',
    name: 'Focus Apprentice',
    description: 'Log 50 hours of total focus time.',
    icon: '🎯',
    tier: 'silver',
    target: 3000
  },
  {
    key: 'focus_100h',
    name: 'Focus Scholar',
    description: 'Log 100 hours of total focus time.',
    icon: '📚',
    tier: 'gold',
    target: 6000
  },
  {
    key: 'focus_500h',
    name: 'Focus Master',
    description: 'Log 500 hours of total focus time.',
    icon: '🏆',
    tier: 'platinum',
    target: 30000
  },

  // Streak Achievements
  {
    key: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day study streak.',
    icon: '🔥',
    tier: 'bronze',
    target: 3
  },
  {
    key: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day study streak.',
    icon: '⚡',
    tier: 'silver',
    target: 7
  },
  {
    key: 'streak_14',
    name: 'Fortnight Champion',
    description: 'Maintain a 14-day study streak.',
    icon: '💫',
    tier: 'gold',
    target: 14
  },
  {
    key: 'streak_30',
    name: 'Monthly Dedication',
    description: 'Maintain a 30-day study streak.',
    icon: '🌟',
    tier: 'gold',
    target: 30
  },
  {
    key: 'streak_100',
    name: 'Unstoppable Force',
    description: 'Maintain a 100-day study streak.',
    icon: '👑',
    tier: 'platinum',
    target: 100
  },

  // Session Count
  {
    key: 'sessions_10',
    name: 'Consistency Starter',
    description: 'Complete 10 focus sessions.',
    icon: '📝',
    tier: 'bronze',
    target: 10
  },
  {
    key: 'sessions_50',
    name: 'Session Pro',
    description: 'Complete 50 focus sessions.',
    icon: '📊',
    tier: 'silver',
    target: 50
  },
  {
    key: 'sessions_100',
    name: 'Century Club',
    description: 'Complete 100 focus sessions.',
    icon: '💯',
    tier: 'gold',
    target: 100
  },
  {
    key: 'sessions_500',
    name: 'Session Legend',
    description: 'Complete 500 focus sessions.',
    icon: '🎖️',
    tier: 'platinum',
    target: 500
  },

  // Daily Goals
  {
    key: 'daily_goal_7',
    name: 'Week of Success',
    description: 'Hit your daily goal 7 days in a row.',
    icon: '✅',
    tier: 'silver',
    target: 7
  },
  {
    key: 'daily_goal_30',
    name: 'Monthly Excellence',
    description: 'Hit your daily goal 30 days in a row.',
    icon: '🎯',
    tier: 'platinum',
    target: 30
  },

  // Time-Based
  {
    key: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 sessions before 8 AM.',
    icon: '🌅',
    tier: 'gold',
    target: 10
  },
  {
    key: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 10 sessions after 10 PM.',
    icon: '🌙',
    tier: 'gold',
    target: 10
  },
  {
    key: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 20 weekend study sessions.',
    icon: '🎮',
    tier: 'silver',
    target: 20
  },

  // Quests & Levels
  {
    key: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 100 focus quests.',
    icon: '⚔️',
    tier: 'gold',
    target: 100
  },
  {
    key: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5.',
    icon: '⭐',
    tier: 'bronze',
    target: 5
  },
  {
    key: 'level_10',
    name: 'Experienced Scholar',
    description: 'Reach level 10.',
    icon: '🌟',
    tier: 'silver',
    target: 10
  },
  {
    key: 'level_20',
    name: 'Elite Achiever',
    description: 'Reach level 20.',
    icon: '💎',
    tier: 'platinum',
    target: 20
  }
];

const loadAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') {
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({ ...def, progress: 0, unlocked: false }));
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return ACHIEVEMENT_DEFINITIONS.map((def) => ({ ...def, progress: 0, unlocked: false }));
    }

    const saved = JSON.parse(raw) as Record<string, { progress: number; unlocked: boolean; unlockedAt?: string }>;
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      progress: saved[def.key]?.progress ?? 0,
      unlocked: saved[def.key]?.unlocked ?? false,
      unlockedAt: saved[def.key]?.unlockedAt
    }));
  } catch {
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({ ...def, progress: 0, unlocked: false }));
  }
};

const saveAchievements = (achievements: Achievement[]) => {
  if (typeof window === 'undefined') return;
  try {
    const toSave = achievements.reduce((acc, achievement) => {
      acc[achievement.key] = {
        progress: achievement.progress,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt
      };
      return acc;
    }, {} as Record<string, { progress: number; unlocked: boolean; unlockedAt?: string }>);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('[AchievementsContext] Failed to save achievements', err);
  }
};

const AchievementsContext = createContext<AchievementContextValue | null>(null);

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());

  useEffect(() => {
    saveAchievements(achievements);
  }, [achievements]);

  const checkAchievements = useCallback((stats: StudyStats): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];

    setAchievements((prev) =>
      prev.map((achievement) => {
        if (achievement.unlocked) return achievement;

        let currentProgress = 0;

        // Calculate progress based on achievement type
        switch (achievement.key) {
          case 'first_session':
          case 'sessions_10':
          case 'sessions_50':
          case 'sessions_100':
          case 'sessions_500':
            currentProgress = stats.totalSessions;
            break;
          case 'focus_10h':
          case 'focus_50h':
          case 'focus_100h':
          case 'focus_500h':
            currentProgress = stats.totalFocusMinutes;
            break;
          case 'streak_3':
          case 'streak_7':
          case 'streak_14':
          case 'streak_30':
          case 'streak_100':
            currentProgress = stats.currentStreak;
            break;
          case 'early_bird':
            currentProgress = stats.earlyBirdSessions;
            break;
          case 'night_owl':
            currentProgress = stats.nightOwlSessions;
            break;
          case 'weekend_warrior':
            currentProgress = stats.weekendSessions;
            break;
          case 'daily_goal_7':
          case 'daily_goal_30':
            currentProgress = stats.dailyGoalsHit;
            break;
          case 'quest_master':
            currentProgress = stats.completedQuests;
            break;
          case 'level_5':
          case 'level_10':
          case 'level_20':
            currentProgress = stats.currentLevel;
            break;
          default:
            currentProgress = 0;
        }

        const shouldUnlock = currentProgress >= achievement.target;

        if (shouldUnlock) {
          newlyUnlocked.push({ ...achievement, progress: currentProgress, unlocked: true });
          return {
            ...achievement,
            progress: currentProgress,
            unlocked: true,
            unlockedAt: new Date().toISOString()
          };
        }

        return {
          ...achievement,
          progress: Math.min(currentProgress, achievement.target)
        };
      })
    );

    return newlyUnlocked;
  }, []);

  const unlockAchievement = useCallback((key: AchievementKey) => {
    setAchievements((prev) =>
      prev.map((achievement) =>
        achievement.key === key && !achievement.unlocked
          ? {
              ...achievement,
              progress: achievement.target,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            }
          : achievement
      )
    );
  }, []);

  const unlockedAchievements = useMemo(() => achievements.filter((a) => a.unlocked), [achievements]);
  const lockedAchievements = useMemo(() => achievements.filter((a) => !a.unlocked), [achievements]);

  const value = useMemo<AchievementContextValue>(
    () => ({
      achievements,
      unlockedAchievements,
      lockedAchievements,
      checkAchievements,
      unlockAchievement
    }),
    [achievements, unlockedAchievements, lockedAchievements, checkAchievements, unlockAchievement]
  );

  return <AchievementsContext.Provider value={value}>{children}</AchievementsContext.Provider>;
};

export const useAchievements = (): AchievementContextValue => {
  const context = useContext(AchievementsContext);
  if (!context) throw new Error('useAchievements must be used within AchievementsProvider');
  return context;
};
