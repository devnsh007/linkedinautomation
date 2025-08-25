/*
  # Create content posts table

  1. New Tables
    - `content_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text) - Post title
      - `content` (text) - Full post content
      - `content_type` (enum) - post, article, carousel
      - `tone` (text) - professional, casual, inspirational, educational
      - `status` (enum) - draft, scheduled, published, failed
      - `hashtags` (text array) - Associated hashtags
      - `scheduled_at` (timestamp) - When to publish
      - `published_at` (timestamp) - When it was published
      - `linkedin_post_id` (text) - LinkedIn API post ID
      - `analytics_data` (jsonb) - Cached analytics data
      - `estimated_engagement` (numeric) - AI predicted engagement
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `content_posts` table
    - Add policies for users to manage their own posts
*/

-- Create enum types
CREATE TYPE content_type_enum AS ENUM ('post', 'article', 'carousel');
CREATE TYPE post_status_enum AS ENUM ('draft', 'scheduled', 'published', 'failed');

CREATE TABLE IF NOT EXISTS content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  content_type content_type_enum NOT NULL DEFAULT 'post',
  tone text NOT NULL DEFAULT 'professional',
  status post_status_enum NOT NULL DEFAULT 'draft',
  hashtags text[] DEFAULT '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  linkedin_post_id text,
  analytics_data jsonb DEFAULT '{}',
  estimated_engagement numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

-- Users can read their own posts
CREATE POLICY "Users can read own posts"
  ON content_posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own posts
CREATE POLICY "Users can insert own posts"
  ON content_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON content_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON content_posts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_posts_user_id ON content_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_at ON content_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at);