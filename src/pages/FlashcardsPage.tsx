import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import PageContainer from '@components/PageContainer';
import { useAppStore } from '@state/store';
import type { AppStore } from '@state/store';
import type { Card, Deck } from '@state/types';

interface DeckDraft {
  name: string;
  description: string;
}

interface CardDraft {
  front: string;
  back: string;
}

const emptyDeckDraft: DeckDraft = {
  name: '',
  description: ''
};

const emptyCardDraft: CardDraft = {
  front: '',
  back: ''
};

const FlashcardsPage = () => {
  const decks = useAppStore((state: AppStore) => state.decks);
  const cardsByDeck = useAppStore((state: AppStore) => state.cardsByDeck);
  const reloadDecks = useAppStore((state: AppStore) => state.reloadDecks);
  const createDeck = useAppStore((state: AppStore) => state.createDeck);
  const deleteDeck = useAppStore((state: AppStore) => state.deleteDeck);
  const loadCards = useAppStore((state: AppStore) => state.loadCards);
  const createCard = useAppStore((state: AppStore) => state.createCard);
  const updateCard = useAppStore((state: AppStore) => state.updateCard);
  const deleteCard = useAppStore((state: AppStore) => state.deleteCard);
  const toast = useToast();

  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [deckDraft, setDeckDraft] = useState<DeckDraft>(emptyDeckDraft);
  const [cardDraft, setCardDraft] = useState<CardDraft>(emptyCardDraft);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [loadingCards, setLoadingCards] = useState<boolean>(false);

  useEffect(() => {
    void reloadDecks();
  }, [reloadDecks]);

  useEffect(() => {
    if (selectedDeckId === null) {
      return;
    }
    if (cardsByDeck[selectedDeckId]) {
      return;
    }
    setLoadingCards(true);
    void loadCards(selectedDeckId).finally(() => setLoadingCards(false));
  }, [selectedDeckId, cardsByDeck, loadCards]);

  useEffect(() => {
    if (decks.length > 0 && selectedDeckId === null) {
      setSelectedDeckId(decks[0].id);
    }
    if (decks.length === 0) {
      setSelectedDeckId(null);
    }
  }, [decks, selectedDeckId]);

  const cards = useMemo<Card[]>(() => {
    if (selectedDeckId === null) {
      return [];
    }
    return cardsByDeck[selectedDeckId] ?? [];
  }, [cardsByDeck, selectedDeckId]);

  const activeDeck = useMemo<Deck | null>(() => {
    if (selectedDeckId === null) {
      return null;
    }
    return decks.find((deck: Deck) => deck.id === selectedDeckId) ?? null;
  }, [decks, selectedDeckId]);

  const handleDeckSubmit = async () => {
    if (!deckDraft.name.trim()) {
      toast({ description: 'Deck name cannot be empty', status: 'warning' });
      return;
    }
    const created = await createDeck({
      name: deckDraft.name.trim(),
      description: deckDraft.description.trim() || null
    });
    if (created) {
      setSelectedDeckId(created.id);
      setDeckDraft(emptyDeckDraft);
      toast({ description: 'Deck created', status: 'success' });
    }
  };

  const handleDeleteDeck = async (deck: Deck) => {
    await deleteDeck(deck.id);
    if (selectedDeckId === deck.id) {
      setSelectedDeckId(null);
    }
  };

  const handleCardSubmit = async () => {
    if (selectedDeckId === null) {
      toast({ description: 'Select a deck first', status: 'info' });
      return;
    }
    if (!cardDraft.front.trim() || !cardDraft.back.trim()) {
      toast({ description: 'Front and back cannot be empty', status: 'warning' });
      return;
    }
    if (editingCard) {
      const updated = await updateCard({
        ...editingCard,
        front: cardDraft.front.trim(),
        back: cardDraft.back.trim()
      });
      if (updated) {
        toast({ description: 'Card updated', status: 'success' });
      }
    } else {
      const created = await createCard({
        deckId: selectedDeckId,
        front: cardDraft.front.trim(),
        back: cardDraft.back.trim()
      });
      if (created) {
        toast({ description: 'Card added', status: 'success' });
      }
    }
    setCardDraft(emptyCardDraft);
    setEditingCard(null);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setCardDraft({ front: card.front, back: card.back });
  };

  const handleDeleteCard = async (card: Card) => {
    await deleteCard(card.id, card.deckId);
    if (editingCard?.id === card.id) {
      setEditingCard(null);
      setCardDraft(emptyCardDraft);
    }
  };

  return (
    <PageContainer
      title="Flashcards"
      description="Build decks, add cards, and keep track of your spaced repetition progress."
      spacing={6}
      actions={
        <Button variant="outline" onClick={() => setDeckDraft(emptyDeckDraft)}>
          New deck
        </Button>
      }
    >
      <Stack direction={{ base: 'column', lg: 'row' }} spacing={6} align="flex-start">
        <Stack flex={{ base: 'none', lg: '0 0 320px' }} spacing={4} bg="rgba(20, 22, 30, 0.9)" p={5} rounded="2xl" border="1px solid rgba(255,255,255,0.05)">
          <Heading size="sm" color="gray.300">
            Create deck
          </Heading>
          <Input
            placeholder="Deck name"
            value={deckDraft.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDeckDraft((prev: DeckDraft) => ({ ...prev, name: event.target.value }))
            }
          />
          <Textarea
            placeholder="Description"
            value={deckDraft.description}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setDeckDraft((prev: DeckDraft) => ({ ...prev, description: event.target.value }))
            }
            minH="100px"
          />
          <Button colorScheme="brand" onClick={handleDeckSubmit}>
            Save deck
          </Button>
          <Divider borderColor="rgba(255,255,255,0.08)" />
          <Stack spacing={3} maxH="360px" overflowY="auto" pr={2}>
            {decks.length === 0 && <Text color="gray.400">No decks yet. Create one to get started.</Text>}
            {decks.map((deck: Deck) => {
              const isActive = deck.id === selectedDeckId;
              return (
                <Box
                  key={deck.id}
                  bg={isActive ? 'rgba(68, 77, 110, 0.35)' : 'rgba(32, 35, 45, 0.6)'}
                  border="1px solid rgba(255,255,255,0.06)"
                  rounded="xl"
                  p={4}
                  cursor="pointer"
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Heading size="sm">{deck.name}</Heading>
                      {deck.description && (
                        <Text fontSize="xs" color="gray.400" mt={1} noOfLines={2}>
                          {deck.description}
                        </Text>
                      )}
                      <Badge mt={3} colorScheme="purple">
                        {cardsByDeck[deck.id]?.length ?? 0} cards
                      </Badge>
                    </Box>
                    <Button size="xs" variant="ghost" color="red.300" onClick={() => void handleDeleteDeck(deck)}>
                      Delete
                    </Button>
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        </Stack>

        <Stack flex="1" spacing={5} bg="rgba(24, 26, 35, 0.85)" p={6} rounded="2xl" border="1px solid rgba(255,255,255,0.05)">
          {activeDeck ? (
            <>
              <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                <Heading size="md">{activeDeck.name}</Heading>
                <Text fontSize="sm" color="gray.400">
                  {cards.length} cards • Updated {new Date(activeDeck.createdAt).toLocaleDateString()}
                </Text>
              </Flex>
              <Stack spacing={4} bg="rgba(12, 14, 20, 0.9)" p={5} rounded="xl" border="1px solid rgba(255,255,255,0.05)">
                <Heading size="sm" color="gray.300">
                  {editingCard ? 'Edit card' : 'Add card'}
                </Heading>
                <Textarea
                  placeholder="Front content"
                  value={cardDraft.front}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setCardDraft((prev: CardDraft) => ({ ...prev, front: event.target.value }))
                  }
                  minH="120px"
                />
                <Textarea
                  placeholder="Back content"
                  value={cardDraft.back}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setCardDraft((prev: CardDraft) => ({ ...prev, back: event.target.value }))
                  }
                  minH="120px"
                />
                <Flex gap={3}>
                  {editingCard && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingCard(null);
                        setCardDraft(emptyCardDraft);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button colorScheme="brand" onClick={handleCardSubmit}>
                    {editingCard ? 'Save changes' : 'Add card'}
                  </Button>
                </Flex>
              </Stack>

              <Divider borderColor="rgba(255,255,255,0.08)" />

              <VStack align="stretch" spacing={3} maxH="420px" overflowY="auto" pr={2}>
                {loadingCards && <Text color="gray.400">Loading cards…</Text>}
                {!loadingCards && cards.length === 0 && (
                  <Text color="gray.500">No cards in this deck yet. Add one above.</Text>
                )}
                {cards.map((card: Card) => (
                  <Box
                    key={card.id}
                    bg="rgba(30, 32, 44, 0.9)"
                    border="1px solid rgba(255,255,255,0.06)"
                    rounded="xl"
                    p={4}
                  >
                    <Flex justify="space-between" align="flex-start" gap={4}>
                      <Box flex="1">
                        <Text fontWeight="semibold" color="gray.200" mb={2}>
                          Front
                        </Text>
                        <Text color="gray.300" whiteSpace="pre-wrap">
                          {card.front}
                        </Text>
                        <Divider my={3} borderColor="rgba(255,255,255,0.05)" />
                        <Text fontWeight="semibold" color="gray.200" mb={2}>
                          Back
                        </Text>
                        <Text color="gray.300" whiteSpace="pre-wrap">
                          {card.back}
                        </Text>
                      </Box>
                      <Stack spacing={2} minW="96px">
                        <Button size="sm" variant="outline" onClick={() => handleEditCard(card)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" color="red.300" onClick={() => void handleDeleteCard(card)}>
                          Delete
                        </Button>
                        <Badge mt={2} colorScheme="green" textAlign="center">
                          {card.successCount} ✅ / {card.failureCount} ❌
                        </Badge>
                      </Stack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </>
          ) : (
            <Stack spacing={3} align="center" py={20} color="gray.500">
              <Heading size="md">Select or create a deck</Heading>
              <Text textAlign="center" maxW="360px">
                Decks help you group flashcards by subject or topic. Create your first deck on the left to begin
                studying.
              </Text>
            </Stack>
          )}
        </Stack>
      </Stack>
    </PageContainer>
  );
};

export default FlashcardsPage;
