import { supabase } from './supabase';
import {
  StudySession,
  CardReview,
  SavedSessionStats,
  SessionWithStats,
  CardWithRating,
  SessionStats,
} from './types';

/**
 * Save a complete study session with all card reviews and statistics
 */
export async function saveStudySession(
  topic: string,
  cards: CardWithRating[],
  stats: SessionStats,
  shuffled: boolean,
  startedAt: Date,
  currentIndex?: number,
  isCompleted?: boolean
): Promise<string> {
  const completedAt = new Date();

  // 1. Create the study session record
  const { data: session, error: sessionError } = await supabase
    .from('study_sessions')
    .insert({
      topic,
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      total_cards: stats.totalCards,
      reviewed_cards: stats.reviewedCards,
      current_index: currentIndex ?? stats.reviewedCards,
      is_completed: isCompleted ?? stats.reviewedCards === stats.totalCards,
      shuffled,
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error(`Failed to save session: ${sessionError?.message}`);
  }

  const sessionId = session.id;

  // 2. Save individual card reviews
  const reviewedCards = cards.filter((card) => card.rating);
  if (reviewedCards.length > 0) {
    const reviews = reviewedCards.map((card) => ({
      session_id: sessionId,
      card_id: card.id,
      rating: card.rating!,
      reviewed_at: new Date().toISOString(),
    }));

    const { error: reviewsError } = await supabase
      .from('card_reviews')
      .insert(reviews);

    if (reviewsError) {
      throw new Error(`Failed to save card reviews: ${reviewsError.message}`);
    }
  }

  // 3. Save session statistics
  const { error: statsError } = await supabase
    .from('session_stats')
    .insert({
      session_id: sessionId,
      again_count: stats.ratings.again,
      hard_count: stats.ratings.hard,
      good_count: stats.ratings.good,
      easy_count: stats.ratings.easy,
      known_cards: stats.knownCards,
      needs_review_cards: stats.needsReviewCards,
    });

  if (statsError) {
    throw new Error(`Failed to save session stats: ${statsError.message}`);
  }

  return sessionId;
}

/**
 * Get all saved study sessions, optionally filtered by topic
 */
export async function getSavedSessions(
  topic?: string
): Promise<SessionWithStats[]> {
  let query = supabase
    .from('study_sessions')
    .select(
      `
      *,
      stats:session_stats(*),
      reviews:card_reviews(*)
    `
    )
    .order('created_at', { ascending: false });

  if (topic && topic !== 'all') {
    query = query.eq('topic', topic);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  return (data || []).map((session) => ({
    ...session,
    stats: Array.isArray(session.stats) ? session.stats[0] : session.stats,
  }));
}

/**
 * Get a single session with all its details
 */
export async function getSessionById(
  sessionId: string
): Promise<SessionWithStats | null> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(
      `
      *,
      stats:session_stats(*),
      reviews:card_reviews(*)
    `
    )
    .eq('id', sessionId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch session: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    stats: Array.isArray(data.stats) ? data.stats[0] : data.stats,
  };
}

/**
 * Delete a saved session and all its related data
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Get statistics for a specific card across all sessions
 */
export async function getCardHistory(cardId: number): Promise<CardReview[]> {
  const { data, error } = await supabase
    .from('card_reviews')
    .select('*')
    .eq('card_id', cardId)
    .order('reviewed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch card history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get overall statistics across all sessions
 */
export async function getOverallStats(): Promise<{
  totalSessions: number;
  totalCardsReviewed: number;
  averageSessionLength: number;
  ratingDistribution: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}> {
  const { data: sessions, error: sessionsError } = await supabase
    .from('study_sessions')
    .select('*');

  if (sessionsError) {
    throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
  }

  const { data: stats, error: statsError } = await supabase
    .from('session_stats')
    .select('*');

  if (statsError) {
    throw new Error(`Failed to fetch stats: ${statsError.message}`);
  }

  const totalSessions = sessions?.length || 0;
  const totalCardsReviewed =
    sessions?.reduce((sum, s) => sum + s.reviewed_cards, 0) || 0;
  const averageSessionLength =
    totalSessions > 0 ? totalCardsReviewed / totalSessions : 0;

  const ratingDistribution = {
    again: stats?.reduce((sum, s) => sum + s.again_count, 0) || 0,
    hard: stats?.reduce((sum, s) => sum + s.hard_count, 0) || 0,
    good: stats?.reduce((sum, s) => sum + s.good_count, 0) || 0,
    easy: stats?.reduce((sum, s) => sum + s.easy_count, 0) || 0,
  };

  return {
    totalSessions,
    totalCardsReviewed,
    averageSessionLength: Math.round(averageSessionLength * 10) / 10,
    ratingDistribution,
  };
}
