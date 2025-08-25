/*
  # Create content posts table

  1. New Tables
    - `content_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, not null)
      - `content` (text, not null) 
      - `content_type` (enum: post, article, carousel)
      - `tone` (text, default 'professional')
      - `status` (enum: draft, scheduled, published, failed)
      - `hashtags` (text array, default empty)
      - `scheduled_at` (timestamptz, nullable)
      - `published_at` (timestamptz, nullable)
      - `linkedin_post_id` (text, nullable)
      - `analytics_data` (jsonb, default empty object)
      - `estimated_engagement` (numeric, default 0)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `content_posts` table
    - Add policies for users to manage their own posts
*/

-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type_enum') THEN
    CREATE TYPE content_type_enum AS ENUM ('post', 'article', 'carousel');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status_enum') THEN
    CREATE TYPE post_status_enum AS ENUM ('draft', 'scheduled', 'published', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  content_type content_type_enum DEFAULT 'post'::content_type_enum NOT NULL,
  tone text DEFAULT 'professional' NOT NULL,
  status post_status_enum DEFAULT 'draft'::post_status_enum NOT NULL,
  hashtags text[] DEFAULT '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  linkedin_post_id text,
  analytics_data jsonb DEFAULT '{}'::jsonb,
  estimated_engagement numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_posts_user_id ON content_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts (status);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_at ON content_posts (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts (published_at);

-- Enable RLS
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own posts"
  ON content_posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own posts"
  ON content_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON content_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON content_posts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());