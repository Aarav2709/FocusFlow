import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export const DEFAULT_DAILY_TARGET_MINUTES = 90;
export const DEFAULT_DDAY_DATE = '2026-11-01'; // Default target date

export type UserProfile = {
  nickname: string;
  country: string;
  status?: string;
  dailyTargetMinutes?: number;
  dDayDate?: string; // ISO date string for D-Day target
};

type ProfileContextValue = {
  profile: UserProfile | null;
  ready: boolean;
  saveProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
};

const STORAGE_KEY = 'focusflow:profile:v1';

const sanitizeDailyTarget = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return DEFAULT_DAILY_TARGET_MINUTES;
  }
  return Math.min(1440, Math.round(value));
};

const applyDefaults = (profile: UserProfile | null): UserProfile | null => {
  if (!profile) return null;
  return {
    nickname: profile.nickname,
    country: profile.country,
    status: profile.status ?? '',
    dailyTargetMinutes: sanitizeDailyTarget(profile.dailyTargetMinutes),
    dDayDate: profile.dDayDate ?? DEFAULT_DDAY_DATE
  };
};

const readProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed?.nickname || !parsed?.country) return null;
    return applyDefaults(parsed);
  } catch (err) {
    console.warn('[ProfileContext] failed to read profile', err);
    return null;
  }
};

const writeProfile = (profile: UserProfile | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (!profile) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  } catch (err) {
    console.warn('[ProfileContext] failed to persist profile', err);
  }
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => readProfile());
  const [ready] = useState(true);

  const saveProfile = useCallback((next: UserProfile) => {
    const normalized = applyDefaults(next);
    if (!normalized) return;
    setProfile(normalized);
    writeProfile(normalized);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev) => {
        const base: UserProfile = prev ?? {
          nickname: '',
          country: '',
          status: '',
          dailyTargetMinutes: DEFAULT_DAILY_TARGET_MINUTES,
          dDayDate: DEFAULT_DDAY_DATE
        };
        const next = applyDefaults({
          ...base,
          ...updates,
          dailyTargetMinutes: sanitizeDailyTarget(updates.dailyTargetMinutes ?? base.dailyTargetMinutes),
          dDayDate: updates.dDayDate ?? base.dDayDate
        });
        if (!next) {
          writeProfile(null);
          return null;
        }
        writeProfile(next);
        return next;
      });
    },
    []
  );

  const resetProfile = useCallback(() => {
    setProfile(null);
    writeProfile(null);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, ready, saveProfile, updateProfile, resetProfile }),
    [profile, ready, saveProfile, updateProfile, resetProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
