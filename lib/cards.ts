import { supabase } from './supabase';
import { Card, TopicWithCount } from './types';

export async function getTopics(): Promise<TopicWithCount[]> {
  // Try RPC function first for efficiency
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_topic_counts');

  if (!rpcError && rpcData) {
    return (rpcData || []).sort((a: TopicWithCount, b: TopicWithCount) => a.topic.localeCompare(b.topic));
  }

  // Fallback: Get distinct topics first, then count each one
  console.warn('RPC get_topic_counts not found, using fallback method');
  
  // First, get all distinct topics by fetching with high limit
  const { data: allCards, error: cardsError } = await supabase
    .from('cards')
    .select('topic')
    .limit(10000);

  if (cardsError) {
    throw new Error(`Failed to fetch topics: ${cardsError.message}`);
  }

  // Get unique topics
  const uniqueTopics = [...new Set((allCards || []).map(card => card.topic))];
  
  // Count each topic separately
  const topicCounts: TopicWithCount[] = [];
  
  for (const topic of uniqueTopics) {
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('topic', topic);
    
    if (!countError && count !== null) {
      topicCounts.push({ topic, count });
    }
  }

  return topicCounts.sort((a, b) => a.topic.localeCompare(b.topic));
}

export async function getCardsByTopic(topic?: string): Promise<Card[]> {
  let query = supabase.from('cards').select('*');

  if (topic && topic !== 'all') {
    query = query.eq('topic', topic);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch cards: ${error.message}`);
  }

  return data || [];
}

export async function getTotalCardCount(): Promise<number> {
  const { count, error } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to fetch card count: ${error.message}`);
  }

  return count || 0;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
