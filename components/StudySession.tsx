'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Flashcard } from '@/components/Flashcard';
import { SessionSummary } from '@/components/SessionSummary';
import { getCardsByTopic, shuffleArray } from '@/lib/cards';
import { saveStudySession, getSessionById } from '@/lib/sessions';
import { CardWithRating, Rating, SessionStats } from '@/lib/types';
import { ArrowLeft, Shuffle, Save } from 'lucide-react';
import { toast } from 'sonner';

interface StudySessionProps {
  topic: string;
  initialShuffle: boolean;
  resumeSessionId?: string | null;
  onBack: () => void;
}

export function StudySession({
  topic,
  initialShuffle,
  resumeSessionId,
  onBack,
}: StudySessionProps) {
  const [cards, setCards] = useState<CardWithRating[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [shuffled, setShuffled] = useState(initialShuffle);
  const [sessionStartTime] = useState(new Date());
  const [stats, setStats] = useState<SessionStats>({
    totalCards: 0,
    reviewedCards: 0,
    knownCards: 0,
    needsReviewCards: 0,
    ratings: { again: 0, hard: 0, good: 0, easy: 0 },
  });

  const handleRate = useCallback(
    (rating: Rating) => {
      const updatedCards = [...cards];
      updatedCards[currentIndex] = { ...updatedCards[currentIndex], rating };
      setCards(updatedCards);

      const isKnown = rating === 'good' || rating === 'easy';
      setStats((prev) => ({
        ...prev,
        reviewedCards: prev.reviewedCards + 1,
        knownCards: isKnown ? prev.knownCards + 1 : prev.knownCards,
        needsReviewCards: !isKnown
          ? prev.needsReviewCards + 1
          : prev.needsReviewCards,
        ratings: {
          ...prev.ratings,
          [rating]: prev.ratings[rating] + 1,
        },
      }));

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionComplete(true);
      }
    },
    [cards, currentIndex]
  );

  const loadCards = useCallback(
    async (shouldShuffle: boolean) => {
      try {
        setLoading(true);
        const fetchedCards = await getCardsByTopic(topic);
        const processedCards = shouldShuffle
          ? shuffleArray(fetchedCards)
          : fetchedCards;
        setCards(processedCards);
        setStats((prev) => ({ ...prev, totalCards: processedCards.length }));
      } catch (error) {
        toast.error('Failed to load cards. Please try again.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [topic]
  );

  useEffect(() => {
    async function loadSession() {
      if (resumeSessionId) {
        setLoading(true);
        try {
          console.log('📥 Loading session:', resumeSessionId);
          const session = await getSessionById(resumeSessionId);
          console.log('📦 Session data:', session);
          
          if (session) {
            // Load cards first
            const fetchedCards = await getCardsByTopic(topic);
            console.log('📚 Fetched cards:', fetchedCards.length);
            
            // Restore their ratings if reviews exist
            const cardsWithRatings = fetchedCards.map(card => {
              const review = session.reviews?.find(r => r.card_id === card.id);
              return review ? { ...card, rating: review.rating } : card;
            });
            
            console.log('✅ Cards with ratings:', cardsWithRatings.length);
            console.log('📍 Session current_index:', session.current_index);
            
            // Ensure current index is within bounds
            const validIndex = Math.min(session.current_index, cardsWithRatings.length - 1);
            const safeIndex = Math.max(0, validIndex);
            
            console.log('📍 Safe index:', safeIndex);
            
            // Set cards first, then index
            setCards(cardsWithRatings);
            setShuffled(session.shuffled);
            
            // Restore stats
            if (session.stats) {
              setStats({
                totalCards: session.total_cards,
                reviewedCards: session.reviewed_cards,
                knownCards: session.stats.known_cards,
                needsReviewCards: session.stats.needs_review_cards,
                ratings: {
                  again: session.stats.again_count,
                  hard: session.stats.hard_count,
                  good: session.stats.good_count,
                  easy: session.stats.easy_count,
                },
              });
            }
            
            // Set current index after cards are loaded (with bounds checking)
            setCurrentIndex(safeIndex);
            setLoading(false);
            toast.success(`Session resumed at card ${safeIndex + 1}!`);
          } else {
            toast.error('Session not found');
            void loadCards(initialShuffle);
          }
        } catch (error) {
          console.error('❌ Failed to load session:', error);
          toast.error('Failed to resume session');
          void loadCards(initialShuffle);
        }
      } else {
        void loadCards(initialShuffle);
      }
    }
    loadSession();
  }, [resumeSessionId, topic, initialShuffle, loadCards]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (sessionComplete) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const showAnswerBtn = document.querySelector(
          'button:has-text("Show Answer")'
        ) as HTMLButtonElement;
        if (showAnswerBtn) showAnswerBtn.click();
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
        const rating = ratings[parseInt(e.key) - 1];
        handleRate(rating);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sessionComplete, handleRate]);

  const handleToggleShuffle = () => {
    const remainingCards = cards.slice(currentIndex);
    const reviewedCards = cards.slice(0, currentIndex);
    const newShuffled = !shuffled;

    const processedRemaining = newShuffled
      ? shuffleArray(remainingCards)
      : remainingCards.sort((a, b) => a.id - b.id);

    setCards([...reviewedCards, ...processedRemaining]);
    setShuffled(newShuffled);
    toast.success(
      newShuffled ? 'Remaining cards shuffled' : 'Remaining cards in order'
    );
  };

  const handleStudyAgain = () => {
    setCurrentIndex(0);
    setSessionComplete(false);
    setStats({
      totalCards: cards.length,
      reviewedCards: 0,
      knownCards: 0,
      needsReviewCards: 0,
      ratings: { again: 0, hard: 0, good: 0, easy: 0 },
    });
    setCards(cards.map((card) => ({ ...card, rating: undefined })));
    loadCards(shuffled);
  };

  const handleReviewMissed = () => {
    const missedCards = cards.filter(
      (card) => card.rating === 'again' || card.rating === 'hard'
    );
    if (missedCards.length === 0) {
      toast.info('No cards to review!');
      return;
    }
    setCards(shuffled ? shuffleArray(missedCards) : missedCards);
    setCurrentIndex(0);
    setSessionComplete(false);
    setStats({
      totalCards: missedCards.length,
      reviewedCards: 0,
      knownCards: 0,
      needsReviewCards: 0,
      ratings: { again: 0, hard: 0, good: 0, easy: 0 },
    });
  };

  const handleSaveSession = async () => {
    try {
      await saveStudySession(
        topic,
        cards,
        stats,
        shuffled,
        sessionStartTime,
        currentIndex,
        true // Session is completed
      );
      toast.success('Session saved successfully!');
    } catch (error) {
      toast.error('Failed to save session. Please try again.');
      console.error('Save error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <SessionSummary
        stats={stats}
        onStudyAgain={handleStudyAgain}
        onReviewMissed={handleReviewMissed}
        onBack={onBack}
        onSave={handleSaveSession}
      />
    );
  }

  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleSaveAndExit = async () => {
    try {
      await saveStudySession(
        topic,
        cards,
        stats,
        shuffled,
        sessionStartTime,
        currentIndex,
        false // Session is not completed, can be resumed
      );
      toast.success('Session saved successfully!');
      setTimeout(() => onBack(), 1000);
    } catch (error) {
      toast.error('Failed to save session. Please try again.');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="gap-2 h-12 px-6 text-base hover:bg-card"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSaveAndExit}
              className="gap-2 h-12 px-6 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Save className="h-5 w-5" />
              Save & Exit
            </Button>
            <Button
              variant={shuffled ? 'default' : 'outline'}
              size="lg"
              onClick={handleToggleShuffle}
              className="gap-2 h-12 px-6"
            >
              <Shuffle className="h-5 w-5" />
              {shuffled ? 'Shuffled' : 'In Order'}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Progress value={progress} className="h-3 rounded-full" />
          <p className="text-center text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {cards.length > 0 && currentIndex < cards.length && cards[currentIndex] && (
          <Flashcard
            card={cards[currentIndex]}
            onRate={handleRate}
            currentIndex={currentIndex}
            totalCards={cards.length}
          />
        )}
      </div>
    </div>
  );
}
