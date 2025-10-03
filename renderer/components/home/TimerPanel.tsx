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
import TimerIcon from '@mui/icons-material/TimerOutlined';
import NightlightIcon from '@mui/icons-material/NightlightRound';
import ClearIcon from '@mui/icons-material/Clear';
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

const TimerPanel: React.FC = () => {
  const {
    subjects,
    totalFocusSeconds,
    breakSeconds,
    history,
    activeSubjectId,
    lastSubjectId,
    isRunning,
    isBreakActive,
    toggleSubject,
    pauseTimer,
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
  const [todoDrafts, setTodoDrafts] = useState<Record<string, string>>({});
  const addButtonLabel = 'Add';

  const now = useMemo(() => new Date(), []);

  const activeSubject = activeSubjectId ? subjects.find((subject) => subject.id === activeSubjectId) ?? null : null;
  const lastSubject = lastSubjectId ? subjects.find((subject) => subject.id === lastSubjectId) ?? null : null;

  const primaryTime = useMemo(() => formatDuration(totalFocusSeconds), [totalFocusSeconds]);
  const breakSecondsToday = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return history[key]?.breakSeconds ?? breakSeconds;
  }, [history, breakSeconds]);

  const breakTimeDisplay = useMemo(() => formatDuration(breakSecondsToday), [breakSecondsToday]);

  const statusText = useMemo(() => {
    if (isBreakActive) {
      return `On break • ${breakTimeDisplay}`;
    }
    if (activeSubject) {
      return `Focusing on ${activeSubject.name}`;
    }
    if (lastSubject) {
      return `Ready to resume ${lastSubject.name}`;
    }
    return 'Idle';
  }, [isBreakActive, lastSubject, breakTimeDisplay, activeSubject]);

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

  const handleTodoDraftChange = (subjectId: string, value: string) => {
    setTodoDrafts((prev) => ({ ...prev, [subjectId]: value }));
  };

  const submitTodo = (subjectId: string) => {
    const draft = (todoDrafts[subjectId] ?? '').trim();
    if (!draft) return;
    addTodo(subjectId, draft);
    setTodoDrafts((prev) => ({ ...prev, [subjectId]: '' }));
  };

  const renderSubjectControls = (subject: StudySubject) => {
    const isActive = activeSubjectId === subject.id;
    const handlePrimaryClick = () => {
      if (isActive && isRunning) {
        pauseTimer();
      } else {
        toggleSubject(subject.id);
      }
    };
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          size="small"
          onClick={handlePrimaryClick}
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
      </Stack>
    );
  };

  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          position: 'sticky',
          top: 44,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          py: 0.25,
          bgcolor: 'background.default',
          mb: 0.5
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

      <Card sx={{ mt: 0 }}>
        <CardContent sx={{ py: 5, px: 2 }}>
          <Stack spacing={0.5} alignItems="center">
            <Typography
              variant="h2"
              sx={{ fontVariantNumeric: 'tabular-nums', fontSize: { xs: 32, sm: 44, md: 52 }, lineHeight: 1.05, textAlign: 'center', width: '100%' }}
            >
              {primaryTime}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {statusText}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              Subjects
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75}>
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

            <Stack spacing={1}>
              {subjects.map((subject) => (
                <React.Fragment key={subject.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
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
                  <Stack spacing={0.75} sx={{ px: 4, py: 1, bgcolor: 'rgba(255,255,255,0.02)' }}>
                  {subject.todos.length ? (
                    subject.todos.map((todo: SubjectTodo) => (
                      <Box
                        key={todo.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography
                          variant="body2"
                          onClick={() => toggleTodo(subject.id, todo.id)}
                          sx={{
                            cursor: 'pointer',
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? 'text.disabled' : 'text.primary'
                          }}
                        >
                          {todo.text}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeTodo(subject.id, todo.id)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <ClearIcon fontSize="inherit" />
                        </IconButton>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No todos yet. Add one below.
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add todo"
                      value={todoDrafts[subject.id] ?? ''}
                      onChange={(event) => handleTodoDraftChange(subject.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          submitTodo(subject.id);
                        }
                      }}
                    />
                    <Button variant="contained" color="inherit" onClick={() => submitTodo(subject.id)}>
                      {addButtonLabel}
                    </Button>
                  </Stack>
                  </Stack>
                </React.Fragment>
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
    </Stack>
  );
};

export default TimerPanel;
