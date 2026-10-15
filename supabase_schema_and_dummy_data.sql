-- ==============================================================================
-- AquaSense: Supabase SQL Setup, RLS Policies & Dummy Telemetry Seeding
-- Project: IoT-Based Smart Water Quality Monitoring System
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create table public.readings if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL DEFAULT 'ESP32-NODE-01',
  tds numeric,
  ph numeric,
  turbidity numeric,
  temp numeric,
  status text DEFAULT 'SAFE',
  is_simulated boolean DEFAULT true,
  recorded_at timestamptz DEFAULT now()
);

-- 2. Enable Row-Level Security (RLS)
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

-- 3. Drop any conflicting existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.readings;
DROP POLICY IF EXISTS "Allow public insert access" ON public.readings;
DROP POLICY IF EXISTS "Allow public update access" ON public.readings;
DROP POLICY IF EXISTS "Allow public delete access" ON public.readings;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.readings;

-- 4. Create RLS Policies so your frontend website can SELECT, INSERT and UPDATE in real-time
CREATE POLICY "Allow public read access"
  ON public.readings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access"
  ON public.readings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON public.readings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON public.readings
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. Enable Supabase Realtime publication so table changes reflect live on the website
ALTER PUBLICATION supabase_realtime ADD TABLE public.readings;

-- 6. Insert the 8 realistic dummy water quality readings
INSERT INTO public.readings (device_id, tds, ph, turbidity, temp, status, is_simulated, recorded_at) VALUES
('ESP32-NODE-01', 210, 7.20, 0.60, 23.5, 'SAFE', true, NOW() - INTERVAL '7 hour'),
('ESP32-NODE-01', 245, 7.40, 0.80, 24.1, 'SAFE', true, NOW() - INTERVAL '6 hour'),
('ESP32-NODE-01', 310, 7.10, 1.20, 24.8, 'WARNING', true, NOW() - INTERVAL '5 hour'),
('ESP32-NODE-01', 290, 6.80, 0.90, 25.2, 'SAFE', true, NOW() - INTERVAL '4 hour'),
('ESP32-NODE-01', 580, 6.30, 2.10, 26.0, 'WARNING', true, NOW() - INTERVAL '3 hour'),
('ESP32-NODE-01', 420, 7.60, 1.50, 25.5, 'WARNING', true, NOW() - INTERVAL '2 hour'),
('ESP32-NODE-01', 350, 7.30, 0.80, 24.6, 'SAFE', true, NOW() - INTERVAL '1 hour'),
('ESP32-NODE-01', 280, 7.20, 0.70, 23.9, 'SAFE', true, NOW());

-- Done! Your database now has dummy data, RLS permissions, and real-time streaming enabled.
