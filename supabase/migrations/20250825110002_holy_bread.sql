/*
  # Create analytics metrics table

  1. New Tables
    - `analytics_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `post_id` (uuid, foreign key to content_posts)
      - `impressions` (integer) - Number of views
      - `likes` (integer) - Number of likes
      - `comments` (integer) - Number of comments
      - `shares` (integer) - Number of shares
      - `clicks` (integer) - Number of clicks
      - `engagement_rate` (numeric) - Calculated engagement rate
      - `recorded_at` (timestamp) - When metrics were recorded
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `analytics_metrics` table
    - Add policies for users to read their own analytics
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

ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Users can read their own analytics
CREATE POLICY "Users can read own analytics"
  ON analytics_metrics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert/update analytics (for automated syncing)
CREATE POLICY "Service can manage analytics"
  ON analytics_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_post_id ON analytics_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON analytics_metrics(recorded_at);

-- Create unique constraint to prevent duplicate metrics for same post/time period
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_unique_post_hour 
  ON analytics_metrics(post_id, date_trunc('hour', recorded_at));