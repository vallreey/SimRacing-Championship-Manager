import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Driver,
  Track,
  GT3Car,
  RaceSession,
  SessionEntry,
  TelemetryPoint,
  SupabaseConfig,
  SessionStatus,
} from '../types';
import {
  INITIAL_DRIVERS,
  INITIAL_TRACKS,
  INITIAL_CARS,
  INITIAL_SESSIONS,
} from '../data/mockData';
import {
  getStoredSupabaseCredentials,
  saveStoredSupabaseCredentials,
  clearStoredSupabaseCredentials,
  getSupabaseClient,
  testSupabaseConnection,
} from '../lib/supabase';

interface SimRacingContextType {
  drivers: Driver[];
  tracks: Track[];
  cars: GT3Car[];
  sessions: RaceSession[];
  activeSessionId: string;
  activeSession: RaceSession | undefined;
  selectedDriverId: string;
  isSimulating: boolean;
  simulationSpeed: number;
  liveTelemetry: TelemetryPoint;
  supabaseConfig: SupabaseConfig;
  recentEvents: string[];

  // Actions
  setActiveSessionId: (id: string) => void;
  setSelectedDriverId: (id: string) => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<Driver>;
  updateDriver: (id: string, updates: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  addCar: (car: Omit<GT3Car, 'id' | 'isCustom'>) => Promise<GT3Car>;
  addSession: (sessionData: {
    title: string;
    sessionType: RaceSession['sessionType'];
    region: RaceSession['region'];
    trackId: string;
    weather: RaceSession['weather'];
    totalLaps: number;
    airTempC: number;
    trackTempC: number;
    assignedDrivers: { driverId: string; carId: string }[];
  }) => Promise<RaceSession>;
  updateSessionStatus: (sessionId: string, status: SessionStatus) => void;
  addDriverToSession: (sessionId: string, driverId: string, carId: string) => void;
  removeDriverFromSession: (sessionId: string, driverId: string) => void;
  resetSession: (sessionId: string) => void;

  // Supabase actions
  connectSupabase: (url: string, anonKey: string) => Promise<{ success: boolean; message: string }>;
  disconnectSupabase: () => void;
  syncToSupabase: () => Promise<{ success: boolean; message: string }>;
  pullFromSupabase: () => Promise<{ success: boolean; message: string }>;
}

const SimRacingContext = createContext<SimRacingContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  DRIVERS: 'apexsim_drivers_v1',
  CARS: 'apexsim_cars_v1',
  SESSIONS: 'apexsim_sessions_v1',
  TRACKS: 'apexsim_tracks_v1',
};

export const SimRacingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage or Fallback to initial seeds
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.DRIVERS);
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TRACKS);
      return saved ? JSON.parse(saved) : INITIAL_TRACKS;
    } catch {
      return INITIAL_TRACKS;
    }
  });

  const [cars, setCars] = useState<GT3Car[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CARS);
      return saved ? JSON.parse(saved) : INITIAL_CARS;
    } catch {
      return INITIAL_CARS;
    }
  });

  const [sessions, setSessions] = useState<RaceSession[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string>('session-spa-pro');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('d1-max-v');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [recentEvents, setRecentEvents] = useState<string[]>([
    'Green flag! Race session is underway.',
    'Maxime Verstappen (VER) sets initial benchmark 2:14.820',
    'Reval Saputra (REV) moves into P2 on lap 4 with +0.840s delta',
  ]);

  // Telemetry track position percent (0 to 100%)
  const [telemetryPos, setTelemetryPos] = useState<number>(38);
  const [liveTelemetry, setLiveTelemetry] = useState<TelemetryPoint>({
    distancePct: 38,
    speedKmh: 248,
    throttlePct: 98,
    brakePct: 0,
    gear: 5,
    rpm: 8240,
    steeringAngleDeg: -3.2,
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const creds = getStoredSupabaseCredentials();
    return {
      url: creds.url,
      anonKey: creds.anonKey,
      isConnected: Boolean(creds.url && creds.anonKey),
      isSyncing: false,
      lastSyncAt: undefined,
      error: null,
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    } catch (e) {
      console.warn('Failed saving drivers to storage', e);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CARS, JSON.stringify(cars));
    } catch (e) {
      console.warn('Failed saving cars to storage', e);
    }
  }, [cars]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed saving sessions to storage', e);
    }
  }, [sessions]);

  // Current active session resolved
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Populate driver and car relations in entries
  const resolvedActiveSession = activeSession
    ? {
        ...activeSession,
        track: tracks.find((t) => t.id === activeSession.trackId),
        entries: (activeSession.entries || []).map((entry) => ({
          ...entry,
          driver: drivers.find((d) => d.id === entry.driverId),
          car: cars.find((c) => c.id === entry.carId),
        })),
      }
    : undefined;

  // Real-time race simulation loop
  const simulationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSimulating || !resolvedActiveSession || resolvedActiveSession.status !== 'Live') {
      if (simulationRef.current) cancelAnimationFrame(simulationRef.current);
      return;
    }

    let lastTick = performance.now();

    const tick = (now: number) => {
      const deltaSec = (now - lastTick) / 1000;
      lastTick = now;

      // Update telemetry position around the track
      setTelemetryPos((prev) => {
        const next = (prev + deltaSec * 3.5 * simulationSpeed) % 100;

        // Generate synthetic realistic telemetry curves based on cornering zones
        let speed = 210;
        let throttle = 85;
        let brake = 0;
        let gear = 4;
        let rpm = 7800;
        let steering = 0;

        // Corner 1 zone (0 - 15%)
        if (next >= 4 && next <= 12) {
          brake = 95;
          throttle = 0;
          gear = 2;
          speed = Math.max(78, 260 - (next - 4) * 22);
          rpm = 6400;
          steering = 22;
        } else if (next > 12 && next <= 25) {
          // Eau Rouge / Raidillon uphill blast
          throttle = 100;
          brake = 0;
          gear = 5;
          speed = Math.min(275, 110 + (next - 12) * 12);
          rpm = 8400;
          steering = -8;
        } else if (next > 25 && next <= 45) {
          // Kemmel Straight
          throttle = 100;
          brake = 0;
          gear = 6;
          speed = Math.min(296, 275 + (next - 25) * 1.1);
          rpm = 8750;
          steering = 0.5;
        } else if (next > 45 && next <= 52) {
          // Les Combes heavy braking
          brake = 100;
          throttle = 0;
          gear = 2;
          speed = Math.max(92, 296 - (next - 45) * 29);
          rpm = 6200;
          steering = 28;
        } else if (next > 52 && next <= 75) {
          // Technical middle sector
          throttle = 75 + Math.sin(next * 0.8) * 20;
          brake = Math.cos(next * 0.8) > 0.4 ? 40 : 0;
          gear = 3;
          speed = 145 + Math.sin(next * 0.6) * 35;
          rpm = 7100;
          steering = Math.sin(next * 0.5) * 18;
        } else if (next > 75 && next <= 90) {
          // Blanchimont flat out
          throttle = 100;
          brake = 0;
          gear = 6;
          speed = 282;
          rpm = 8500;
          steering = -4;
        } else {
          // Bus Stop chicane
          brake = 85;
          throttle = 15;
          gear = 2;
          speed = 88;
          rpm = 5900;
          steering = 32;
        }

        setLiveTelemetry({
          distancePct: Number(next.toFixed(1)),
          speedKmh: Math.round(speed),
          throttlePct: Math.round(throttle),
          brakePct: Math.round(brake),
          gear,
          rpm: Math.round(rpm),
          steeringAngleDeg: Number(steering.toFixed(1)),
        });

        return next;
      });

      simulationRef.current = requestAnimationFrame(tick);
    };

    simulationRef.current = requestAnimationFrame(tick);

    return () => {
      if (simulationRef.current) cancelAnimationFrame(simulationRef.current);
    };
  }, [isSimulating, resolvedActiveSession?.status, simulationSpeed]);

  // Periodic race lap increment & subtle gap oscillations
  useEffect(() => {
    if (!isSimulating || !activeSession || activeSession.status !== 'Live') return;

    const interval = setInterval(() => {
      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (sess.id !== activeSessionId || sess.status !== 'Live') return sess;

          const entriesCount = sess.entries.length;
          if (entriesCount === 0) return sess;

          // Occasionally trigger a micro-event (gap change, overtake, or fastest lap)
          const updatedEntries: SessionEntry[] = sess.entries.map((entry) => {
            const deltaJitter = (Math.random() - 0.48) * 80;
            const newGap = entry.currentPosition === 1 ? 0 : Math.max(200, entry.gapToLeaderMs + deltaJitter);
            const wearInc = (Math.random() * 0.15) * simulationSpeed;
            const newWear = Math.min(100, Number((entry.tyreWearPct + wearInc).toFixed(2)));

            // Temperature fluctuation
            const tempJitter = (Math.random() - 0.5) * 1.2;
            const tyreTemps = {
              fl: Math.min(105, Math.max(75, Math.round(entry.tyreTemps.fl + tempJitter))),
              fr: Math.min(108, Math.max(75, Math.round(entry.tyreTemps.fr + tempJitter))),
              rl: Math.min(106, Math.max(75, Math.round(entry.tyreTemps.rl + tempJitter))),
              rr: Math.min(109, Math.max(75, Math.round(entry.tyreTemps.rr + tempJitter))),
            };

            return {
              ...entry,
              gapToLeaderMs: Math.round(newGap),
              tyreWearPct: newWear,
              tyreTemps,
              fuelLiters: Math.max(5, Number((entry.fuelLiters - 0.05 * simulationSpeed).toFixed(2))),
            };
          });

          // Sort by gap if live race
          const sorted = [...updatedEntries].sort((a, b) => a.gapToLeaderMs - b.gapToLeaderMs);
          const finalEntries = sorted.map((item, idx) => {
            const pos = idx + 1;
            const prevPos = item.currentPosition;
            if (pos < prevPos) {
              const driver = drivers.find((d) => d.id === item.driverId);
              if (driver) {
                setRecentEvents((prev) => [
                  `Lap ${sess.currentLap}: ${driver.name} (${driver.code}) overtakes into P${pos}!`,
                  ...prev.slice(0, 5),
                ]);
              }
            }
            return {
              ...item,
              currentPosition: pos,
              intervalMs: idx === 0 ? 0 : item.gapToLeaderMs - sorted[idx - 1].gapToLeaderMs,
            };
          });

          return {
            ...sess,
            entries: finalEntries,
          };
        })
      );
    }, 2800 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, activeSessionId, activeSession?.status, simulationSpeed, drivers]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  const addDriver = useCallback(async (newDriverData: Omit<Driver, 'id'>) => {
    const id = `drv-${Date.now()}`;
    const newDriver: Driver = {
      ...newDriverData,
      id,
      createdAt: new Date().toISOString(),
    };

    setDrivers((prev) => [newDriver, ...prev]);

    // If connected to Supabase, push
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('drivers').insert([
          {
            id: newDriver.id,
            name: newDriver.name,
            code: newDriver.code,
            number: newDriver.number,
            nationality: newDriver.nationality,
            country_code: newDriver.countryCode,
            team: newDriver.team,
            safety_rating: newDriver.safetyRating,
            sim_rating: newDriver.simRating,
            total_races: newDriver.totalRaces,
            wins: newDriver.wins,
            podiums: newDriver.podiums,
            fastest_laps: newDriver.fastestLaps,
            bio: newDriver.bio,
            avatar_url: newDriver.avatarUrl,
          },
        ]);
      } catch (err) {
        console.warn('Supabase driver insert note:', err);
      }
    }

    return newDriver;
  }, []);

  const updateDriver = useCallback(async (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('drivers').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase driver update note:', err);
      }
    }
  }, []);

  const deleteDriver = useCallback(async (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('drivers').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase driver delete note:', err);
      }
    }
  }, []);

  const addCar = useCallback(async (newCarData: Omit<GT3Car, 'id' | 'isCustom'>) => {
    const id = `car-custom-${Date.now()}`;
    const newCar: GT3Car = {
      ...newCarData,
      id,
      isCustom: true,
      class: 'GT3',
      createdAt: new Date().toISOString(),
    };

    setCars((prev) => [newCar, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('cars').insert([
          {
            id: newCar.id,
            model_name: newCar.modelName,
            manufacturer: newCar.manufacturer,
            class: 'GT3',
            engine_spec: newCar.engineSpec,
            horsepower: newCar.horsepower,
            weight_kg: newCar.weightKg,
            top_speed_kmh: newCar.topSpeedKmh,
            aero_downforce: newCar.aeroDownforce,
            drivetrain: newCar.drivetrain,
            livery_primary: newCar.liveryPrimary,
            livery_secondary: newCar.liverySecondary,
            is_custom: true,
            designer: newCar.designer,
            accent_badge: newCar.accentBadge,
          },
        ]);
      } catch (err) {
        console.warn('Supabase car insert note:', err);
      }
    }

    return newCar;
  }, []);

  const addSession = useCallback(
    async (sessionData: {
      title: string;
      sessionType: RaceSession['sessionType'];
      region: RaceSession['region'];
      trackId: string;
      weather: RaceSession['weather'];
      totalLaps: number;
      airTempC: number;
      trackTempC: number;
      assignedDrivers: { driverId: string; carId: string }[];
    }) => {
      const id = `sess-${Date.now()}`;

      // Build grid entries
      const entries: SessionEntry[] = sessionData.assignedDrivers.map((item, index) => {
        const gridPos = index + 1;
        const initialGap = (gridPos - 1) * 850;
        return {
          id: `entry-${id}-${index}`,
          sessionId: id,
          driverId: item.driverId,
          carId: item.carId,
          gridPosition: gridPos,
          currentPosition: gridPos,
          status: 'Running',
          lapsCompleted: 0,
          bestLapTimeMs: 135000 + Math.round(Math.random() * 2000),
          lastLapTimeMs: 135500 + Math.round(Math.random() * 1500),
          gapToLeaderMs: initialGap,
          intervalMs: index === 0 ? 0 : 850,
          currentTyre: 'Soft',
          tyreWearPct: 0,
          tyreTemps: { fl: 85, fr: 85, rl: 85, rr: 85 },
          pitStops: 0,
          fuelLiters: 65,
          currentSector1Ms: 39500,
          currentSector2Ms: 49000,
          currentSector3Ms: 46500,
        };
      });

      const newSession: RaceSession = {
        id,
        title: sessionData.title,
        sessionType: sessionData.sessionType,
        status: 'Scheduled',
        trackId: sessionData.trackId,
        region: sessionData.region,
        weather: sessionData.weather,
        airTempC: sessionData.airTempC,
        trackTempC: sessionData.trackTempC,
        totalLaps: sessionData.totalLaps,
        currentLap: 0,
        scheduledAt: new Date().toISOString(),
        entries,
        createdAt: new Date().toISOString(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(id);

      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('race_sessions').insert([
            {
              id: newSession.id,
              title: newSession.title,
              session_type: newSession.sessionType,
              status: newSession.status,
              track_id: newSession.trackId,
              region: newSession.region,
              weather: newSession.weather,
              air_temp_c: newSession.airTempC,
              track_temp_c: newSession.trackTempC,
              total_laps: newSession.totalLaps,
              current_lap: 0,
              scheduled_at: newSession.scheduledAt,
            },
          ]);

          if (entries.length > 0) {
            await client.from('session_entries').insert(
              entries.map((e) => ({
                id: e.id,
                session_id: e.sessionId,
                driver_id: e.driverId,
                car_id: e.carId,
                grid_position: e.gridPosition,
                current_position: e.currentPosition,
                status: e.status,
                laps_completed: 0,
                best_lap_time_ms: e.bestLapTimeMs,
                last_lap_time_ms: e.lastLapTimeMs,
                gap_to_leader_ms: e.gapToLeaderMs,
                interval_ms: e.intervalMs,
                current_tyre: e.currentTyre,
                tyre_wear_pct: 0,
                pit_stops: 0,
                fuel_liters: e.fuelLiters,
              }))
            );
          }
        } catch (err) {
          console.warn('Supabase session insert note:', err);
        }
      }

      return newSession;
    },
    []
  );

  const updateSessionStatus = useCallback((sessionId: string, status: SessionStatus) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status } : s))
    );

    const client = getSupabaseClient();
    if (client) {
      client.from('race_sessions').update({ status }).eq('id', sessionId);
    }
  }, []);

  const addDriverToSession = useCallback((sessionId: string, driverId: string, carId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        if (s.entries.some((e) => e.driverId === driverId)) return s;

        const nextPos = s.entries.length + 1;
        const newEntry: SessionEntry = {
          id: `entry-${sessionId}-${Date.now()}`,
          sessionId,
          driverId,
          carId,
          gridPosition: nextPos,
          currentPosition: nextPos,
          status: 'Running',
          lapsCompleted: 0,
          bestLapTimeMs: 136000,
          lastLapTimeMs: 136000,
          gapToLeaderMs: (nextPos - 1) * 1100,
          intervalMs: 1100,
          currentTyre: 'Medium',
          tyreWearPct: 0,
          tyreTemps: { fl: 82, fr: 82, rl: 82, rr: 82 },
          pitStops: 0,
          fuelLiters: 65,
        };

        return {
          ...s,
          entries: [...s.entries, newEntry],
        };
      })
    );
  }, []);

  const removeDriverFromSession = useCallback((sessionId: string, driverId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const filtered = s.entries.filter((e) => e.driverId !== driverId);
        return {
          ...s,
          entries: filtered.map((item, idx) => ({
            ...item,
            currentPosition: idx + 1,
            gridPosition: idx + 1,
          })),
        };
      })
    );
  }, []);

  const resetSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'Scheduled',
          currentLap: 0,
          entries: s.entries.map((e, idx) => ({
            ...e,
            currentPosition: e.gridPosition,
            lapsCompleted: 0,
            gapToLeaderMs: (idx) * 900,
            intervalMs: idx === 0 ? 0 : 900,
            tyreWearPct: 0,
            pitStops: 0,
            fuelLiters: 65,
          })),
        };
      })
    );
    setRecentEvents(['Race session has been reset to starting grid positions.']);
  }, []);

  const connectSupabase = useCallback(async (url: string, anonKey: string) => {
    setSupabaseConfig((prev) => ({ ...prev, isSyncing: true, error: null }));
    const result = await testSupabaseConnection(url, anonKey);

    if (result.success) {
      saveStoredSupabaseCredentials(url, anonKey);
      setSupabaseConfig({
        url,
        anonKey,
        isConnected: true,
        isSyncing: false,
        lastSyncAt: new Date().toLocaleTimeString(),
        error: null,
      });
      return { success: true, message: result.message };
    } else {
      setSupabaseConfig((prev) => ({
        ...prev,
        isSyncing: false,
        error: result.message,
      }));
      return { success: false, message: result.message };
    }
  }, []);

  const disconnectSupabase = useCallback(() => {
    clearStoredSupabaseCredentials();
    setSupabaseConfig({
      url: '',
      anonKey: '',
      isConnected: false,
      isSyncing: false,
      lastSyncAt: undefined,
      error: null,
    });
  }, []);

  const syncToSupabase = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not connected.' };
    }

    setSupabaseConfig((prev) => ({ ...prev, isSyncing: true }));

    try {
      // 1. Sync drivers
      const { error: drvErr } = await client.from('drivers').upsert(
        drivers.map((d) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          number: d.number,
          nationality: d.nationality,
          country_code: d.countryCode,
          team: d.team,
          safety_rating: d.safetyRating,
          sim_rating: d.simRating,
          total_races: d.totalRaces,
          wins: d.wins,
          podiums: d.podiums,
          fastest_laps: d.fastestLaps,
          bio: d.bio,
          avatar_url: d.avatarUrl,
        }))
      );
      if (drvErr) throw drvErr;

      // 2. Sync tracks
      const { error: trkErr } = await client.from('tracks').upsert(
        tracks.map((t) => ({
          id: t.id,
          name: t.name,
          location: t.location,
          region: t.region,
          country: t.country,
          length_km: t.lengthKm,
          turns: t.turns,
          lap_record: t.lapRecord,
          record_holder: t.recordHolder,
          elevation_change_meters: t.elevationChangeMeters,
          image_url: t.imageUrl,
        }))
      );
      if (trkErr) throw trkErr;

      // 3. Sync cars
      const { error: carErr } = await client.from('cars').upsert(
        cars.map((c) => ({
          id: c.id,
          model_name: c.modelName,
          manufacturer: c.manufacturer,
          class: 'GT3',
          engine_spec: c.engineSpec,
          horsepower: c.horsepower,
          weight_kg: c.weightKg,
          top_speed_kmh: c.topSpeedKmh,
          aero_downforce: c.aeroDownforce,
          drivetrain: c.drivetrain,
          livery_primary: c.liveryPrimary,
          livery_secondary: c.liverySecondary,
          is_custom: c.isCustom,
          designer: c.designer,
          accent_badge: c.accentBadge,
        }))
      );
      if (carErr) throw carErr;

      setSupabaseConfig((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date().toLocaleTimeString(),
      }));

      return {
        success: true,
        message: `Successfully synchronized ${drivers.length} drivers, ${cars.length} GT3 cars, and ${tracks.length} tracks to Supabase!`,
      };
    } catch (err: any) {
      setSupabaseConfig((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message,
      }));
      return {
        success: false,
        message: `Sync failed: ${err.message || 'Make sure the SQL schema has been executed in your Supabase project.'}`,
      };
    }
  }, [drivers, tracks, cars]);

  const pullFromSupabase = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not connected.' };
    }

    setSupabaseConfig((prev) => ({ ...prev, isSyncing: true }));

    try {
      const { data: dbDrivers, error: drvErr } = await client.from('drivers').select('*');
      if (drvErr) throw drvErr;

      const { data: dbCars, error: carErr } = await client.from('cars').select('*');
      if (carErr) throw carErr;

      const { data: dbTracks, error: trkErr } = await client.from('tracks').select('*');
      if (trkErr) throw trkErr;

      if (dbDrivers && dbDrivers.length > 0) {
        setDrivers(
          dbDrivers.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code,
            number: d.number,
            nationality: d.nationality,
            countryCode: d.country_code,
            team: d.team,
            safetyRating: d.safety_rating,
            simRating: d.sim_rating,
            totalRaces: d.total_races,
            wins: d.wins,
            podiums: d.podiums,
            fastestLaps: d.fastest_laps,
            bio: d.bio,
            avatarUrl: d.avatar_url,
          }))
        );
      }

      if (dbCars && dbCars.length > 0) {
        setCars(
          dbCars.map((c: any) => ({
            id: c.id,
            modelName: c.model_name,
            manufacturer: c.manufacturer,
            class: 'GT3',
            engineSpec: c.engine_spec,
            horsepower: c.horsepower,
            weightKg: c.weight_kg,
            topSpeedKmh: c.top_speed_kmh,
            aeroDownforce: c.aero_downforce,
            drivetrain: c.drivetrain,
            liveryPrimary: c.livery_primary,
            liverySecondary: c.livery_secondary,
            isCustom: c.is_custom,
            designer: c.designer,
            accentBadge: c.accent_badge,
          }))
        );
      }

      if (dbTracks && dbTracks.length > 0) {
        setTracks(
          dbTracks.map((t: any) => ({
            id: t.id,
            name: t.name,
            location: t.location,
            region: t.region,
            country: t.country,
            lengthKm: Number(t.length_km),
            turns: t.turns,
            lapRecord: t.lap_record,
            recordHolder: t.record_holder,
            elevationChangeMeters: t.elevation_change_meters,
            imageUrl: t.image_url,
          }))
        );
      }

      setSupabaseConfig((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date().toLocaleTimeString(),
      }));

      return {
        success: true,
        message: 'Loaded fresh data directly from Supabase tables!',
      };
    } catch (err: any) {
      setSupabaseConfig((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message,
      }));
      return {
        success: false,
        message: `Pull failed: ${err.message}`,
      };
    }
  }, []);

  return (
    <SimRacingContext.Provider
      value={{
        drivers,
        tracks,
        cars,
        sessions,
        activeSessionId,
        activeSession: resolvedActiveSession,
        selectedDriverId,
        isSimulating,
        simulationSpeed,
        liveTelemetry,
        supabaseConfig,
        recentEvents,
        setActiveSessionId,
        setSelectedDriverId,
        toggleSimulation,
        setSimulationSpeed,
        addDriver,
        updateDriver,
        deleteDriver,
        addCar,
        addSession,
        updateSessionStatus,
        addDriverToSession,
        removeDriverFromSession,
        resetSession,
        connectSupabase,
        disconnectSupabase,
        syncToSupabase,
        pullFromSupabase,
      }}
    >
      {children}
    </SimRacingContext.Provider>
  );
};

export const useSimRacing = (): SimRacingContextType => {
  const context = useContext(SimRacingContext);
  if (!context) {
    throw new Error('useSimRacing must be used within a SimRacingProvider');
  }
  return context;
};
