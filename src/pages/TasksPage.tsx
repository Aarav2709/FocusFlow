import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import PageContainer from '@components/PageContainer';
import { useAppStore } from '@state/store';
import type { AppStore, Task } from '@state/store';

interface TaskDraft {
  title: string;
  dueDate: string;
}

const emptyDraft: TaskDraft = {
  title: '',
  dueDate: ''
};

const TasksPage = () => {
  const tasks = useAppStore((state: AppStore) => state.tasks);
  const createTask = useAppStore((state: AppStore) => state.createTask);
  const toggleTask = useAppStore((state: AppStore) => state.toggleTask);
  const deleteTask = useAppStore((state: AppStore) => state.deleteTask);
  const reloadTasks = useAppStore((state: AppStore) => state.reloadTasks);
  const toast = useToast();

  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);

  useEffect(() => {
    void reloadTasks();
  }, [reloadTasks]);

  const ordered = useMemo<Task[]>(
    () =>
      [...tasks].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [tasks]
  );

  const handleCreate = async () => {
    if (!draft.title.trim()) {
      toast({ description: 'Task title cannot be empty', status: 'warning' });
      return;
    }
    await createTask({ title: draft.title.trim(), dueDate: draft.dueDate || null });
    setDraft(emptyDraft);
  };

  const handleToggle = async (task: Task) => {
    await toggleTask(task.id, !task.completed);
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
  };

  return (
    <PageContainer
      title="Tasks"
      description="Organise your study plan with due dates and completion tracking."
      spacing={6}
      actions={
        <HStack>
          <Button variant="outline" onClick={() => setDraft(emptyDraft)}>
            Clear
          </Button>
          <Button colorScheme="brand" onClick={handleCreate}>
            Add task
          </Button>
        </HStack>
      }
    >
      <Stack spacing={4} bg="rgba(28, 30, 38, 0.9)" p={5} rounded="2xl" border="1px solid rgba(255,255,255,0.05)">
        <Input
          placeholder="Task title"
          value={draft.title}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft((prev: TaskDraft) => ({ ...prev, title: event.target.value }))
          }
        />
        <Input
          type="date"
          placeholder="Due date"
          value={draft.dueDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft((prev: TaskDraft) => ({ ...prev, dueDate: event.target.value }))
          }
        />
      </Stack>

      <VStack spacing={3} align="stretch">
        {ordered.length === 0 && (
          <Box bg="rgba(28, 30, 38, 0.85)" p={4} rounded="xl" border="1px solid rgba(255,255,255,0.05)">
            <Text color="gray.400">No tasks yet. Add your first learning goal.</Text>
          </Box>
        )}
  {ordered.map((task: Task) => (
          <HStack
            key={task.id}
            bg="rgba(32, 35, 45, 0.9)"
            border="1px solid rgba(255,255,255,0.05)"
            rounded="xl"
            px={4}
            py={3}
            spacing={4}
            justify="space-between"
          >
            <HStack spacing={4} align="flex-start">
              <Checkbox isChecked={task.completed} onChange={() => void handleToggle(task)} size="lg" colorScheme="brand" />
              <Box>
                <Text fontWeight="semibold" textDecoration={task.completed ? 'line-through' : 'none'}>
                  {task.title}
                </Text>
                {task.dueDate && (
                  <Text fontSize="sm" color="gray.400">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </Text>
                )}
              </Box>
            </HStack>
            <Button size="sm" variant="ghost" color="red.300" onClick={() => void handleDelete(task)}>
              Delete
            </Button>
          </HStack>
        ))}
      </VStack>
    </PageContainer>
  );
};

export default TasksPage;
