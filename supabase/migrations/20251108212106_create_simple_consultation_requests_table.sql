/*
  # Simple Consultation Requests Table

  1. New Tables
    - `consultation_requests`
      - `id` (uuid, primary key)
      - `user_name` (text)
      - `user_email` (text)
      - `user_phone` (text)
      - `consultation_type` (text)
      - `consultation_reason` (text)
      - `preferred_date` (date)
      - `preferred_time` (text)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow anyone to insert
    - Allow admins to read/update
*/

CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text,
  consultation_type text NOT NULL,
  consultation_reason text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert consultation requests"
  ON consultation_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all consultation requests"
  ON consultation_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update consultation requests"
  ON consultation_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_consultation_requests_email ON consultation_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_date ON consultation_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
