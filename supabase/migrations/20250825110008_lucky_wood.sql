/*
  # Create scheduled posts table for automation

  1. New Tables
    - `scheduled_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `post_id` (uuid, foreign key to content_posts)
      - `scheduled_for` (timestamp) - When to publish
      - `status` (enum) - pending, processing, completed, failed
      - `attempts` (integer) - Number of publish attempts
      - `last_attempt_at` (timestamp) - Last attempt timestamp
      - `error_message` (text) - Error details if failed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `scheduled_posts` table
    - Add policies for users to manage their scheduled posts
*/

-- Create enum for scheduling status
CREATE TYPE schedule_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  scheduled_for timestamptz NOT NULL,
  status schedule_status_enum NOT NULL DEFAULT 'pending',
  attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Users can read their own scheduled posts
CREATE POLICY "Users can read own scheduled posts"
  ON scheduled_posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own scheduled posts
CREATE POLICY "Users can insert own scheduled posts"
  ON scheduled_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own scheduled posts
CREATE POLICY "Users can update own scheduled posts"
  ON scheduled_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role can update scheduled posts (for automation)
CREATE POLICY "Service can update scheduled posts"
  ON scheduled_posts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);

-- Create unique constraint to prevent duplicate scheduling
CREATE UNIQUE INDEX IF NOT EXISTS idx_scheduled_posts_unique_post 
  ON scheduled_posts(post_id) WHERE status IN ('pending', 'processing');