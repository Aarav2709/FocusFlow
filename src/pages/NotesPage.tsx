import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Tag
} from '@chakra-ui/react';
import PageContainer from '@components/PageContainer';
import { useAppStore } from '@state/store';
import type { AppStore } from '@state/store';
import type { Note } from '@state/types';

interface NoteDraft {
  title: string;
  category: string;
  content: string;
}

const emptyDraft: NoteDraft = {
  title: '',
  category: '',
  content: ''
};

const NotesPage = () => {
  const notes = useAppStore((state: AppStore) => state.notes);
  const createNote = useAppStore((state: AppStore) => state.createNote);
  const updateNote = useAppStore((state: AppStore) => state.updateNote);
  const deleteNote = useAppStore((state: AppStore) => state.deleteNote);
  const reloadNotes = useAppStore((state: AppStore) => state.reloadNotes);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<NoteDraft>(emptyDraft);

  useEffect(() => {
    void reloadNotes();
  }, [reloadNotes]);

  useEffect(() => {
    if (selectedId === null) {
      setDraft(emptyDraft);
      return;
    }
  const current = notes.find((note: Note) => note.id === selectedId);
    if (current) {
      setDraft({
        title: current.title,
        category: current.category,
        content: current.content
      });
    }
  }, [notes, selectedId]);

  const isEditing = selectedId !== null;

  const orderedNotes = useMemo<Note[]>(() => [...notes], [notes]);

  const handleSubmit = async () => {
    if (!draft.title.trim()) {
      return;
    }

    if (isEditing) {
  const currentNote = notes.find((note: Note) => note.id === selectedId);
      if (!currentNote) return;
      await updateNote({
        ...currentNote,
        title: draft.title.trim(),
        category: draft.category.trim(),
        content: draft.content.trim()
      });
    } else {
      await createNote({
        title: draft.title.trim(),
        category: draft.category.trim(),
        content: draft.content.trim()
      });
    }
    setDraft(emptyDraft);
    setSelectedId(null);
  };

  const handleDelete = async (note: Note) => {
    await deleteNote(note.id);
    if (selectedId === note.id) {
      setSelectedId(null);
      setDraft(emptyDraft);
    }
  };

  return (
    <PageContainer
      title="Notes"
      description="Capture quick thoughts, lecture summaries, or detailed study notes."
      spacing={8}
      actions={
        <HStack>
          <Button variant="outline" onClick={() => setSelectedId(null)}>
            New note
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit}>
            {isEditing ? 'Save changes' : 'Create note'}
          </Button>
        </HStack>
      }
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Stack spacing={4} bg="rgba(28, 30, 38, 0.9)" p={5} rounded="2xl" border="1px solid rgba(255,255,255,0.05)">
          <Input
            placeholder="Title"
            value={draft.title}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraft((prev: NoteDraft) => ({ ...prev, title: event.target.value }))
            }
            size="lg"
          />
          <Input
            placeholder="Category"
            value={draft.category}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraft((prev: NoteDraft) => ({ ...prev, category: event.target.value }))
            }
          />
          <Textarea
            placeholder="Write your note..."
            value={draft.content}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setDraft((prev: NoteDraft) => ({ ...prev, content: event.target.value }))
            }
            minH="240px"
          />
        </Stack>

        <Stack spacing={4}>
          {orderedNotes.length === 0 && (
            <Box bg="rgba(28, 30, 38, 0.8)" p={5} rounded="2xl" border="1px solid rgba(255,255,255,0.05)">
              <Text color="gray.400">No notes yet. Start by creating your first note.</Text>
            </Box>
          )}
          {orderedNotes.map((note: Note) => (
            <Box
              key={note.id}
              bg={note.id === selectedId ? 'rgba(41, 45, 56, 0.95)' : 'rgba(28, 30, 38, 0.85)'}
              border="1px solid rgba(255,255,255,0.06)"
              rounded="2xl"
              p={4}
              cursor="pointer"
              onClick={() => setSelectedId(note.id)}
            >
              <HStack justify="space-between" align="flex-start">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    {note.title || 'Untitled note'}
                  </Text>
                  {note.category && (
                    <Tag mt={2} size="sm" colorScheme="brand" variant="subtle">
                      {note.category}
                    </Tag>
                  )}
                </Box>
                <Button
                  size="sm"
                  variant="ghost"
                  color="red.300"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    void handleDelete(note);
                  }}
                >
                  Delete
                </Button>
              </HStack>
              <Text mt={3} noOfLines={3} color="gray.300">
                {note.content || 'Tap to add content'}
              </Text>
              <Text mt={3} fontSize="xs" color="gray.500">
                Updated {new Date(note.updatedAt).toLocaleString()}
              </Text>
            </Box>
          ))}
        </Stack>
      </SimpleGrid>
    </PageContainer>
  );
};

export default NotesPage;
