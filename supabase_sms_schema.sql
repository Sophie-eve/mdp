-- ==============================================================================
-- AquaSense: Custom SMS Notification System - Supabase SQL Schema
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create table for User SMS Notification Preferences
CREATE TABLE IF NOT EXISTS public.user_sms_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  is_enabled boolean DEFAULT true,
  min_severity text NOT NULL DEFAULT 'CRITICAL' CHECK (min_severity IN ('CRITICAL', 'WARNING')),
  cooldown_minutes integer NOT NULL DEFAULT 10 CHECK (cooldown_minutes BETWEEN 1 AND 120),
  consent_given boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_sms_pref UNIQUE (user_id)
);

-- 2. Create table for SMS Delivery History Logs
CREATE TABLE IF NOT EXISTS public.sms_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  phone_number text NOT NULL,
  message text NOT NULL,
  trigger_reason text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'NOT_CONFIGURED', 'RATE_LIMITED')),
  provider text NOT NULL DEFAULT 'fast2sms',
  provider_request_id text,
  error_details text,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable Row-Level Security (RLS) on both tables
ALTER TABLE public.user_sms_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_delivery_logs ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any previous policies
DROP POLICY IF EXISTS "Users can view own SMS preferences" ON public.user_sms_preferences;
DROP POLICY IF EXISTS "Users can insert own SMS preferences" ON public.user_sms_preferences;
DROP POLICY IF EXISTS "Users can update own SMS preferences" ON public.user_sms_preferences;
DROP POLICY IF EXISTS "Allow anon SMS preferences read" ON public.user_sms_preferences;
DROP POLICY IF EXISTS "Allow anon SMS preferences write" ON public.user_sms_preferences;

DROP POLICY IF EXISTS "Users can view own SMS delivery history" ON public.sms_delivery_logs;
DROP POLICY IF EXISTS "Allow backend and authenticated insert logs" ON public.sms_delivery_logs;
DROP POLICY IF EXISTS "Allow anon SMS delivery logs read" ON public.sms_delivery_logs;
DROP POLICY IF EXISTS "Allow anon SMS delivery logs insert" ON public.sms_delivery_logs;

-- 5. RLS Policies for user_sms_preferences
-- Authenticated users manage only their own record
CREATE POLICY "Users can view own SMS preferences"
  ON public.user_sms_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SMS preferences"
  ON public.user_sms_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SMS preferences"
  ON public.user_sms_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fallback policies for public anon preview mode (read/write by session)
CREATE POLICY "Allow anon SMS preferences read"
  ON public.user_sms_preferences
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon SMS preferences write"
  ON public.user_sms_preferences
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 6. RLS Policies for sms_delivery_logs
CREATE POLICY "Users can view own SMS delivery history"
  ON public.sms_delivery_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow backend and authenticated insert logs"
  ON public.sms_delivery_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon SMS delivery logs read"
  ON public.sms_delivery_logs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon SMS delivery logs insert"
  ON public.sms_delivery_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 7. Add tables to Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sms_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_delivery_logs;

-- Done! Your Supabase database is now configured for custom SMS alerts and delivery tracking.
