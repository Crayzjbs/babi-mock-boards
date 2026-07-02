'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTopics, getTotalCardCount } from '@/lib/cards';
import { TopicWithCount } from '@/lib/types';
import { Shuffle, History } from 'lucide-react';
import { toast } from 'sonner';

interface TopicSelectProps {
  onStartStudy: (topic: string, shuffled: boolean) => void;
  onViewHistory: () => void;
}

export function TopicSelect({ onStartStudy, onViewHistory }: TopicSelectProps) {
  const [topics, setTopics] = useState<TopicWithCount[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);

  useEffect(() => {
    async function loadTopics() {
      console.log('🔍 Starting to load topics...');
      try {
        console.log('📡 Fetching topics and card count...');
        const [topicsData, total] = await Promise.all([
          getTopics(),
          getTotalCardCount(),
        ]);
        console.log('✅ Data received:', { topicsData, total });
        setTopics(topicsData);
        setTotalCount(total);
      } catch (error) {
        console.error('❌ Error loading topics:', error);
        toast.error('Failed to load topics. Please check your connection.');
        console.error(error);
      } finally {
        console.log('🏁 Loading complete, setting loading to false');
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Babi mock boards practice
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              go lalaaaa kaya yan
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onViewHistory}
            className="gap-2 h-12 px-6 text-base hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <History className="h-5 w-5" />
            History
          </Button>
        </div>

        {/* Shuffle Control */}
        <div className="flex items-center gap-4 p-6 border-2 rounded-2xl bg-card/50 backdrop-blur-sm">
          <Button
            variant={shuffleEnabled ? 'default' : 'outline'}
            size="lg"
            onClick={() => setShuffleEnabled(!shuffleEnabled)}
            className="gap-3 h-12 px-6"
          >
            <Shuffle className="h-5 w-5" />
            {shuffleEnabled ? 'Shuffle On' : 'Shuffle Off'}
          </Button>
          <span className="text-base text-muted-foreground">
            {shuffleEnabled
              ? 'Questions will be randomized for better retention'
              : 'Questions will appear in their original order'}
          </span>
        </div>

        {/* All Topics Card */}
        <Card
          className="group p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-primary bg-gradient-to-br from-card to-card/50"
          onClick={() => onStartStudy('all', shuffleEnabled)}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                All Topics
              </h3>
              <p className="text-base text-muted-foreground">
                Comprehensive review of all exam topics
              </p>
            </div>
            <Badge variant="secondary" className="text-2xl px-6 py-3 font-bold">
              {totalCount}
            </Badge>
          </div>
        </Card>

        {/* Topics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card
              key={topic.topic}
              className="group p-6 hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-card"
              onClick={() => onStartStudy(topic.topic, shuffleEnabled)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-tight flex-1 group-hover:text-primary transition-colors">
                    {topic.topic}
                  </h3>
                  <Badge variant="outline" className="shrink-0 text-sm px-3 py-1">
                    {topic.count}
                  </Badge>
                </div>
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-500 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
