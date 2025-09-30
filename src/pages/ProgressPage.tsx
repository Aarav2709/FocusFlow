import { useEffect, useMemo } from 'react';
import {
  Box,
  Divider,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import PageContainer from '@components/PageContainer';
import StatCard from '@components/StatCard';
import { useAppStore } from '@state/store';
import type { AppStore } from '@state/store';
import type { ProgressSummary, StudySession } from '@state/types';

const emptySummary: ProgressSummary = {
  totalStudyMinutes: 0,
  completedTasks: 0,
  pendingTasks: 0,
  decksCount: 0,
  cardsReviewed: 0
};

const formatHours = (minutes: number) => (minutes / 60).toFixed(1);

const formatTimestamp = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.error('Failed to parse timestamp', error);
    return timestamp;
  }
};

const ProgressPage = () => {
  const progress = useAppStore((state: AppStore) => state.progress);
  const studySessions = useAppStore((state: AppStore) => state.studySessions);
  const reloadProgress = useAppStore((state: AppStore) => state.reloadProgress);

  useEffect(() => {
    void reloadProgress();
  }, [reloadProgress]);

  const summary = useMemo<ProgressSummary>(() => progress ?? emptySummary, [progress]);

  const upcoming = useMemo(() => studySessions.slice(0, 10), [studySessions]);

  return (
    <PageContainer
      title="Progress"
      description="Track your study streaks, completed tasks, and flashcard mastery."
      spacing={6}
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <StatCard title="Study hours" value={`${formatHours(summary.totalStudyMinutes)} h`} />
        <StatCard title="Tasks" value={`${summary.completedTasks}/${summary.pendingTasks + summary.completedTasks}`} />
        <StatCard title="Flashcards" value={`${summary.cardsReviewed} reviewed`} />
      </SimpleGrid>

      <Stack direction={{ base: 'column', lg: 'row' }} spacing={6} align="flex-start">
        <Box flex="1" bg="rgba(28, 30, 38, 0.9)" border="1px solid rgba(255,255,255,0.06)" rounded="2xl" p={5}>
          <Heading size="sm" color="gray.300" mb={4}>
            Study sessions
          </Heading>
          <VStack align="stretch" spacing={3} maxH="360px" overflowY="auto" pr={2}>
            {upcoming.length === 0 && <Text color="gray.500">No sessions logged yet.</Text>}
            {upcoming.map((session: StudySession) => (
              <Box
                key={session.id}
                bg="rgba(18, 20, 28, 0.9)"
                border="1px solid rgba(255,255,255,0.04)"
                rounded="xl"
                p={4}
              >
                <Text fontWeight="semibold" color="gray.200">
                  {session.mode} • {session.durationMinutes} minutes
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatTimestamp(session.loggedAt)}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box flex={{ base: 'unset', lg: '0 0 320px' }} bg="rgba(24, 26, 36, 0.85)" border="1px solid rgba(255,255,255,0.05)" rounded="2xl" p={5}>
          <Heading size="sm" color="gray.300" mb={4}>
            Highlights
          </Heading>
          <Stack spacing={3} color="gray.400" fontSize="sm">
            <Text>
              Total study time: <Text as="span" color="gray.100">{summary.totalStudyMinutes} minutes</Text>
            </Text>
            <Divider borderColor="rgba(255,255,255,0.05)" />
            <Text>
              Completed tasks: <Text as="span" color="green.300">{summary.completedTasks}</Text>
            </Text>
            <Text>
              Pending tasks: <Text as="span" color="yellow.300">{summary.pendingTasks}</Text>
            </Text>
            <Divider borderColor="rgba(255,255,255,0.05)" />
            <Text>
              Decks created: <Text as="span" color="purple.300">{summary.decksCount}</Text>
            </Text>
            <Text>
              Cards reviewed: <Text as="span" color="blue.300">{summary.cardsReviewed}</Text>
            </Text>
          </Stack>
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default ProgressPage;
