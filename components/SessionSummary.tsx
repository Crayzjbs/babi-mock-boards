'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionStats } from '@/lib/types';
import { ArrowLeft, RotateCcw, BookOpen, Save, Check } from 'lucide-react';

interface SessionSummaryProps {
  stats: SessionStats;
  onStudyAgain: () => void;
  onReviewMissed: () => void;
  onBack: () => void;
  onSave?: () => Promise<void>;
}

export function SessionSummary({
  stats,
  onStudyAgain,
  onReviewMissed,
  onBack,
  onSave,
}: SessionSummaryProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!onSave || saved) return;
    
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setSaving(false);
    }
  };
  const accuracyRate =
    stats.reviewedCards > 0
      ? Math.round((stats.knownCards / stats.reviewedCards) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Session Complete!
          </h2>
          <p className="text-xl text-muted-foreground">
            Excellent work! Here&apos;s your performance summary.
          </p>
        </div>

        <Card className="p-10 space-y-8 border-2 shadow-2xl bg-gradient-to-br from-card to-card/50">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div className="space-y-3 p-6 rounded-2xl bg-primary/5">
              <p className="text-6xl font-bold text-primary">{stats.reviewedCards}</p>
              <p className="text-base font-medium text-muted-foreground">Cards Reviewed</p>
            </div>
            <div className="space-y-3 p-6 rounded-2xl bg-primary/5">
              <p className="text-6xl font-bold text-primary">{accuracyRate}%</p>
              <p className="text-base font-medium text-muted-foreground">Accuracy Rate</p>
            </div>
          </div>

          <div className="border-t-2 pt-8 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10">
              <span className="text-lg font-medium">Known Well (Good/Easy)</span>
              <Badge variant="secondary" className="text-xl px-4 py-2 font-bold bg-green-500/20">
                {stats.knownCards}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10">
              <span className="text-lg font-medium">
                Needs Review (Again/Hard)
              </span>
              <Badge variant="secondary" className="text-xl px-4 py-2 font-bold bg-orange-500/20">
                {stats.needsReviewCards}
              </Badge>
            </div>
          </div>

          <div className="border-t-2 pt-8 grid grid-cols-4 gap-4 text-center">
            <div className="space-y-2 p-4 rounded-xl bg-destructive/10">
              <p className="text-3xl font-bold">{stats.ratings.again}</p>
              <p className="text-sm font-medium text-muted-foreground">Again</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-orange-500/10">
              <p className="text-3xl font-bold">{stats.ratings.hard}</p>
              <p className="text-sm font-medium text-muted-foreground">Hard</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-blue-500/10">
              <p className="text-3xl font-bold">{stats.ratings.good}</p>
              <p className="text-sm font-medium text-muted-foreground">Good</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-green-500/10">
              <p className="text-3xl font-bold">{stats.ratings.easy}</p>
              <p className="text-sm font-medium text-muted-foreground">Easy</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {onSave && (
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full gap-3 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
              variant={saved ? "secondary" : "default"}
            >
              {saved ? (
                <>
                  <Check className="h-5 w-5" />
                  Session Saved
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {saving ? 'Saving...' : 'Save Session'}
                </>
              )}
            </Button>
          )}
          <Button 
            onClick={onStudyAgain} 
            className="w-full gap-3 h-14 text-lg font-semibold" 
            size="lg" 
            variant="outline"
          >
            <RotateCcw className="h-5 w-5" />
            Study Again
          </Button>
          {stats.needsReviewCards > 0 && (
            <Button
              onClick={onReviewMissed}
              variant="outline"
              className="w-full gap-3 h-14 text-lg font-semibold"
              size="lg"
            >
              <BookOpen className="h-5 w-5" />
              Review Missed Cards ({stats.needsReviewCards})
            </Button>
          )}
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full gap-3 h-14 text-lg font-semibold"
            size="lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Topics
          </Button>
        </div>
      </div>
    </div>
  );
}
