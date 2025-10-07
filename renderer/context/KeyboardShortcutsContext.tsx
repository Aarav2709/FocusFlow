import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocusMode } from './FocusModeContext';

interface KeyboardShortcutsContextType {
  enabled: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { toggleFocusMode } = useFocusMode();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const cmdOrCtrl = ctrlKey || metaKey;

      // F - Toggle fullscreen focus mode
      if (key === 'f' && !cmdOrCtrl && !shiftKey) {
        event.preventDefault();
        toggleFocusMode();
      }

      // Ctrl+1-6 - Navigate tabs
      if (cmdOrCtrl && !shiftKey) {
        switch (key) {
          case '1':
            event.preventDefault();
            navigate('/home');
            break;
          case '2':
            event.preventDefault();
            navigate('/quests');
            break;
          case '3':
            event.preventDefault();
            navigate('/achievements');
            break;
          case '4':
            event.preventDefault();
            navigate('/analytics');
            break;
          case '5':
            event.preventDefault();
            navigate('/stats');
            break;
          case '6':
            event.preventDefault();
            navigate('/profile');
            break;
        }
      }

      // Ctrl+K - Command palette (future feature)
      if (cmdOrCtrl && key === 'k') {
        event.preventDefault();
        // Open command palette
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, toggleFocusMode]);

  return (
    <KeyboardShortcutsContext.Provider value={{ enabled: true }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
}
