import { supabase } from './supabase';
import { Card, TopicWithCount } from './types';

export async function getTopics(): Promise<TopicWithCount[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('topic')
    .order('topic');

  if (error) {
    throw new Error(`Failed to fetch topics: ${error.message}`);
  }

  const topicCounts = data.reduce((acc: Record<string, number>, row) => {
    acc[row.topic] = (acc[row.topic] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => a.topic.localeCompare(b.topic));
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
