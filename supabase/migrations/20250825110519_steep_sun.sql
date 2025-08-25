/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) 
      - `email` (text, unique, not null)
      - `linkedin_id` (text, unique, not null)
      - `linkedin_access_token` (text, nullable)
      - `linkedin_refresh_token` (text, nullable)
      - `profile_data` (jsonb, default empty object)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  linkedin_id text UNIQUE NOT NULL,
  linkedin_access_token text,
  linkedin_refresh_token text,
  profile_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_linkedin_id ON users (linkedin_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);