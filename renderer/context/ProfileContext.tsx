import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type UserProfile = {
  nickname: string;
  country: string;
  status?: string;
};

type ProfileContextValue = {
  profile: UserProfile | null;
  ready: boolean;
  saveProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
};

const STORAGE_KEY = 'ypt:profile:v1';

const readProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed?.nickname || !parsed?.country) return null;
    return parsed;
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
    setProfile(next);
    writeProfile(next);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev) => {
        const next = { ...(prev ?? { nickname: '', country: '', status: '' }), ...updates } as UserProfile;
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
