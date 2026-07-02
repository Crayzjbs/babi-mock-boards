-- Study Sessions Table
-- Stores overall session information
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_cards INTEGER NOT NULL,
  reviewed_cards INTEGER NOT NULL,
  current_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  shuffled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card Reviews Table
-- Stores individual card ratings within a session
CREATE TABLE IF NOT EXISTS card_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Statistics Table
-- Stores aggregated statistics for each session
CREATE TABLE IF NOT EXISTS session_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE UNIQUE,
  again_count INTEGER DEFAULT 0,
  hard_count INTEGER DEFAULT 0,
  good_count INTEGER DEFAULT 0,
  easy_count INTEGER DEFAULT 0,
  known_cards INTEGER DEFAULT 0,
  needs_review_cards INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_topic ON study_sessions(topic);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_reviews_session_id ON card_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_session_stats_session_id ON session_stats(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_stats ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth needs)
-- For now, allowing all operations without authentication
CREATE POLICY "Allow all operations on study_sessions" ON study_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on card_reviews" ON card_reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations on session_stats" ON session_stats FOR ALL USING (true);
