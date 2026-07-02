'use client';

import { useState } from 'react';
import { TopicSelect } from '@/components/TopicSelect';
import { StudySession } from '@/components/StudySession';
import { SessionHistory } from '@/components/SessionHistory';
import { getSessionById } from '@/lib/sessions';
import { toast } from 'sonner';

type View = 'topics' | 'study' | 'history';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('topics');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);

  const handleStartStudy = (topic: string, shuffled: boolean) => {
    setSelectedTopic(topic);
    setShuffleEnabled(shuffled);
    setResumeSessionId(null);
    setCurrentView('study');
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleContinueSession = async (sessionId: string) => {
    try {
      const session = await getSessionById(sessionId);
      if (!session) {
        toast.error('Session not found');
        return;
      }
      
      setSelectedTopic(session.topic);
      setShuffleEnabled(session.shuffled);
      setResumeSessionId(sessionId);
      setCurrentView('study');
      toast.success('Resuming session...');
    } catch (error) {
      toast.error('Failed to load session');
      console.error(error);
    }
  };

  const handleBack = () => {
    setSelectedTopic(null);
    setResumeSessionId(null);
    setCurrentView('topics');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'study' && selectedTopic ? (
        <StudySession
          topic={selectedTopic}
          initialShuffle={shuffleEnabled}
          resumeSessionId={resumeSessionId}
          onBack={handleBack}
        />
      ) : currentView === 'history' ? (
        <SessionHistory onBack={handleBack} onContinueSession={handleContinueSession} />
      ) : (
        <TopicSelect onStartStudy={handleStartStudy} onViewHistory={handleViewHistory} />
      )}
    </div>
  );
}
