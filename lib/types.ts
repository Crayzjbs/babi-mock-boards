export interface Card {
  id: number;
  topic: string;
  question: string;
  answer: string;
  created_at?: string;
}

export interface TopicWithCount {
  topic: string;
  count: number;
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface CardWithRating extends Card {
  rating?: Rating;
}

export interface SessionStats {
  totalCards: number;
  reviewedCards: number;
  knownCards: number;
  needsReviewCards: number;
  ratings: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export interface StudySession {
  id: string;
  topic: string;
  started_at: string;
  completed_at: string;
  total_cards: number;
  reviewed_cards: number;
  current_index: number;
  is_completed: boolean;
  shuffled: boolean;
  created_at: string;
}

export interface CardReview {
  id: string;
  session_id: string;
  card_id: number;
  rating: Rating;
  reviewed_at: string;
  created_at: string;
}

export interface SavedSessionStats {
  id: string;
  session_id: string;
  again_count: number;
  hard_count: number;
  good_count: number;
  easy_count: number;
  known_cards: number;
  needs_review_cards: number;
  created_at: string;
}

export interface SessionWithStats extends StudySession {
  stats?: SavedSessionStats;
  reviews?: CardReview[];
}
