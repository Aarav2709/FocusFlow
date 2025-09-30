import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  useColorMode,
  useToast
} from '@chakra-ui/react';
import PageContainer from '@components/PageContainer';
import { useAppStore } from '@state/store';
import type { AppSettings, PomodoroSettings } from '@state/types';
import type { AppStore } from '@state/store';

type ThemeOption = 'light' | 'dark';

const SettingsPage = () => {
  const settings = useAppStore((state: AppStore) => state.settings);
  const updateSetting = useAppStore((state: AppStore) => state.updateSetting);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [pomodoro, setPomodoro] = useState<PomodoroSettings>({ focus: 25, shortBreak: 5, longBreak: 15 });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!settings) {
      return;
    }
    setTheme(settings.theme);
    setPomodoro(settings.pomodoro);
  }, [settings]);

  const themeIsDark = useMemo(() => theme === 'dark', [theme]);

  const handleThemeToggle = async (nextTheme: ThemeOption) => {
    setTheme(nextTheme);
    if (settings?.theme !== nextTheme) {
      await updateSetting('theme', nextTheme);
      if (colorMode !== nextTheme) {
        toggleColorMode();
      }
    }
    toast({ description: `Theme switched to ${nextTheme}.`, status: 'success' });
  };

  const handlePomodoroChange = (key: keyof PomodoroSettings, value: number) => {
    setPomodoro((prev: PomodoroSettings) => ({
      ...prev,
      [key]: Number.isFinite(value) && value > 0 ? value : prev[key]
    }));
  };

  const handleSavePomodoro = async () => {
    setSaving(true);
    try {
      await updateSetting('pomodoro', pomodoro);
      toast({ description: 'Pomodoro settings saved.', status: 'success' });
    } catch (error) {
      console.error('Failed to update pomodoro', error);
      toast({ description: 'Failed to update pomodoro settings.', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title="Settings"
      description="Tune the desktop app experience to match your study rhythm."
      spacing={6}
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box bg="rgba(24, 26, 35, 0.9)" border="1px solid rgba(255,255,255,0.06)" rounded="2xl" p={5}>
          <Stack spacing={4}>
            <Text fontWeight="semibold">Appearance</Text>
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel mb="0">Dark mode</FormLabel>
              <Switch
                isChecked={themeIsDark}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  void handleThemeToggle(event.target.checked ? 'dark' : 'light')
                }
              />
            </FormControl>
            <HStack spacing={3}>
              <Button variant="outline" onClick={() => handleThemeToggle('light')} isDisabled={theme === 'light'}>
                Light
              </Button>
              <Button variant="outline" onClick={() => handleThemeToggle('dark')} isDisabled={theme === 'dark'}>
                Dark
              </Button>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Switch between light and dark themes. The setting is saved locally and synced with the mobile app when
              available.
            </Text>
          </Stack>
        </Box>

        <Box bg="rgba(28, 30, 40, 0.9)" border="1px solid rgba(255,255,255,0.06)" rounded="2xl" p={5}>
          <Stack spacing={4}>
            <Text fontWeight="semibold">Pomodoro durations</Text>
            <Text fontSize="sm" color="gray.500">
              Adjust intervals to match your focus stamina. Saving updates the timer instantly.
            </Text>
            <FormControl>
              <FormLabel>Focus (minutes)</FormLabel>
              <NumberInput
                value={pomodoro.focus}
                min={5}
                max={120}
                onChange={(_value: string, valueAsNumber: number) =>
                  handlePomodoroChange('focus', valueAsNumber)
                }
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Short break (minutes)</FormLabel>
              <NumberInput
                value={pomodoro.shortBreak}
                min={1}
                max={30}
                onChange={(_value: string, valueAsNumber: number) =>
                  handlePomodoroChange('shortBreak', valueAsNumber)
                }
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Long break (minutes)</FormLabel>
              <NumberInput
                value={pomodoro.longBreak}
                min={5}
                max={60}
                onChange={(_value: string, valueAsNumber: number) =>
                  handlePomodoroChange('longBreak', valueAsNumber)
                }
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <Button colorScheme="brand" onClick={handleSavePomodoro} isLoading={saving} loadingText="Saving">
              Save Pomodoro settings
            </Button>
          </Stack>
        </Box>
      </SimpleGrid>
    </PageContainer>
  );
};

export default SettingsPage;
