import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import type { Note } from '@shared/types';
import { useAppState } from '../context/AppStateContext';

interface NoteFormState {
  title: string;
  content: string;
  category: string;
}

const emptyForm: NoteFormState = {
  title: '',
  content: '',
  category: ''
};

const NotesView = () => {
  const { notes, notesApi } = useAppState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState<NoteFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [notes]
  );

  const formatTimestamp = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(iso));

  const resetDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setForm({
      title: note.title,
      content: note.content,
      category: note.category ?? ''
    });
    setDialogOpen(true);
  };

  const handleChange = (key: keyof NoteFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await notesApi.update({
          id: editing.id,
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category.trim() || null
        });
      } else {
        await notesApi.create({
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category.trim() || null
        });
      }
      resetDialog();
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (note: Note) => {
    if (!window.confirm(`Delete note "${note.title}"?`)) {
      return;
    }
    await notesApi.remove(note.id);
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Notes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Capture highlights, thoughts, and summaries from your study sessions.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Note
        </Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={3}>
        {sortedNotes.map((note) => (
          <Card
            key={note.id}
            variant="outlined"
            sx={{
              width: 320,
              borderRadius: 3,
              bgcolor: 'background.paper',
              borderColor: 'rgba(255,255,255,0.06)',
              position: 'relative'
            }}
          >
            <CardActionArea onClick={() => openEdit(note)} sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700} noWrap>
                    {note.title || 'Untitled Note'}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {note.category && (
                      <Typography variant="caption" color="primary.light">
                        {note.category}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {note.content || 'No content yet'}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Updated {formatTimestamp(note.updatedAt)}
                </Typography>
              </CardContent>
            </CardActionArea>
            <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, right: 12 }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => openEdit(note)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleRemove(note)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Card>
        ))}

        {sortedNotes.length === 0 && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              p: 6,
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: 3,
              minWidth: 320,
              color: 'text.secondary'
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              No notes yet
            </Typography>
            <Typography variant="body2" textAlign="center">
              Start by creating a note to track study insights, formulas, or reminders.
            </Typography>
          </Stack>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={resetDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Note' : 'New Note'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1.5}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(event) => handleChange('title', event.target.value)}
              autoFocus
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(event) => handleChange('category', event.target.value)}
            />
            <TextField
              label="Content"
              value={form.content}
              onChange={(event) => handleChange('content', event.target.value)}
              multiline
              minRows={6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving || !form.title.trim()}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default NotesView;
