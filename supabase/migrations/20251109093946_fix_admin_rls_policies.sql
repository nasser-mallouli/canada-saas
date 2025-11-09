/*
  # Fix Admin RLS Policies

  1. Changes
    - Update RLS policies to check for admin role in raw_user_meta_data
    - This is where Supabase stores the data from signUp options.data
  
  2. Security
    - Maintains strict admin-only access
    - Uses correct metadata field
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read page views" ON page_views;
DROP POLICY IF EXISTS "Admins can read button clicks" ON button_clicks;
DROP POLICY IF EXISTS "Admins can read CRS calculations" ON crs_calculations_detailed;

-- Recreate with correct metadata field
CREATE POLICY "Admins can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'admin' OR
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Admins can read button clicks"
  ON button_clicks
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'admin' OR
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Admins can read CRS calculations"
  ON crs_calculations_detailed
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'admin' OR
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

-- Also update consultation_requests policies if they exist
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;

CREATE POLICY "Admins can view all consultation requests"
  ON consultation_requests
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'admin' OR
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );
