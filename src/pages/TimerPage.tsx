import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  HStack,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import PageContainer from '@components/PageContainer';
import { useAppStore } from '@state/store';
import type { AppStore } from '@state/store';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break'
};

const encouragement: Record<TimerMode, string> = {
  focus: 'Stay locked in and avoid distractions.',
  shortBreak: 'Take a stretch and grab some water.',
  longBreak: 'Recharge fully before the next deep focus block.'
};

const TimerPage = () => {
  const settings = useAppStore((state: AppStore) => state.settings);
  const logStudySession = useAppStore((state: AppStore) => state.logStudySession);
  const reloadProgress = useAppStore((state: AppStore) => state.reloadProgress);
  const toast = useToast();

  const durations = useMemo<Record<TimerMode, number>>(() => {
    const focusMinutes = settings?.pomodoro.focus ?? 25;
    const shortMinutes = settings?.pomodoro.shortBreak ?? 5;
    const longMinutes = settings?.pomodoro.longBreak ?? 15;
    return {
      focus: focusMinutes * 60,
      shortBreak: shortMinutes * 60,
      longBreak: longMinutes * 60
    };
  }, [settings]);

  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durations.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedFocusBlocks, setCompletedFocusBlocks] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSecondsRemaining(durations[mode]);
  }, [durations, mode]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const handleSessionCompletion = useCallback(async () => {
    if (mode === 'focus') {
      const minutes = Math.round(durations.focus / 60);
      await logStudySession({ durationMinutes: minutes, mode: 'focus' });
      setCompletedFocusBlocks((prev: number) => {
        const next = prev + 1;
        const nextMode: TimerMode = next % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        return next;
      });
      toast({ description: 'Focus session complete! Take a break.', status: 'success' });
      await reloadProgress();
    } else {
      setMode('focus');
      toast({ description: 'Break finished. Time to focus!', status: 'info' });
    }
  }, [durations, logStudySession, mode, reloadProgress, toast]);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev: number) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          void handleSessionCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [isRunning, handleSessionCompletion, clearTimer]);

  const handleToggle = () => {
    setIsRunning((prev: boolean) => !prev);
  };

  const handleReset = () => {
    stopTimer();
    setSecondsRemaining(durations[mode]);
  };

  const handleModeChange = (next: TimerMode) => {
    setMode(next);
    stopTimer();
    setSecondsRemaining(durations[next]);
  };

  const totalSeconds = durations[mode];
  const progress = totalSeconds === 0 ? 0 : Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);
  const minutes = Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(secondsRemaining % 60)
    .toString()
    .padStart(2, '0');

  return (
    <PageContainer
      title="Pomodoro"
      description="Structure your deep work sessions with focused intervals and restorative breaks."
      spacing={8}
      actions={
        <HStack>
          <Button variant="outline" onClick={() => handleModeChange('focus')} isDisabled={mode === 'focus'}>
            Focus
          </Button>
          <Button variant="outline" onClick={() => handleModeChange('shortBreak')} isDisabled={mode === 'shortBreak'}>
            Short break
          </Button>
          <Button variant="outline" onClick={() => handleModeChange('longBreak')} isDisabled={mode === 'longBreak'}>
            Long break
          </Button>
        </HStack>
      }
    >
      <Stack align="center" spacing={6} textAlign="center">
        <CircularProgress value={progress} size="320px" thickness="8px" color="brand.400" trackColor="rgba(255,255,255,0.06)">
          <CircularProgressLabel>
            <Stack spacing={1} align="center">
              <Text fontSize="4xl" fontWeight="bold">
                {minutes}:{seconds}
              </Text>
              <Text fontSize="md" color="gray.400">
                {modeLabels[mode]}
              </Text>
            </Stack>
          </CircularProgressLabel>
        </CircularProgress>

        <Text color="gray.400" maxW="320px">
          {encouragement[mode]}
        </Text>

        <HStack spacing={4}>
          <Button colorScheme="brand" onClick={handleToggle}>
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </HStack>

        <Flex gap={6} wrap="wrap" justify="center" color="gray.500" fontSize="sm">
          <Text>{completedFocusBlocks} focus blocks completed</Text>
          <Text>Next break: {mode === 'focus' ? `${durations.focus / 60} minutes` : 'Switch to focus'}</Text>
        </Flex>
      </Stack>
    </PageContainer>
  );
};

export default TimerPage;
