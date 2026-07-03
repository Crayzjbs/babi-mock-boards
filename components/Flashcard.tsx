'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
import { Card as CardType, Rating } from '@/lib/types';

interface FlashcardProps {
  card: CardType;
  onRate: (rating: Rating) => void;
  currentIndex: number;
  totalCards: number;
}

export function Flashcard({
  card,
  onRate,
  currentIndex,
  totalCards,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleFlipBack = () => {
    setIsFlipped(false);
  };

  const handleRate = (rating: Rating) => {
    onRate(rating);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-base px-4 py-2 font-medium">
          {card.topic}
        </Badge>
        <span className="text-lg font-semibold text-muted-foreground">
          {currentIndex + 1} <span className="text-foreground/30">/</span> {totalCards}
        </span>
      </div>

      <div className="perspective-1000">
        <div
          className={`relative w-full min-h-[500px] transition-transform duration-700 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <Card
            className={`absolute inset-0 p-12 flex items-center justify-center backface-hidden border-2 shadow-2xl ${
              isFlipped ? 'invisible' : 'visible'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center space-y-8 w-full">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                Question
              </div>
              <p className="text-2xl md:text-3xl leading-relaxed font-medium">
                {card.question}
              </p>
            </div>
          </Card>

          <Card
            className={`absolute inset-0 p-12 flex items-center justify-center backface-hidden border-2 shadow-2xl bg-gradient-to-br from-primary/5 to-primary/10 ${
              isFlipped ? 'visible' : 'invisible'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center space-y-8 w-full">
              <div className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full mb-4">
                Answer
              </div>
              <p className="text-xl md:text-2xl leading-relaxed">
                {card.answer}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {!isFlipped ? (
        <div className="flex justify-center">
          <Button 
            onClick={handleFlip} 
            size="lg" 
            className="h-14 px-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Show Answer
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <p className="text-center text-lg font-medium text-muted-foreground">
              How well did you know this?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlipBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
              title="Show question again"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm">Show Question</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => handleRate('again')}
              className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-destructive hover:bg-destructive/10 hover:scale-105 transition-all"
            >
              <span className="text-lg font-semibold">Again</span>
              <span className="text-sm text-muted-foreground">Press 1</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate('hard')}
              className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-orange-500 hover:bg-orange-500/10 hover:scale-105 transition-all"
            >
              <span className="text-lg font-semibold">Hard</span>
              <span className="text-sm text-muted-foreground">Press 2</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate('good')}
              className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-blue-500 hover:bg-blue-500/10 hover:scale-105 transition-all"
            >
              <span className="text-lg font-semibold">Good</span>
              <span className="text-sm text-muted-foreground">Press 3</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate('easy')}
              className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-500/10 hover:scale-105 transition-all"
            >
              <span className="text-lg font-semibold">Easy</span>
              <span className="text-sm text-muted-foreground">Press 4</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
