/*
  # Create analytics_metrics table

  1. New Tables
    - `analytics_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `post_id` (uuid, foreign key to content_posts)
      - `impressions` (integer, default 0)
      - `likes` (integer, default 0)
      - `comments` (integer, default 0)
      - `shares` (integer, default 0)
      - `clicks` (integer, default 0)
      - `engagement_rate` (numeric, calculated engagement percentage)
      - `recorded_at` (timestamptz, when metrics were recorded)
      - `created_at` (timestamptz, when record was created)

  2. Security
    - Enable RLS on `analytics_metrics` table
    - Add policy for authenticated users to read their own analytics data
    - Add policy for authenticated users to insert their own analytics data
    - Add policy for authenticated users to update their own analytics data
    - Add policy for service role to manage all analytics data (for automated sync)

  3. Performance
    - Index on user_id for fast user queries
    - Index on post_id for fast post lookups
    - Index on recorded_at for time-based queries
    - Unique constraint on (post_id, date_trunc('hour', recorded_at)) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS analytics_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  impressions integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  clicks integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user_id ON analytics_metrics (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_post_id ON analytics_metrics (post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_recorded_at ON analytics_metrics (recorded_at);

-- Unique constraint to prevent duplicate hourly metrics for the same post
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_metrics_post_hour 
  ON analytics_metrics (post_id, date_trunc('hour', recorded_at));

-- RLS Policies
CREATE POLICY "Users can read own analytics"
  ON analytics_metrics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics"
  ON analytics_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own analytics"
  ON analytics_metrics
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service can manage all analytics"
  ON analytics_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);