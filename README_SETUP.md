# Flashcard Quiz App Setup

## Prerequisites
- Node.js 20+ installed
- A Supabase account and project

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings (Project Settings > API).

### 2. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the contents of `supabase_schema.sql` to create the `cards` table

### 3. Import Data
1. Prepare your `flashcard_data.csv` with columns: `topic`, `question`, `answer`
2. In Supabase dashboard, go to Table Editor > cards table
3. Click "Insert" > "Import data from CSV"
4. Upload your CSV file (the `id` and `created_at` columns will be auto-generated)

### 4. Run the App
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## CSV Format Example
Your `flashcard_data.csv` should look like:
```csv
topic,question,answer
History of Architecture,Who designed the Parthenon?,Ictinus and Callicrates
Structural,What is the modulus of elasticity of steel?,29000 ksi or 200 GPa
Standards & Codes,What is the minimum ceiling height for habitable rooms?,2.40 meters
```

## Features
- Topic-based study sessions
- Flip-to-reveal flashcard interaction
- Shuffle mode (per-topic or all topics)
- Self-rating system (Again, Hard, Good, Easy)
- Session progress tracking
- Review missed cards
- Light/dark mode support
- Keyboard shortcuts (Space/Enter to flip, 1-4 for ratings)
