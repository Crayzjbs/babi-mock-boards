-- Create the cards table for flashcard data
CREATE TABLE IF NOT EXISTS cards (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on topic for faster filtering
CREATE INDEX IF NOT EXISTS idx_cards_topic ON cards(topic);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read cards (public access for study app)
CREATE POLICY "Allow public read access" ON cards
  FOR SELECT
  TO public
  USING (true);

-- Optional: Add a comment explaining the table
COMMENT ON TABLE cards IS 'Flashcard questions and answers organized by topic for architecture board exam review';
