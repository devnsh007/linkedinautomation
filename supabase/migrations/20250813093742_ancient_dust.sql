/*
  # Create users table for LinkedIn authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `linkedin_id` (text, unique)
      - `linkedin_access_token` (text)
      - `linkedin_refresh_token` (text, nullable)
      - `profile_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  linkedin_id text UNIQUE NOT NULL,
  linkedin_access_token text NOT NULL,
  linkedin_refresh_token text,
  profile_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create content_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('post', 'article', 'carousel')),
  tone text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  linkedin_post_id text,
  analytics_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own posts"
  ON content_posts
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth.uid()::text = id::text));