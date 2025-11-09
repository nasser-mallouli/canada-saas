/*
  # Pathway Advisor Tables

  1. New Tables
    - `pathway_advisor_submissions`
      - `id` (uuid, primary key)
      - `user_name` (text)
      - `user_email` (text)
      - `user_phone` (text)
      - `birth_date` (date)
      - `citizenship_country` (text)
      - `residence_country` (text)
      - `education_level` (text)
      - `work_experience_years` (numeric)
      - `field_of_study` (text)
      - `language_tests` (jsonb) - stores test types and scores
      - `marital_status` (text)
      - `has_canadian_relative` (boolean)
      - `has_job_offer` (boolean)
      - `has_canadian_experience` (boolean)
      - `has_police_record` (boolean)
      - `available_funds` (numeric)
      - `pathway_goal` (text) - study/work/pr/quebec/citizenship
      - `pathway_specific_data` (jsonb) - stores path-specific answers
      - `eligibility_results` (jsonb) - stores calculated results
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `pathway_advisor_submissions` table
    - Add policy for users to read their own submissions
    - Add policy for admins to read all submissions
*/

CREATE TABLE IF NOT EXISTS pathway_advisor_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text,
  birth_date date,
  citizenship_country text,
  residence_country text,
  education_level text,
  work_experience_years numeric DEFAULT 0,
  field_of_study text,
  language_tests jsonb DEFAULT '[]'::jsonb,
  marital_status text,
  has_canadian_relative boolean DEFAULT false,
  has_job_offer boolean DEFAULT false,
  has_canadian_experience boolean DEFAULT false,
  has_police_record boolean DEFAULT false,
  available_funds numeric DEFAULT 0,
  pathway_goal text,
  pathway_specific_data jsonb DEFAULT '{}'::jsonb,
  eligibility_results jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pathway_advisor_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own advisor submissions"
  ON pathway_advisor_submissions
  FOR SELECT
  TO authenticated
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can read all advisor submissions"
  ON pathway_advisor_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Anyone can insert advisor submissions"
  ON pathway_advisor_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pathway_advisor_email ON pathway_advisor_submissions(user_email);
CREATE INDEX IF NOT EXISTS idx_pathway_advisor_created ON pathway_advisor_submissions(created_at DESC);
