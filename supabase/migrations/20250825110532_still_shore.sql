/*
  # Create scheduled posts table

  1. New Tables
    - `scheduled_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `post_id` (uuid, foreign key to content_posts)
      - `scheduled_for` (timestamptz, not null)
      - `status` (enum: pending, processing, completed, failed)
      - `attempts` (integer, default 0)
      - `last_attempt_at` (timestamptz, nullable)
      - `error_message` (text, nullable)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `scheduled_posts` table
    - Add policies for users and service role
*/

-- Create enum for schedule status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_status_enum') THEN
    CREATE TYPE schedule_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  scheduled_for timestamptz NOT NULL,
  status schedule_status_enum DEFAULT 'pending'::schedule_status_enum NOT NULL,
  attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts (status);

-- Unique constraint to prevent duplicate pending/processing schedules for same post
CREATE UNIQUE INDEX IF NOT EXISTS idx_scheduled_posts_unique_post 
ON scheduled_posts (post_id) 
WHERE status IN ('pending', 'processing');

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own scheduled posts"
  ON scheduled_posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own scheduled posts"
  ON scheduled_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own scheduled posts"
  ON scheduled_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service can update scheduled posts"
  ON scheduled_posts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);