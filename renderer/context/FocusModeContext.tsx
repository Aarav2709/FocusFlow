import { createContext, ReactNode, useContext, useState, useEffect } from 'react';

export interface BlockedWebsite {
  id: string;
  url: string;
  enabled: boolean;
}

export interface BlockedApp {
  id: string;
  name: string;
  path: string;
  enabled: boolean;
}

interface FocusModeContextType {
  isActive: boolean;
  blockedWebsites: BlockedWebsite[];
  blockedApps: BlockedApp[];
  fullscreen: boolean;
  toggleFocusMode: () => void;
  addWebsite: (url: string) => void;
  removeWebsite: (id: string) => void;
  addApp: (name: string, path: string) => void;
  removeApp: (id: string) => void;
  setFullscreen: (enabled: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [blockedWebsites, setBlockedWebsites] = useState<BlockedWebsite[]>([]);
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const websites = localStorage.getItem('blockedWebsites');
    const apps = localStorage.getItem('blockedApps');
    if (websites) setBlockedWebsites(JSON.parse(websites));
    if (apps) setBlockedApps(JSON.parse(apps));
  }, []);

  useEffect(() => {
    localStorage.setItem('blockedWebsites', JSON.stringify(blockedWebsites));
  }, [blockedWebsites]);

  useEffect(() => {
    localStorage.setItem('blockedApps', JSON.stringify(blockedApps));
  }, [blockedApps]);

  const toggleFocusMode = () => {
    setIsActive((prev) => !prev);
  };

  const addWebsite = (url: string) => {
    const id = `web-${Date.now()}`;
    setBlockedWebsites((prev) => [...prev, { id, url, enabled: true }]);
  };

  const removeWebsite = (id: string) => {
    setBlockedWebsites((prev) => prev.filter((w) => w.id !== id));
  };

  const addApp = (name: string, path: string) => {
    const id = `app-${Date.now()}`;
    setBlockedApps((prev) => [...prev, { id, name, path, enabled: true }]);
  };

  const removeApp = (id: string) => {
    setBlockedApps((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <FocusModeContext.Provider
      value={{
        isActive,
        blockedWebsites,
        blockedApps,
        fullscreen,
        toggleFocusMode,
        addWebsite,
        removeWebsite,
        addApp,
        removeApp,
        setFullscreen,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within FocusModeProvider');
  }
  return context;
}
