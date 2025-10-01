import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/TimerOutlined';
import NightlightIcon from '@mui/icons-material/NightlightRound';
import { useStudy, StudySubject, SubjectTodo } from '../../context/StudyContext';

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

type SubjectMenuState = {
  anchor: HTMLElement | null;
  subject: StudySubject | null;
};

type TodoDialogState = {
  open: boolean;
  subjectId: string | null;
};

const TimerPanel: React.FC = () => {
  const {
    subjects,
    totalFocusSeconds,
    breakSeconds,
    activeSubjectId,
    isRunning,
    isBreakActive,
    toggleSubject,
    pauseTimer,
    startBreak,
    resetSubject,
    addSubject,
    updateSubject,
    removeSubject,
    addTodo,
    toggleTodo,
    removeTodo
  } = useStudy();

  const [newSubject, setNewSubject] = useState('');
  const [menuState, setMenuState] = useState<SubjectMenuState>({ anchor: null, subject: null });
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [todoDialog, setTodoDialog] = useState<TodoDialogState>({ open: false, subjectId: null });
  const [newTodo, setNewTodo] = useState('');

  const now = useMemo(() => new Date(), []);

  const activeSubject = activeSubjectId ? subjects.find((subject) => subject.id === activeSubjectId) ?? null : null;

  const currentTimerSeconds = useMemo(() => {
    if (isBreakActive) return breakSeconds;
    if (activeSubject) return activeSubject.totalSeconds;
    return totalFocusSeconds;
  }, [isBreakActive, breakSeconds, activeSubject, totalFocusSeconds]);

  const primaryTime = useMemo(() => formatDuration(currentTimerSeconds), [currentTimerSeconds]);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    addSubject(newSubject.trim());
    setNewSubject('');
  };

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, subject: StudySubject) => {
    setMenuState({ anchor: event.currentTarget, subject });
  };

  const closeMenu = () => setMenuState({ anchor: null, subject: null });

  const openEditDialog = () => {
    if (!menuState.subject) return;
    setEditName(menuState.subject.name);
    setEditColor(menuState.subject.color);
    setEditDialogOpen(true);
    closeMenu();
  };

  const handleEditSave = () => {
    if (!menuState.subject) return;
    updateSubject(menuState.subject.id, { name: editName.trim() || menuState.subject.name, color: editColor.trim() });
    setEditDialogOpen(false);
  };

  const handleDeleteSubject = () => {
    if (!menuState.subject) return;
    removeSubject(menuState.subject.id);
    closeMenu();
  };

  const openTodos = (subject: StudySubject) => {
    setTodoDialog({ open: true, subjectId: subject.id });
    setNewTodo('');
  };

  const closeTodos = () => setTodoDialog({ open: false, subjectId: null });

  const handleAddTodo = () => {
    if (!todoDialog.subjectId || !newTodo.trim()) return;
    addTodo(todoDialog.subjectId, newTodo.trim());
    setNewTodo('');
  };

  const dialogSubject = todoDialog.subjectId ? subjects.find((subject) => subject.id === todoDialog.subjectId) ?? null : null;

  const renderSubjectControls = (subject: StudySubject) => {
    const isActive = activeSubjectId === subject.id;
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          size="small"
          onClick={() => toggleSubject(subject.id)}
          sx={{
            bgcolor: isActive ? subject.color : 'transparent',
            color: isActive ? '#000' : subject.color,
            border: `1px solid ${subject.color}`,
            '&:hover': {
              bgcolor: subject.color,
              color: '#000'
            },
            width: 36,
            height: 36
          }}
        >
          {isActive && isRunning ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </IconButton>
        <IconButton size="small" onClick={() => resetSubject(subject.id)} sx={{ color: 'text.secondary' }}>
          <RestartAltIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={(event) => openMenu(event, subject)} sx={{ color: 'text.secondary' }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => openTodos(subject)} sx={{ color: 'text.secondary' }}>
          <AssignmentIcon fontSize="small" />
        </IconButton>
      </Stack>
    );
  };

  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          position: 'sticky',
          top: 56,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          py: 1,
          bgcolor: 'background.default'
        }}
      >
        <IconButton sx={{ color: 'text.secondary' }}>
          <TimerIcon />
        </IconButton>
        <Typography variant="subtitle1" color="text.secondary">
          {dateString}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <NightlightIcon fontSize="small" color="disabled" />
          <Typography variant="body2" color="text.secondary">
            D-0
          </Typography>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={1} alignItems="center">
            <Typography variant="h2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {primaryTime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isBreakActive
                ? 'On break'
                : activeSubject
                  ? `Focusing on ${activeSubject.name}`
                  : 'Idle'}
            </Typography>
            <Stack direction="row" spacing={1}>
              {activeSubjectId || isBreakActive ? (
                <Button variant="contained" color="inherit" onClick={pauseTimer}>
                  Pause
                </Button>
              ) : null}
              <Button
                variant={isBreakActive ? 'contained' : 'outlined'}
                color="inherit"
                onClick={startBreak}
                startIcon={<NightlightIcon fontSize="small" />}
              >
                {isBreakActive ? 'End Break' : 'Start Break'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600}>
              Subjects
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                placeholder="New subject"
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                size="small"
              />
              <Button variant="contained" color="inherit" onClick={handleAddSubject}>
                Add
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {subjects.map((subject) => (
                <Box
                  key={subject.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 1,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.04)'
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: subject.color, color: '#000', fontSize: 14 }}>
                      {subject.name.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Stack>
                      <Typography variant="body1" fontWeight={600}>
                        {subject.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDuration(subject.totalSeconds)}
                      </Typography>
                    </Stack>
                  </Stack>
                  {renderSubjectControls(subject)}
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Menu anchorEl={menuState.anchor} open={Boolean(menuState.anchor)} onClose={closeMenu}>
        <MenuItem onClick={openEditDialog}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteSubject}>Delete</MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit subject</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={editName} onChange={(event) => setEditName(event.target.value)} />
            <TextField
              label="Accent color"
              helperText="Use hex value e.g. #ff6b6b"
              value={editColor}
              onChange={(event) => setEditColor(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="inherit" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={todoDialog.open} onClose={closeTodos} maxWidth="sm" fullWidth>
        <DialogTitle>
          Todos · {dialogSubject?.name ?? ''}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder="Add todo"
                value={newTodo}
                onChange={(event) => setNewTodo(event.target.value)}
              />
              <Button variant="contained" color="inherit" onClick={handleAddTodo}>
                Add
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {dialogSubject?.todos.length ? (
                dialogSubject.todos.map((todo: SubjectTodo) => (
                  <Box
                    key={todo.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.05)'
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                      onClick={() => dialogSubject && toggleTodo(dialogSubject.id, todo.id)}
                    >
                      {todo.text}
                    </Typography>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => dialogSubject && removeTodo(dialogSubject.id, todo.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No todos yet. Add the tasks you want linked to this subject.
                </Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTodos}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TimerPanel;
