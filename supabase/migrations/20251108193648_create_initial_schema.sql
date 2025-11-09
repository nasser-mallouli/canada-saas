/*
  # Canadian Immigration Concierge - Initial Database Schema

  ## Overview
  This migration creates the foundational database structure for the Canadian Immigration Concierge MVP,
  including user management, CRS calculations, AI-generated roadmaps, service bookings, and agent management.

  ## New Tables

  ### 1. `user_profiles`
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `phone` (text)
  - `target_province` (text)
  - `target_city` (text)
  - `planned_arrival_date` (date, nullable)
  - `current_location` (text, nullable)
  - `immigration_status` (text, nullable)
  - `language_preference` (text, default 'en')
  - `notification_settings` (jsonb, default '{}')
  - `role` (text, default 'user') - 'user' or 'agent'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `crs_calculations`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles, nullable for anonymous)
  - `calculation_date` (timestamptz)
  - `score` (integer, 0-1200)
  - `category_breakdown` (jsonb) - stores points by category
  - `input_data` (jsonb) - stores all form answers
  - `is_latest` (boolean, default true)
  - `status` (text, default 'completed')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `roadmaps`
  - `id` (uuid, primary key)
  - `calculation_id` (uuid, references crs_calculations)
  - `user_id` (uuid, references user_profiles, nullable)
  - `markdown_content` (text) - AI-generated markdown
  - `generation_date` (timestamptz)
  - `llm_model_used` (text)
  - `satisfaction_rating` (integer, 1-5, nullable)
  - `regeneration_count` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `service_bookings`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `service_type` (text) - 'information_session' or 'settlement_support'
  - `booking_date` (timestamptz)
  - `scheduled_datetime` (timestamptz, nullable)
  - `status` (text, default 'pending') - 'pending', 'confirmed', 'completed', 'cancelled'
  - `assigned_agent_id` (uuid, references user_profiles, nullable)
  - `selected_services` (jsonb, default '[]')
  - `pricing_details` (jsonb, nullable)
  - `notes` (text, nullable)
  - `specific_topics` (jsonb, default '[]')
  - `arrival_details` (jsonb, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `consultation_bookings`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `calculation_id` (uuid, references crs_calculations, nullable)
  - `consultation_type` (text)
  - `consultant_id` (uuid, references user_profiles, nullable)
  - `scheduled_datetime` (timestamptz)
  - `duration_minutes` (integer, default 60)
  - `status` (text, default 'scheduled')
  - `payment_status` (text, default 'pending')
  - `meeting_link` (text, nullable)
  - `recording_url` (text, nullable)
  - `summary` (text, nullable)
  - `questions` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `marketplace_waitlist`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles, nullable)
  - `email` (text)
  - `service_types` (jsonb, default '[]')
  - `signup_date` (timestamptz)
  - `notified` (boolean, default false)
  - `preferences` (jsonb, default '{}')
  - `created_at` (timestamptz)

  ### 7. `agent_notes`
  - `id` (uuid, primary key)
  - `booking_id` (uuid, nullable) - can reference service_bookings or consultation_bookings
  - `agent_id` (uuid, references user_profiles)
  - `note_content` (text)
  - `note_type` (text) - 'consultation', 'follow_up', 'internal'
  - `is_private` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. `pdf_generations`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `roadmap_id` (uuid, references roadmaps)
  - `generation_date` (timestamptz)
  - `status` (text, default 'pending')
  - `file_path` (text, nullable)
  - `file_size` (integer, nullable)
  - `download_count` (integer, default 0)
  - `error_message` (text, nullable)
  - `created_at` (timestamptz)

  ## Security

  - Enable RLS on all tables
  - Users can only access their own data
  - Agents can access assigned leads
  - Proper policies for read/insert/update/delete operations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  target_province text,
  target_city text,
  planned_arrival_date date,
  current_location text,
  immigration_status text,
  language_preference text DEFAULT 'en',
  notification_settings jsonb DEFAULT '{}',
  role text DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crs_calculations table
CREATE TABLE IF NOT EXISTS crs_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  calculation_date timestamptz DEFAULT now(),
  score integer NOT NULL CHECK (score >= 0 AND score <= 1200),
  category_breakdown jsonb NOT NULL DEFAULT '{}',
  input_data jsonb NOT NULL DEFAULT '{}',
  is_latest boolean DEFAULT true,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id uuid REFERENCES crs_calculations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  markdown_content text NOT NULL,
  generation_date timestamptz DEFAULT now(),
  llm_model_used text,
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  regeneration_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('information_session', 'settlement_support')),
  booking_date timestamptz DEFAULT now(),
  scheduled_datetime timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  assigned_agent_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  selected_services jsonb DEFAULT '[]',
  pricing_details jsonb,
  notes text,
  specific_topics jsonb DEFAULT '[]',
  arrival_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultation_bookings table
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  calculation_id uuid REFERENCES crs_calculations(id) ON DELETE SET NULL,
  consultation_type text NOT NULL,
  consultant_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  scheduled_datetime timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  meeting_link text,
  recording_url text,
  summary text,
  questions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create marketplace_waitlist table
CREATE TABLE IF NOT EXISTS marketplace_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  service_types jsonb DEFAULT '[]',
  signup_date timestamptz DEFAULT now(),
  notified boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create agent_notes table
CREATE TABLE IF NOT EXISTS agent_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid,
  agent_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  note_content text NOT NULL,
  note_type text CHECK (note_type IN ('consultation', 'follow_up', 'internal')),
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pdf_generations table
CREATE TABLE IF NOT EXISTS pdf_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  roadmap_id uuid REFERENCES roadmaps(id) ON DELETE CASCADE,
  generation_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  file_path text,
  file_size integer,
  download_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_crs_calculations_user_id ON crs_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_crs_calculations_score ON crs_calculations(score);
CREATE INDEX IF NOT EXISTS idx_roadmaps_calculation_id ON roadmaps(calculation_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_user_id ON service_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user_id ON consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_scheduled ON consultation_bookings(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_agent_notes_agent_id ON agent_notes(agent_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crs_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Agents can view user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

-- RLS Policies for crs_calculations
CREATE POLICY "Users can view own calculations"
  ON crs_calculations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own calculations"
  ON crs_calculations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own calculations"
  ON crs_calculations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can view all calculations"
  ON crs_calculations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Anonymous can insert calculations"
  ON crs_calculations FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous can view own calculations"
  ON crs_calculations FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- RLS Policies for roadmaps
CREATE POLICY "Users can view own roadmaps"
  ON roadmaps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own roadmaps"
  ON roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own roadmaps"
  ON roadmaps FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can view all roadmaps"
  ON roadmaps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

-- RLS Policies for service_bookings
CREATE POLICY "Users can view own service bookings"
  ON service_bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own service bookings"
  ON service_bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own service bookings"
  ON service_bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can view all service bookings"
  ON service_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents can update assigned bookings"
  ON service_bookings FOR UPDATE
  TO authenticated
  USING (
    assigned_agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for consultation_bookings
CREATE POLICY "Users can view own consultation bookings"
  ON consultation_bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consultation bookings"
  ON consultation_bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can view all consultation bookings"
  ON consultation_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents can update assigned consultations"
  ON consultation_bookings FOR UPDATE
  TO authenticated
  USING (
    consultant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for marketplace_waitlist
CREATE POLICY "Users can view own waitlist entries"
  ON marketplace_waitlist FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert waitlist entries"
  ON marketplace_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous can insert waitlist entries"
  ON marketplace_waitlist FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Agents can view all waitlist entries"
  ON marketplace_waitlist FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

-- RLS Policies for agent_notes
CREATE POLICY "Agents can view own notes"
  ON agent_notes FOR SELECT
  TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Agents can insert notes"
  ON agent_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents can update own notes"
  ON agent_notes FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

-- RLS Policies for pdf_generations
CREATE POLICY "Users can view own pdf generations"
  ON pdf_generations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert pdf generations"
  ON pdf_generations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can view all pdf generations"
  ON pdf_generations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('agent', 'admin')
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crs_calculations_updated_at BEFORE UPDATE ON crs_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_bookings_updated_at BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_notes_updated_at BEFORE UPDATE ON agent_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
