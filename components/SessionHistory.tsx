'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getSavedSessions, deleteSession } from '@/lib/sessions';
import { SessionWithStats } from '@/lib/types';
import { ArrowLeft, Trash2, Calendar, Clock, TrendingUp, Play } from 'lucide-react';
import { toast } from 'sonner';

interface SessionHistoryProps {
  onBack: () => void;
  onContinueSession: (sessionId: string) => void;
}

export function SessionHistory({ onBack, onContinueSession }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getSavedSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load session history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Delete this session? This cannot be undone.')) return;

    setDeletingId(sessionId);
    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.round((endTime - startTime) / 60000);
    return minutes > 0 ? `${minutes} min` : '< 1 min';
  };

  const getAccuracyRate = (stats?: SessionWithStats['stats']) => {
    if (!stats) return 0;
    const total = stats.again_count + stats.hard_count + stats.good_count + stats.easy_count;
    if (total === 0) return 0;
    const known = stats.good_count + stats.easy_count;
    return Math.round((known / total) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Session History</h1>
          <p className="text-muted-foreground mt-1">
            View your past study sessions and progress
          </p>
        </div>
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-3">
            <div className="text-4xl">📚</div>
            <h3 className="text-lg font-medium">No saved sessions yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete a study session and click &quot;Save Session&quot; to see it here
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6 hover:border-foreground/20 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{session.topic}</h3>
                      {session.shuffled && (
                        <Badge variant="outline" className="text-xs">
                          Shuffled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.completed_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(session.completed_at)}
                      </span>
                      <span>
                        Duration: {calculateDuration(session.started_at, session.completed_at)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(session.id)}
                    disabled={deletingId === session.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">{session.reviewed_cards}</p>
                    <p className="text-xs text-muted-foreground">Cards Reviewed</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold flex items-center gap-1">
                      {getAccuracyRate(session.stats)}%
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  {session.stats && (
                    <>
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold text-green-600">
                          {session.stats.good_count + session.stats.easy_count}
                        </p>
                        <p className="text-xs text-muted-foreground">Known Well</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold text-orange-600">
                          {session.stats.again_count + session.stats.hard_count}
                        </p>
                        <p className="text-xs text-muted-foreground">Need Review</p>
                      </div>
                    </>
                  )}
                </div>

                {session.stats && (
                  <div className="flex items-center justify-between gap-2 pt-3 border-t">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        Again: {session.stats.again_count}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Hard: {session.stats.hard_count}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Good: {session.stats.good_count}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Easy: {session.stats.easy_count}
                      </Badge>
                    </div>
                    {!session.is_completed && (
                      <Button
                        onClick={() => onContinueSession(session.id)}
                        size="sm"
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Continue
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Total sessions: {sessions.length}
        </div>
      )}
    </div>
  );
}
