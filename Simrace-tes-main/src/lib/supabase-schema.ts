/**
 * Complete Supabase PostgreSQL Schema & Analytical Queries for ApexSim Telemetry & Race Hub.
 * Users can copy this schema directly into the Supabase SQL Editor.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- APEXSIM TELEMETRY & RACE HUB: SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(5) NOT NULL,
    number INT NOT NULL,
    nationality VARCHAR(60) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    team VARCHAR(100) NOT NULL,
    safety_rating VARCHAR(5) DEFAULT 'A',
    sim_rating INT DEFAULT 2000,
    total_races INT DEFAULT 0,
    wins INT DEFAULT 0,
    podiums INT DEFAULT 0,
    fastest_laps INT DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRACKS TABLE
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    location VARCHAR(120) NOT NULL,
    region VARCHAR(50) NOT NULL,
    country VARCHAR(60) NOT NULL,
    length_km NUMERIC(5,3) NOT NULL,
    turns INT NOT NULL,
    lap_record VARCHAR(20),
    record_holder VARCHAR(100),
    elevation_change_meters INT DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GT3 CARS TABLE
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(120) NOT NULL,
    manufacturer VARCHAR(80) NOT NULL,
    class VARCHAR(20) DEFAULT 'GT3',
    engine_spec VARCHAR(100) NOT NULL,
    horsepower INT NOT NULL,
    weight_kg INT NOT NULL,
    top_speed_kmh INT NOT NULL,
    aero_downforce VARCHAR(30) DEFAULT 'High',
    drivetrain VARCHAR(10) DEFAULT 'RWD',
    livery_primary VARCHAR(20) DEFAULT '#ff2a5f',
    livery_secondary VARCHAR(20) DEFAULT '#0f172a',
    is_custom BOOLEAN DEFAULT false,
    designer VARCHAR(100),
    accent_badge VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RACE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.race_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    session_type VARCHAR(50) NOT NULL, -- Practice, Qualifying, Sprint Race, Feature Race, Endurance
    status VARCHAR(30) DEFAULT 'Scheduled', -- Scheduled, Live, Finished, Suspended
    track_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
    region VARCHAR(50) NOT NULL,
    weather VARCHAR(40) DEFAULT 'Dry',
    air_temp_c INT DEFAULT 24,
    track_temp_c INT DEFAULT 36,
    total_laps INT DEFAULT 15,
    current_lap INT DEFAULT 0,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    fastest_lap_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    fastest_lap_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SESSION ENTRIES (GRID LINEUP)
CREATE TABLE IF NOT EXISTS public.session_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.race_sessions(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE RESTRICT,
    grid_position INT NOT NULL,
    current_position INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Running', -- Running, In Pit, Out, DNF
    laps_completed INT DEFAULT 0,
    best_lap_time_ms INT DEFAULT 0,
    last_lap_time_ms INT DEFAULT 0,
    gap_to_leader_ms INT DEFAULT 0,
    interval_ms INT DEFAULT 0,
    current_tyre VARCHAR(20) DEFAULT 'Soft',
    tyre_wear_pct NUMERIC(5,2) DEFAULT 0,
    pit_stops INT DEFAULT 0,
    fuel_liters NUMERIC(5,2) DEFAULT 60.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, driver_id)
);

-- 7. LAP TIMES & SECTOR SPLITS
CREATE TABLE IF NOT EXISTS public.lap_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.race_sessions(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    lap_number INT NOT NULL,
    sector1_ms INT NOT NULL,
    sector2_ms INT NOT NULL,
    sector3_ms INT NOT NULL,
    lap_time_ms INT NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    is_fastest_lap BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TELEMETRY LOGS (FOR REAL-TIME SAMPLING)
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.race_sessions(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    speed_kmh INT NOT NULL,
    throttle_pct INT NOT NULL,
    brake_pct INT NOT NULL,
    gear INT NOT NULL,
    rpm INT NOT NULL,
    steering_angle_deg NUMERIC(5,2),
    tire_temp_fl INT,
    tire_temp_fr INT,
    tire_temp_rl INT,
    tire_temp_rr INT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_drivers_sim_rating ON public.drivers(sim_rating DESC);
CREATE INDEX IF NOT EXISTS idx_race_sessions_status ON public.race_sessions(status);
CREATE INDEX IF NOT EXISTS idx_session_entries_session ON public.session_entries(session_id, current_position);
CREATE INDEX IF NOT EXISTS idx_lap_times_session_driver ON public.lap_times(session_id, driver_id, lap_number);
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_session ON public.telemetry_logs(session_id, recorded_at DESC);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lap_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read and write for sim racing hub client
CREATE POLICY "Public Read Access" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Access" ON public.drivers FOR ALL USING (true);

CREATE POLICY "Public Read Access" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Access" ON public.tracks FOR ALL USING (true);

CREATE POLICY "Public Read Access" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Access" ON public.cars FOR ALL USING (true);

CREATE POLICY "Public Read Access" ON public.race_sessions FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Access" ON public.race_sessions FOR ALL USING (true);

CREATE POLICY "Public Read Access" ON public.session_entries FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Access" ON public.session_entries FOR ALL USING (true);

CREATE POLICY "Public Read Access" ON public.lap_times FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Access" ON public.lap_times FOR ALL USING (true);

CREATE POLICY "Public Read Access" ON public.telemetry_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Access" ON public.telemetry_logs FOR ALL USING (true);
`;

export interface QueryDefinition {
  title: string;
  category: string;
  description: string;
  sql: string;
}

export const ANALYTICAL_SQL_QUERIES: QueryDefinition[] = [
  {
    title: 'Driver Championship Leaderboard & Win Rate',
    category: 'Championship Standings',
    description: 'Calculates points, podium ratios, win percentages, and average finish positions across all race sessions.',
    sql: `SELECT 
    d.id,
    d.name,
    d.code,
    d.team,
    d.nationality,
    d.sim_rating,
    d.safety_rating,
    d.total_races,
    d.wins,
    d.podiums,
    ROUND((d.wins::numeric / NULLIF(d.total_races, 0) * 100), 1) AS win_rate_percentage,
    ROUND((d.podiums::numeric / NULLIF(d.total_races, 0) * 100), 1) AS podium_rate_percentage,
    (d.wins * 25 + d.podiums * 15 + d.fastest_laps * 1) AS total_championship_points
FROM public.drivers d
ORDER BY total_championship_points DESC, d.wins DESC, d.sim_rating DESC;`
  },
  {
    title: 'Fastest Lap & Theoretical Best Sector Analysis',
    category: 'Session Timing',
    description: 'Identifies the absolute best lap time and calculates the theoretical best lap by combining fastest Sector 1, 2, and 3 times for a session.',
    sql: `WITH sector_bests AS (
    SELECT 
        session_id,
        MIN(sector1_ms) AS best_s1_ms,
        MIN(sector2_ms) AS best_s2_ms,
        MIN(sector3_ms) AS best_s3_ms,
        MIN(lap_time_ms) AS absolute_fastest_lap_ms
    FROM public.lap_times
    WHERE is_valid = true
    GROUP BY session_id
)
SELECT 
    rs.title AS session_name,
    t.name AS track_name,
    t.length_km,
    sb.best_s1_ms / 1000.0 AS best_s1_sec,
    sb.best_s2_ms / 1000.0 AS best_s2_sec,
    sb.best_s3_ms / 1000.0 AS best_s3_sec,
    (sb.best_s1_ms + sb.best_s2_ms + sb.best_s3_ms) / 1000.0 AS theoretical_best_lap_sec,
    sb.absolute_fastest_lap_ms / 1000.0 AS actual_fastest_lap_sec,
    ROUND(((sb.absolute_fastest_lap_ms - (sb.best_s1_ms + sb.best_s2_ms + sb.best_s3_ms)) / 1000.0)::numeric, 3) AS delta_to_optimal_sec
FROM sector_bests sb
JOIN public.race_sessions rs ON rs.id = sb.session_id
JOIN public.tracks t ON t.id = rs.track_id;`
  },
  {
    title: 'Driver Consistency & Lap Time Variance Index',
    category: 'Driver Performance',
    description: 'Computes standard deviation and consistency score across valid racing laps to identify the steadiest racers.',
    sql: `SELECT 
    d.name AS driver_name,
    d.code AS driver_code,
    c.model_name AS car_model,
    COUNT(lt.id) AS laps_analyzed,
    ROUND((AVG(lt.lap_time_ms) / 1000.0)::numeric, 3) AS avg_lap_time_sec,
    ROUND((MIN(lt.lap_time_ms) / 1000.0)::numeric, 3) AS best_lap_time_sec,
    ROUND((STDDEV_POP(lt.lap_time_ms) / 1000.0)::numeric, 3) AS lap_time_stddev_sec,
    -- Consistency score: lower stddev yields higher index out of 100
    ROUND(GREATEST(0, 100 - (STDDEV_POP(lt.lap_time_ms) / 50.0))::numeric, 1) AS consistency_score
FROM public.lap_times lt
JOIN public.drivers d ON d.id = lt.driver_id
JOIN public.session_entries se ON se.session_id = lt.session_id AND se.driver_id = lt.driver_id
JOIN public.cars c ON c.id = se.car_id
WHERE lt.is_valid = true AND lt.lap_number > 1 -- exclude out-lap
GROUP BY d.name, d.code, c.model_name
HAVING COUNT(lt.id) >= 3
ORDER BY consistency_score DESC, avg_lap_time_sec ASC;`
  },
  {
    title: 'GT3 Balance of Performance (BoP) & Manufacturer Speed',
    category: 'GT3 Analytics',
    description: 'Compares top speeds, average lap times, and podium conversion per GT3 manufacturer to monitor vehicle balance.',
    sql: `SELECT 
    c.manufacturer,
    c.model_name,
    c.engine_spec,
    c.horsepower,
    c.weight_kg,
    ROUND((c.horsepower::numeric / c.weight_kg * 1000), 1) AS power_to_weight_ratio,
    COUNT(DISTINCT se.session_id) AS sessions_entered,
    COUNT(DISTINCT se.driver_id) AS drivers_using,
    COUNT(CASE WHEN se.current_position = 1 THEN 1 END) AS total_wins,
    COUNT(CASE WHEN se.current_position <= 3 THEN 1 END) AS total_podiums,
    ROUND((AVG(se.best_lap_time_ms) / 1000.0)::numeric, 3) AS avg_best_lap_sec
FROM public.cars c
LEFT JOIN public.session_entries se ON se.car_id = c.id
GROUP BY c.id, c.manufacturer, c.model_name, c.engine_spec, c.horsepower, c.weight_kg
ORDER BY total_wins DESC, total_podiums DESC;`
  },
  {
    title: 'Live Session Telemetry Snapshot for Race Director',
    category: 'Live Race Telemetry',
    description: 'Retrieves current gap, tyre wear, sector times, and last 5-point telemetry summary for all running cars.',
    sql: `SELECT 
    se.current_position,
    d.code AS driver,
    d.name,
    c.model_name AS car,
    se.current_tyre,
    se.tyre_wear_pct AS tyre_wear,
    se.pit_stops,
    se.laps_completed,
    (se.last_lap_time_ms / 1000.0) AS last_lap,
    (se.best_lap_time_ms / 1000.0) AS best_lap,
    (se.gap_to_leader_ms / 1000.0) AS gap_to_leader,
    (se.interval_ms / 1000.0) AS interval_to_car_ahead,
    se.status
FROM public.session_entries se
JOIN public.drivers d ON d.id = se.driver_id
JOIN public.cars c ON c.id = se.car_id
WHERE se.session_id = (SELECT id FROM public.race_sessions WHERE status = 'Live' LIMIT 1)
ORDER BY se.current_position ASC;`
  }
];
