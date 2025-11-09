/*
  # Analytics and Admin Dashboard Schema

  1. New Tables
    - `page_views` - Track all page visits
      - `id` (uuid, primary key)
      - `page_path` (text)
      - `page_title` (text)
      - `user_agent` (text)
      - `session_id` (text)
      - `created_at` (timestamptz)
    
    - `button_clicks` - Track button/link clicks
      - `id` (uuid, primary key)
      - `button_label` (text)
      - `page_path` (text)
      - `session_id` (text)
      - `created_at` (timestamptz)
    
    - `crs_calculations_detailed` - Detailed CRS calculation results
      - `id` (uuid, primary key)
      - `user_name` (text)
      - `user_email` (text)
      - `user_phone` (text)
      - `input_data` (jsonb) - All form inputs
      - `crs_score` (integer)
      - `category_breakdown` (jsonb)
      - `improvement_suggestions` (jsonb)
      - `session_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow anonymous inserts for tracking
    - Only admins can read
*/

-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  page_title text,
  user_agent text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);

-- Button Clicks Table
CREATE TABLE IF NOT EXISTS button_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  button_label text NOT NULL,
  page_path text NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE button_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert button clicks"
  ON button_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read button clicks"
  ON button_clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_button_clicks_label ON button_clicks(button_label);
CREATE INDEX IF NOT EXISTS idx_button_clicks_created ON button_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_button_clicks_session ON button_clicks(session_id);

-- Detailed CRS Calculations Table
CREATE TABLE IF NOT EXISTS crs_calculations_detailed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text,
  input_data jsonb NOT NULL,
  crs_score integer NOT NULL,
  category_breakdown jsonb NOT NULL,
  improvement_suggestions jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crs_calculations_detailed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert CRS calculations"
  ON crs_calculations_detailed
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read CRS calculations"
  ON crs_calculations_detailed
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_crs_detailed_email ON crs_calculations_detailed(user_email);
CREATE INDEX IF NOT EXISTS idx_crs_detailed_score ON crs_calculations_detailed(crs_score);
CREATE INDEX IF NOT EXISTS idx_crs_detailed_created ON crs_calculations_detailed(created_at DESC);
