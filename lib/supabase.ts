import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only validate and log in development or when actually needed
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Config Check:');
  console.log('URL exists:', !!supabaseUrl);
  console.log('Key exists:', !!supabaseAnonKey);
  console.log('URL value:', supabaseUrl?.substring(0, 20) + '...');
}

// Create client with fallback values to prevent build errors
// The actual validation will happen at runtime
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('❌ Missing environment variables!');
}
