// Export the SQL schema as a string constant so the UI can provide a 1-click "Copy SQL" button
export const SUPABASE_POSTGRES_SCHEMA = `-- ==============================================================================
-- SAFENET: Real-Time Public Safety & Emergency Coordination Platform
-- PostgreSQL Database Schema (Section 26 Compliant)
-- Fully compatible with Supabase and Neon PostgreSQL
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'family', 'volunteer', 'police', 'admin')),
    email TEXT,
    phone TEXT,
    avatar TEXT,
    badge TEXT,
    duty_status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    coordinates JSONB,
    priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL CHECK (status IN ('REPORTED', 'ACKNOWLEDGED', 'ASSIGNED', 'RESPONDING', 'RESOLVED')),
    reporter_name TEXT,
    reporter_phone TEXT,
    reporter_id TEXT,
    assigned_responder_id TEXT,
    assigned_responder_name TEXT,
    photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MISSING PERSONS TABLE
CREATE TABLE IF NOT EXISTS public.missing_persons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL,
    gender TEXT NOT NULL,
    person_type TEXT NOT NULL CHECK (person_type IN ('CHILD', 'ELDERLY', 'ADULT', 'SPECIAL_NEEDS')),
    clothing TEXT,
    identifying_features TEXT,
    photo TEXT,
    last_seen_location TEXT NOT NULL,
    last_seen_time TEXT NOT NULL,
    coordinates JSONB,
    reporter_id TEXT,
    reporter_name TEXT,
    emergency_contact TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('REPORTED', 'SEARCHING', 'POSSIBLE MATCH', 'FOUND', 'CLOSED')),
    ai_match_confidence NUMERIC,
    ai_match_cctv_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESPONDERS TABLE
CREATE TABLE IF NOT EXISTS public.responders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('police', 'volunteer', 'medical')),
    badge TEXT,
    phone TEXT,
    current_zone TEXT,
    coordinates JSONB,
    availability TEXT NOT NULL CHECK (availability IN ('available', 'busy', 'offline')),
    active_case_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('CRITICAL', 'WARNING', 'INFO')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_zone TEXT NOT NULL,
    target_role TEXT NOT NULL DEFAULT 'all',
    priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'NORMAL')),
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CROWD ZONES TABLE
CREATE TABLE IF NOT EXISTS public.crowd_zones (
    id TEXT PRIMARY KEY,
    zone_name TEXT NOT NULL,
    density NUMERIC NOT NULL DEFAULT 0,
    capacity INT NOT NULL DEFAULT 1000,
    current_count INT NOT NULL DEFAULT 0,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('NORMAL', 'MODERATE', 'CRITICAL')),
    trend TEXT DEFAULT 'STABLE',
    alert_issued BOOLEAN DEFAULT FALSE,
    coordinates JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAFETY JOURNEYS TABLE
CREATE TABLE IF NOT EXISTS public.safety_journeys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    start_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    route_status TEXT NOT NULL CHECK (route_status IN ('ON_ROUTE', 'ARRIVED', 'DEVIATION_DETECTED', 'CANCELLED')),
    trusted_contacts JSONB,
    deviation_detected BOOLEAN DEFAULT FALSE,
    deviation_reason TEXT,
    coordinates JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority);
CREATE INDEX IF NOT EXISTS idx_missing_status ON public.missing_persons(status);
CREATE INDEX IF NOT EXISTS idx_crowd_risk ON public.crowd_zones(risk_level);

-- ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_journeys ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public access for users" ON public.users;
    CREATE POLICY "Public access for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for incidents" ON public.incidents;
    CREATE POLICY "Public access for incidents" ON public.incidents FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for missing_persons" ON public.missing_persons;
    CREATE POLICY "Public access for missing_persons" ON public.missing_persons FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for responders" ON public.responders;
    CREATE POLICY "Public access for responders" ON public.responders FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for alerts" ON public.alerts;
    CREATE POLICY "Public access for alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for crowd_zones" ON public.crowd_zones;
    CREATE POLICY "Public access for crowd_zones" ON public.crowd_zones FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for safety_journeys" ON public.safety_journeys;
    CREATE POLICY "Public access for safety_journeys" ON public.safety_journeys FOR ALL USING (true) WITH CHECK (true);
END $$;
`;
