-- ==============================================================================
-- SAFENET: Real-Time Public Safety & Emergency Coordination Platform
-- PostgreSQL Database Schema (Section 26 Compliant)
-- Fully compatible with Supabase and Neon PostgreSQL
-- Deployment Scenario: Dhammachakra Pravartan Din at Deekshabhoomi, Nagpur
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

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_missing_status ON public.missing_persons(status);
CREATE INDEX IF NOT EXISTS idx_responders_avail ON public.responders(availability);
CREATE INDEX IF NOT EXISTS idx_responders_zone ON public.responders(current_zone);
CREATE INDEX IF NOT EXISTS idx_crowd_risk ON public.crowd_zones(risk_level);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON public.alerts(priority);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_journeys ENABLE ROW LEVEL SECURITY;

-- Allow public read and write access for hackathon / emergency operations
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

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION (If running on Supabase)
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.missing_persons;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.responders;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_zones;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- BASELINE SEED DATA (Dhammachakra Pravartan Din, Deekshabhoomi, Nagpur)
-- ==============================================================================
INSERT INTO public.users (id, name, role, email, phone, badge) VALUES
('usr-001', 'Priya Sharma', 'citizen', 'priya.s@example.com', '+91 98201 12345', NULL),
('usr-002', 'Rajesh Verma', 'family', 'rajesh.v@example.com', '+91 94221 67890', NULL),
('usr-003', 'Amit Deshmukh', 'volunteer', 'amit.d@safenet.org', '+91 98810 54321', 'VOL-Sector-B'),
('usr-004', 'Insp. Suresh Deshmukh', 'police', 'suresh.d@mahapolice.gov.in', '+91 94220 11223', 'MH-NGP-P-4402'),
('usr-005', 'Controller Anita Roy', 'admin', 'anita.roy@nagpurcontrol.gov.in', '+91 98230 99887', 'CMD-HQ-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.crowd_zones (id, zone_name, density, capacity, current_count, risk_level, trend, coordinates) VALUES
('Z-01', 'Main Gate (North)', 65, 8000, 5200, 'MODERATE', 'RISING', '{"lat": 21.1278, "lng": 79.0664}'),
('Z-02', 'Exit B (East)', 87, 5000, 4350, 'CRITICAL', 'RAPID_SURGE', '{"lat": 21.1282, "lng": 79.0691}'),
('Z-03', 'Exit C (South Egress)', 35, 6000, 2100, 'NORMAL', 'STABLE', '{"lat": 21.1255, "lng": 79.0672}'),
('Z-04', 'Stupa Inner Sanctum', 72, 4000, 2880, 'MODERATE', 'STABLE', '{"lat": 21.1269, "lng": 79.0679}'),
('Z-05', 'Food & Water Pavilion', 58, 4500, 2610, 'MODERATE', 'FALLING', '{"lat": 21.1261, "lng": 79.0695}'),
('Z-06', 'Medical Aid Post #1', 25, 1000, 250, 'NORMAL', 'STABLE', '{"lat": 21.1272, "lng": 79.0655}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.incidents (id, category, description, location, coordinates, priority, status, reporter_name, reporter_phone, assigned_responder_name) VALUES
('INC-2026-001', 'Crowd Surge', 'Compaction reported near Exit B turnstiles. Attendee velocity slowed.', 'Exit B (East)', '{"lat": 21.1282, "lng": 79.0691}', 'CRITICAL', 'RESPONDING', 'Control Room Automated Detection', 'N/A', 'Insp. Suresh Deshmukh'),
('INC-2026-002', 'Medical Emergency', 'Elderly pilgrim feeling dizzy and dehydrated near Food Stall 4.', 'Food & Water Pavilion', '{"lat": 21.1261, "lng": 79.0695}', 'HIGH', 'ASSIGNED', 'Sunil Gaikwad', '+91 98224 88771', 'Medic Team Beta'),
('INC-2026-003', 'Chain Snatching', 'Gold chain snatched in dense queue near North Garden entrance.', 'North Garden Walkway', '{"lat": 21.1280, "lng": 79.0658}', 'HIGH', 'REPORTED', 'Pooja Kulkarni', '+91 97650 33441', NULL),
('INC-2026-004', 'Suspicious Bag', 'Unattended black backpack observed unattended for over 25 mins beside bench.', 'West Perimeter Pathway', '{"lat": 21.1267, "lng": 79.0650}', 'HIGH', 'ACKNOWLEDGED', 'Amit Deshmukh (Volunteer)', '+91 98810 54321', 'Insp. Suresh Deshmukh'),
('INC-2026-005', 'Lost Elderly Person', 'Senior citizen separated from family group during flower procession.', 'Stupa Outer Ring', '{"lat": 21.1270, "lng": 79.0682}', 'MEDIUM', 'ASSIGNED', 'Ramesh Meshram', '+91 94231 22998', 'Volunteer Unit 03')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.missing_persons (id, name, age, gender, person_type, clothing, identifying_features, last_seen_location, last_seen_time, emergency_contact, status, ai_match_confidence, ai_match_cctv_id) VALUES
('MSP-2026-001', 'Aarohi Verma', 6, 'Female', 'CHILD', 'Yellow floral frock, red ribbon hairband, pink sandals', 'Small birthmark on left wrist', 'Exit B (East)', '10:45 AM', '+91 94221 67890', 'POSSIBLE MATCH', 91, 'CCTV-CAM-04'),
('MSP-2026-002', 'Babanrao Wankhede', 74, 'Male', 'ELDERLY', 'White Kurta-Pyjama, brown Nehru jacket, silver walking stick', 'Speaks Marathi, slightly hard of hearing', 'Main Stupa Gate', '11:15 AM', '+91 98901 23456', 'SEARCHING', NULL, NULL),
('MSP-2026-003', 'Rohan Patel', 9, 'Male', 'CHILD', 'Navy blue t-shirt with superhero print, denim shorts', 'Glasses with blue frame', 'Food Pavilion #2', '11:30 AM', '+91 97644 55667', 'SEARCHING', NULL, NULL),
('MSP-2026-004', 'Sunita Jadhav', 12, 'Female', 'CHILD', 'Green salwar suit, black shoes', 'Carrying a small purple shoulder pouch', 'Water Distribution Post', '09:50 AM', '+91 98230 44332', 'FOUND', 98, 'CCTV-CAM-02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.responders (id, name, role, badge, phone, current_zone, availability) VALUES
('RESP-001', 'Insp. Suresh Deshmukh', 'police', 'MH-NGP-P-4402', '+91 94220 11223', 'Exit B (East)', 'busy'),
('RESP-002', 'Sub-Insp. Pradeep Raut', 'police', 'MH-NGP-P-4418', '+91 94220 11244', 'Main Gate (North)', 'available'),
('RESP-003', 'Constable Manoj Tiwari', 'police', 'MH-NGP-P-5021', '+91 94220 11309', 'Exit C (South)', 'available'),
('RESP-004', 'Amit Deshmukh', 'volunteer', 'VOL-Sector-B', '+91 98810 54321', 'Exit B (East)', 'busy'),
('RESP-005', 'Neha Patil', 'volunteer', 'VOL-Sector-A', '+91 98810 54388', 'Stupa Inner Sanctum', 'available'),
('RESP-006', 'Medic Team Beta (Dr. Joshi)', 'medical', 'AMB-MED-02', '+91 98224 88771', 'Food & Water Pavilion', 'busy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alerts (id, type, title, message, target_zone, target_role, priority, created_by) VALUES
('ALT-2026-001', 'CRITICAL', '⚠️ CROWD DIVERSION: EXIT B CONGESTED', 'Exit B has reached 87% density. Attendees are requested to calmly proceed towards Exit C (South Egress). Follow volunteer marshals.', 'Exit B (East)', 'all', 'CRITICAL', 'Central Control Room'),
('ALT-2026-002', 'WARNING', 'MISSING CHILD LOOKOUT: AAROHI VERMA (6Y)', 'Aarohi Verma (6y), wearing yellow floral frock with red ribbon. Last seen near Exit B. If seen, contact Help Desk #3 or Police immediately.', 'All Sectors', 'all', 'HIGH', 'Central Control Room')
ON CONFLICT (id) DO NOTHING;
