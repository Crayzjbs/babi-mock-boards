-- SQL function to efficiently get topic counts
-- Run this in your Supabase SQL Editor to create the function

CREATE OR REPLACE FUNCTION get_topic_counts()
RETURNS TABLE (topic text, count bigint) 
LANGUAGE sql
STABLE
AS $$
  SELECT topic, COUNT(*)::bigint as count
  FROM cards
  GROUP BY topic
  ORDER BY topic;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_topic_counts() TO anon, authenticated;
