/*
  # Create analytics metrics table (safe for Supabase)

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
      - `engagement_rate` (decimal)
      - `recorded_at` (timestamp)
      - `recorded_hour` (timestamp) - filled by trigger
      - `created_at` (timestamp)

  2. Security
    - RLS enabled
    - Policies for read/insert
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
  engagement_rate decimal(5,2) DEFAULT 0.00,
  recorded_at timestamptz DEFAULT now(),
  recorded_hour timestamptz, -- set via trigger
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user_id ON analytics_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_post_id ON analytics_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_recorded_at ON analytics_metrics(recorded_at);

-- Unique per hour
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_metrics_unique 
  ON analytics_metrics(post_id, recorded_hour);

-- Enable RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own metrics"
  ON analytics_metrics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own metrics"
  ON analytics_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to set recorded_hour and engagement_rate
CREATE OR REPLACE FUNCTION set_metrics_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure recorded_hour is truncated to hour
  NEW.recorded_hour := date_trunc('hour', NEW.recorded_at);

  -- Calculate engagement rate
  IF NEW.impressions > 0 THEN
    NEW.engagement_rate := ROUND(
      ((NEW.likes + NEW.comments + NEW.shares)::decimal / NEW.impressions::decimal) * 100, 
      2
    );
  ELSE
    NEW.engagement_rate := 0.00;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inserts/updates
CREATE TRIGGER trg_set_metrics_defaults
  BEFORE INSERT OR UPDATE ON analytics_metrics
  FOR EACH ROW
  EXECUTE FUNCTION set_metrics_defaults();
