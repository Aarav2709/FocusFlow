import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Divider, IconButton, Menu, MenuItem, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import MenuIcon from '@mui/icons-material/Menu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';

type Subject = { id: string; name: string; color?: string };

const STORAGE_KEY = 'ypt:subjects:v1';

function hhmmss(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, '0')).join(':');
}

const TimerView: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [{ id: '1', name: 'Maths', color: '#E53935' }, { id: '2', name: 'Science', color: '#1E88E5' }];
      return JSON.parse(raw) as Subject[];
    } catch {
      return [{ id: '1', name: 'Maths', color: '#E53935' }, { id: '2', name: 'Science', color: '#1E88E5' }];
    }
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [elapsedMap, setElapsedMap] = useState<Record<string, number>>(() => ({}));
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    let t: number | undefined;
    if (activeId) {
      t = window.setInterval(() => {
        setElapsedMap((m) => ({ ...m, [activeId]: (m[activeId] ?? 0) + 1 }));
      }, 1000);
    }
    return () => { if (t) window.clearInterval(t); };
  }, [activeId]);

  const totalSeconds = useMemo(() => Object.values(elapsedMap).reduce((a, b) => a + b, 0), [elapsedMap]);

  const startStop = useCallback((id: string) => {
    if (activeId === id) {
      // stop
      setActiveId(null);
      return;
    }
    setActiveId(id);
  }, [activeId]);

  const addSubject = useCallback(() => {
    if (!newSubject.trim()) return;
    const s: Subject = { id: Date.now().toString(), name: newSubject.trim(), color: '#' + Math.floor(Math.random() * 16777215).toString(16) };
    setSubjects((p) => [s, ...p]);
    setNewSubject('');
  }, [newSubject]);

  const totalMinutes = Math.round(totalSeconds / 60);

  // menu & edit state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuSubject, setMenuSubject] = useState<Subject | null>(null);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, s: Subject) => {
    setMenuAnchor(e.currentTarget);
    setMenuSubject(s);
  };
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuSubject(null);
  };

  const handleEditSubject = () => {
    if (!menuSubject) return;
    setEditingSubject(menuSubject);
    setEditingName(menuSubject.name);
    setEditingColor(menuSubject.color ?? '');
    handleCloseMenu();
  };

  const handleDeleteSubject = () => {
    if (!menuSubject) return;
    setSubjects((p) => p.filter((x) => x.id !== menuSubject.id));
    setElapsedMap((m) => {
      const copy = { ...m } as Record<string, number>;
      delete copy[menuSubject.id];
      return copy;
    });
    if (activeId === menuSubject.id) setActiveId(null);
    handleCloseMenu();
  };

  const cancelEdit = () => setEditingSubject(null);
  const confirmEdit = () => {
    if (!editingSubject) return;
    setSubjects((p) => p.map((s) => s.id === editingSubject.id ? { ...s, name: editingName, color: editingColor || s.color } : s));
    setEditingSubject(null);
  };

  return (
    <>
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <IconButton onClick={() => navigate('/settings')} sx={{ color: '#fff' }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccessTimeIcon />
          <Typography variant="body2">D-0</Typography>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <Typography variant="h1" sx={{ fontVariantNumeric: 'tabular-nums' }}>{hhmmss(totalSeconds)}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">{activeId ? `Focusing on ${subjects.find(s => s.id === activeId)?.name ?? ''}` : 'Idle'}</Typography>
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Subjects</Typography>
          <Stack spacing={1}>
            {subjects.map((s) => (
              <Stack key={s.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: 'transparent', p: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>{s.name}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button onClick={() => startStop(s.id)} startIcon={<PlayArrowIcon />} variant={activeId === s.id ? 'contained' : 'outlined'} sx={{ bgcolor: activeId === s.id ? s.color : undefined }}>
                    {activeId === s.id ? <PauseIcon /> : <PlayArrowIcon />}
                  </Button>
                  <IconButton size="small" onClick={(e) => handleOpenMenu(e, s)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/></svg>
                  </IconButton>
                </Stack>
              </Stack>
            ))}
            <Stack direction="row" spacing={1}>
              <TextField size="small" placeholder="Add subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} sx={{ flex: 1 }} />
              <Button onClick={addSubject}>Add</Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ width: 280 }}>
          <Typography variant="subtitle1">Insights</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">Total time: {totalMinutes} min</Typography>
          <Typography variant="body2">Daily avg: {Math.round(totalMinutes / 7)} min</Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={1}>
            {subjects.map((s) => {
              const mins = Math.round((elapsedMap[s.id] ?? 0) / 60);
              const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
              return (
                <Box key={s.id}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">{s.name}</Typography>
                    <Typography variant="body2">{mins}m</Typography>
                  </Stack>
                  <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1, mt: 0.5 }}>
                    <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: s.color ?? '#999', borderRadius: 1 }} />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleEditSubject}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteSubject}>Delete</MenuItem>
      </Menu>

      <Dialog open={Boolean(editingSubject)} onClose={cancelEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Edit subject</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
            <TextField label="Color (hex)" value={editingColor} onChange={(e) => setEditingColor(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>Cancel</Button>
          <Button onClick={confirmEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TimerView;
