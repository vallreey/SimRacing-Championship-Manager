export type Region = 'Europe' | 'Americas' | 'Asia-Pacific' | 'Middle East';

export type SessionType = 'Practice' | 'Qualifying' | 'Sprint Race' | 'Feature Race' | 'Endurance 2.4h';

export type SessionStatus = 'Scheduled' | 'Live' | 'Finished' | 'Suspended';

export type TyreCompound = 'Soft' | 'Medium' | 'Hard' | 'Wet';

export interface Driver {
  id: string;
  name: string;
  code: string; // e.g. VER, HAM, NOR
  number: number;
  nationality: string;
  countryCode: string; // ISO 2-letter
  team: string;
  safetyRating: 'S' | 'A' | 'B' | 'C';
  simRating: number; // e.g. 1500 - 4500
  totalRaces: number;
  wins: number;
  podiums: number;
  fastestLaps: number;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Track {
  id: string;
  name: string;
  location: string;
  region: Region;
  country: string;
  lengthKm: number;
  turns: number;
  lapRecord: string;
  recordHolder: string;
  elevationChangeMeters: number;
  imageUrl?: string;
}

export interface GT3Car {
  id: string;
  modelName: string;
  manufacturer: string;
  class: 'GT3';
  engineSpec: string;
  horsepower: number;
  weightKg: number;
  topSpeedKmh: number;
  aeroDownforce: 'Low' | 'Medium' | 'High' | 'Very High';
  drivetrain: 'RWD' | 'AWD';
  liveryPrimary: string; // Hex color
  liverySecondary: string; // Hex color
  isCustom: boolean;
  designer?: string;
  accentBadge?: string;
  createdAt?: string;
}

export interface SessionEntry {
  id: string;
  sessionId: string;
  driverId: string;
  carId: string;
  driver?: Driver;
  car?: GT3Car;
  gridPosition: number;
  currentPosition: number;
  status: 'Running' | 'In Pit' | 'Out' | 'DNF';
  lapsCompleted: number;
  bestLapTimeMs: number;
  lastLapTimeMs: number;
  gapToLeaderMs: number;
  intervalMs: number;
  currentTyre: TyreCompound;
  tyreWearPct: number; // 0 - 100%
  tyreTemps: {
    fl: number; // Celsius
    fr: number;
    rl: number;
    rr: number;
  };
  pitStops: number;
  fuelLiters: number;
  currentSector1Ms?: number;
  currentSector2Ms?: number;
  currentSector3Ms?: number;
}

export interface RaceSession {
  id: string;
  title: string;
  sessionType: SessionType;
  status: SessionStatus;
  trackId: string;
  track?: Track;
  region: Region;
  weather: 'Dry' | 'Overcast' | 'Light Rain' | 'Heavy Wet';
  airTempC: number;
  trackTempC: number;
  totalLaps: number;
  currentLap: number;
  scheduledAt: string;
  entries: SessionEntry[];
  fastestLapDriverId?: string;
  fastestLapTimeMs?: number;
  createdAt?: string;
}

export interface TelemetryPoint {
  distancePct: number; // 0 to 100% of lap
  speedKmh: number;
  throttlePct: number;
  brakePct: number;
  gear: number;
  rpm: number;
  steeringAngleDeg: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  error?: string | null;
}
