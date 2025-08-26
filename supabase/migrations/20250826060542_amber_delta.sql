/*
  # Create analytics metrics table

  1. New Tables
    - `analytics_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `post_id` (uuid, foreign key to content_posts)
      - `impressions` (integer)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `clicks` (integer)
      - `engagement_rate` (numeric)
      - `recorded_at` (timestamp)

  2. Security
    - Enable RLS on `analytics_metrics` table
    - Add policies for authenticated users to manage their own analytics data

  3. Indexes
    - Index on user_id for efficient querying
    - Index on post_id for post-specific analytics
    - Index on recorded_at for time-based queries
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
  engagement_rate numeric(5,2) DEFAULT 0.00,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user_id ON analytics_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_post_id ON analytics_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_recorded_at ON analytics_metrics(recorded_at);

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