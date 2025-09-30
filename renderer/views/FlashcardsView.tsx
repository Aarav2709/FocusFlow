import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import type { Card as Flashcard, Deck } from '@shared/types';
import { useAppState } from '../context/AppStateContext';

interface DeckFormState {
  name: string;
  description: string;
}

interface CardFormState {
  front: string;
  back: string;
}

const emptyDeck: DeckFormState = { name: '', description: '' };
const emptyCard: CardFormState = { front: '', back: '' };

const FlashcardsView = () => {
  const { decks, cards, flashcardsApi } = useAppState();
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [deckDialogOpen, setDeckDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [deckForm, setDeckForm] = useState<DeckFormState>(emptyDeck);
  const [cardForm, setCardForm] = useState<CardFormState>(emptyCard);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    if (!selectedDeck && decks.length > 0) {
      setSelectedDeck(decks[0]);
    }
  }, [decks, selectedDeck]);

  useEffect(() => {
    const loadCards = async () => {
      if (!selectedDeck) return;
      if (cards[selectedDeck.id]) return;
      setLoadingCards(true);
      try {
        await flashcardsApi.preloadCards(selectedDeck.id);
      } finally {
        setLoadingCards(false);
      }
    };
    void loadCards();
  }, [cards, flashcardsApi, selectedDeck]);

  const deckCards = useMemo<Flashcard[]>(() => {
    if (!selectedDeck) {
      return [];
    }
    return cards[selectedDeck.id] ?? [];
  }, [cards, selectedDeck]);

  const openDeckDialog = () => {
    setDeckForm(emptyDeck);
    setDeckDialogOpen(true);
  };

  const openCardDialog = () => {
    setCardForm(emptyCard);
    setCardDialogOpen(true);
  };

  const createDeck = async () => {
    if (!deckForm.name.trim()) {
      return;
    }
    const deck = await flashcardsApi.createDeck({
      name: deckForm.name.trim(),
      description: deckForm.description.trim() || null
    });
    setSelectedDeck(deck);
    setDeckDialogOpen(false);
  };

  const removeDeck = async (deck: Deck) => {
    if (!window.confirm(`Delete deck "${deck.name}" and all flashcards?`)) {
      return;
    }
    await flashcardsApi.removeDeck(deck.id);
    if (selectedDeck?.id === deck.id) {
      setSelectedDeck(null);
    }
  };

  const createCard = async () => {
    if (!selectedDeck) {
      return;
    }
    if (!cardForm.front.trim() || !cardForm.back.trim()) {
      return;
    }
    await flashcardsApi.createCard({
      deckId: selectedDeck.id,
      front: cardForm.front.trim(),
      back: cardForm.back.trim()
    });
    setCardDialogOpen(false);
  };

  const removeCard = async (card: Flashcard) => {
    if (!window.confirm('Delete this card?')) {
      return;
    }
    await flashcardsApi.removeCard(card.id);
  };

  return (
    <Stack direction="row" spacing={4} alignItems="stretch" sx={{ height: '100%' }}>
      <Stack spacing={3} sx={{ width: 260 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>
            Decks
          </Typography>
          <IconButton onClick={openDeckDialog} size="small" color="primary">
            <AddIcon />
          </IconButton>
        </Stack>
        <List
          dense
          sx={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            overflow: 'auto',
            flex: 1,
            bgcolor: 'background.paper'
          }}
        >
          {decks.map((deck) => (
            <ListItem key={deck.id} disablePadding secondaryAction={
              <IconButton edge="end" onClick={() => removeDeck(deck)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            }>
              <ListItemButton selected={selectedDeck?.id === deck.id} onClick={() => setSelectedDeck(deck)}>
                <ListItemText
                  primary={deck.name}
                  secondary={deck.description ?? 'No description'}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {decks.length === 0 && (
            <Box px={3} py={4} textAlign="center" color="text.secondary">
              <Typography variant="body2">
                Create a deck to start building flashcards.
              </Typography>
            </Box>
          )}
        </List>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Stack spacing={3} sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Flashcards
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Spaced repetition made simple—review decks and track streaks.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCardDialog}
            disabled={!selectedDeck}
          >
            New Card
          </Button>
        </Stack>

        {!selectedDeck && (
          <Stack spacing={2} alignItems="center" justifyContent="center" flex={1} color="text.secondary">
            <Typography variant="subtitle1" fontWeight={600}>
              Select a deck to view flashcards
            </Typography>
            <Typography variant="body2">
              Pick a deck from the sidebar or create a new one to get started.
            </Typography>
          </Stack>
        )}

        {selectedDeck && (
          <Stack spacing={2.5} sx={{ overflowY: 'auto', pr: 1 }}>
            {deckCards.map((card) => (
              <Card key={card.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    <Stack spacing={1} flex={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Front
                      </Typography>
                      <Typography variant="body1">{card.front}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Back
                      </Typography>
                      <Typography variant="body1">{card.back}</Typography>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={1}>
                      <IconButton onClick={() => removeCard(card)}>
                        <DeleteIcon />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        Reviews: {card.reviews}
                      </Typography>
                      <Typography variant="caption" color="success.light">
                        Correct: {card.successes}
                      </Typography>
                      <Typography variant="caption" color="error.light">
                        Missed: {card.failures}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {deckCards.length === 0 && !loadingCards && (
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
                  This deck is empty
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Add your first card to start practicing.
                </Typography>
              </Stack>
            )}

            {loadingCards && (
              <Typography variant="body2" color="text.secondary">
                Loading cards…
              </Typography>
            )}
          </Stack>
        )}
      </Stack>

      <Dialog open={deckDialogOpen} onClose={() => setDeckDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Deck</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1.5}>
            <TextField
              label="Name"
              value={deckForm.name}
              onChange={(event) => setDeckForm((prev) => ({ ...prev, name: event.target.value }))}
              autoFocus
            />
            <TextField
              label="Description"
              value={deckForm.description}
              onChange={(event) => setDeckForm((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeckDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={createDeck}
            disabled={!deckForm.name.trim()}
          >
            Create Deck
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cardDialogOpen} onClose={() => setCardDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Flashcard</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1.5}>
            <TextField
              label="Front"
              value={cardForm.front}
              onChange={(event) => setCardForm((prev) => ({ ...prev, front: event.target.value }))}
              autoFocus
            />
            <TextField
              label="Back"
              value={cardForm.back}
              onChange={(event) => setCardForm((prev) => ({ ...prev, back: event.target.value }))}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={createCard}
            disabled={!cardForm.front.trim() || !cardForm.back.trim()}
          >
            Add Card
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default FlashcardsView;
