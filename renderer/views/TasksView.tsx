import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import TodayIcon from '@mui/icons-material/TodayOutlined';
import type { Task } from '@shared/types';
import { useAppState } from '../context/AppStateContext';

interface TaskFormState {
  title: string;
  dueDate: string;
}

const emptyTask: TaskFormState = {
  title: '',
  dueDate: ''
};

const TasksView = () => {
  const { tasks, tasksApi } = useAppState();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskFormState>(emptyTask);
  const [saving, setSaving] = useState(false);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDue - bDue;
    });
  }, [tasks]);

  const openDialog = () => {
    setForm(emptyTask);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setForm(emptyTask);
  };

  const formatDueDate = (value: string | null) => {
    if (!value) {
      return 'No due date';
    }
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(value));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      return;
    }
    setSaving(true);
    try {
      await tasksApi.create({
        title: form.title.trim(),
        dueDate: form.dueDate || null
      });
      closeDialog();
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task: Task) => {
    await tasksApi.toggle({ id: task.id, completed: !task.completed });
  };

  const removeTask = async (task: Task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) {
      return;
    }
    await tasksApi.remove(task.id);
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay on top of assignments, deadlines, and habits with daily tracking.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openDialog}>
          Add Task
        </Button>
      </Stack>

      <Stack spacing={2.5}>
        {sortedTasks.map((task) => {
          const overdue = !!task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
          return (
            <Card
              key={task.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: task.completed ? 'rgba(91,124,250,0.35)' : 'rgba(255,255,255,0.08)',
                bgcolor: task.completed ? 'rgba(91,124,250,0.08)' : 'background.paper'
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Checkbox checked={task.completed} onChange={() => toggleTask(task)} />
                  <Stack flex={1} spacing={0.5}>
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TodayIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDueDate(task.dueDate)}
                      </Typography>
                      {overdue && <Chip size="small" color="error" label="Overdue" />}
                    </Stack>
                  </Stack>
                  <IconButton onClick={() => removeTask(task)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        {sortedTasks.length === 0 && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              p: 6,
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: 3,
              color: 'text.secondary'
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              No tasks yet
            </Typography>
            <Typography variant="body2" textAlign="center">
              Add a task to plan your study flow and track completion progress.
            </Typography>
          </Stack>
        )}
      </Stack>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1.5}>
            <TextField
              label="Task"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              autoFocus
            />
            <TextField
              label="Due Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.title.trim()}>
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TasksView;
