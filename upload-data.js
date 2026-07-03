const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket
  }
});

async function uploadData() {
  console.log('📚 Starting data upload to Supabase...\n');

  // Read CSV file
  const csvPath = path.join(__dirname, 'flashcard_data_sample.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  console.log(`Found ${dataLines.length} flashcards to upload\n`);

  // Parse CSV and prepare data
  const cards = [];
  let id = 1;
  
  for (const line of dataLines) {
    // Simple CSV parsing (handles basic cases)
    const match = line.match(/^([^,]+),([^,]+),(.+)$/);
    if (match) {
      const [, topic, question, answer] = match;
      cards.push({
        id: id++,
        topic: topic.trim(),
        question: question.trim(),
        answer: answer.trim()
      });
    }
  }

  console.log('📊 Cards by topic:');
  const topicCounts = {};
  cards.forEach(card => {
    topicCounts[card.topic] = (topicCounts[card.topic] || 0) + 1;
  });
  Object.entries(topicCounts).forEach(([topic, count]) => {
    console.log(`  - ${topic}: ${count} cards`);
  });
  console.log('');

  // Delete existing data
  console.log('🗑️  Clearing existing data...');
  const { error: deleteError } = await supabase
    .from('cards')
    .delete()
    .neq('id', 0); // Delete all rows

  if (deleteError) {
    console.log('⚠️  No existing data to clear (or table is empty)');
  } else {
    console.log('✅ Existing data cleared\n');
  }

  // Insert new data
  console.log('⬆️  Uploading flashcards...');
  const { data, error } = await supabase
    .from('cards')
    .insert(cards)
    .select();

  if (error) {
    console.error('❌ Error uploading data:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully uploaded ${data.length} flashcards!\n`);

  // Verify upload
  console.log('🔍 Verifying upload...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('cards')
    .select('id, topic, question')
    .limit(5);

  if (verifyError) {
    console.error('❌ Error verifying data:', verifyError.message);
  } else {
    console.log('✅ Sample of uploaded data:');
    verifyData.forEach(card => {
      console.log(`  - [${card.id}] ${card.topic}: ${card.question.substring(0, 50)}...`);
    });
  }

  console.log('\n🎉 Data upload complete!');
  console.log('🌐 Your app should now show the flashcards.');
}

uploadData().catch(console.error);
