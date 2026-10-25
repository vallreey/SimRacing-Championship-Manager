import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Gauge,
  Thermometer,
  Flag,
  Radio,
  BarChart2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useSimRacing } from '../context/SimRacingContext';
import { SessionEntry, TyreCompound } from '../types';

interface LiveTelemetryDashboardProps {
  onCompareDrivers: (driverAId: string, driverBId: string) => void;
  onNavigateToSessions: () => void;
}

export const LiveTelemetryDashboard: React.FC<LiveTelemetryDashboardProps> = ({
  onCompareDrivers,
  onNavigateToSessions,
}) => {
  const {
    activeSession,
    selectedDriverId,
    setSelectedDriverId,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetSession,
    liveTelemetry,
    recentEvents,
  } = useSimRacing();

  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'trace' | 'tyres' | 'sectors'>('trace');

  if (!activeSession) {
    return (
      <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl my-6">
        <p className="text-neutral-400">No race sessions found.</p>
        <button
          onClick={onNavigateToSessions}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-colors"
        >
          Create First Race Session
        </button>
      </div>
    );
  }

  const selectedEntry =
    activeSession.entries.find((e) => e.driverId === selectedDriverId) ||
    activeSession.entries[0];

  const formatLapTime = (ms: number) => {
    if (!ms || ms <= 0) return '--:--.---';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const formatDelta = (ms: number, isLeader: boolean) => {
    if (isLeader) return 'LEADER';
    if (!ms || ms === 0) return '+0.000';
    return `+${(ms / 1000).toFixed(3)}s`;
  };

  const getTyreColor = (compound: TyreCompound) => {
    switch (compound) {
      case 'Soft':
        return 'text-red-400 border-red-500/40 bg-red-950/20';
      case 'Medium':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
      case 'Hard':
        return 'text-neutral-200 border-neutral-400/40 bg-neutral-800/40';
      case 'Wet':
        return 'text-blue-400 border-blue-500/40 bg-blue-950/20';
    }
  };

  const getTempColor = (celsius: number) => {
    if (celsius < 80) return 'text-sky-400 bg-sky-950/40 border-sky-800'; // Cold
    if (celsius <= 96) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800'; // Optimal
    return 'text-red-400 bg-red-950/40 border-red-800'; // Overheated
  };

  // RPM Shift light computation (max 9000 RPM)
  const rpmPercent = Math.min(100, Math.max(0, ((liveTelemetry.rpm - 5000) / 4000) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Strip with Visual Asset */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/sim_racing_hero_1792381216856.jpg"
            alt="Sim Racing GT3 Action"
            className="w-full h-full object-cover object-center opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{activeSession.sessionType}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300">{activeSession.region}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300">{activeSession.track?.name || 'Grand Prix Circuit'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {activeSession.title}
            </h1>
            <p className="text-xs md:text-sm text-neutral-400">
              Live telemetry stream & sector tracking powered by real-time simulation with Supabase sync.
            </p>
          </div>

          {/* Quick Track & Weather Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-900/90 backdrop-blur-md p-3 rounded-lg border border-neutral-800 shrink-0">
            <div>
              <span className="text-neutral-500 block">Current Lap</span>
              <span className="text-base font-bold text-white font-mono tabular-nums">
                {activeSession.currentLap} / {activeSession.totalLaps}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Weather</span>
              <span className="text-base font-bold text-white">{activeSession.weather}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Air / Track</span>
              <span className="text-base font-bold text-white font-mono tabular-nums">
                {activeSession.airTempC}°C / {activeSession.trackTempC}°C
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Grid Size</span>
              <span className="text-base font-bold text-white font-mono tabular-nums">
                {activeSession.entries.length} GT3s
              </span>
            </div>
          </div>
        </div>

        {/* Live Race Director Simulation Bar */}
        <div className="relative z-10 bg-neutral-900/90 border-t border-neutral-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isSimulating
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Race</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Race</span>
                </>
              )}
            </button>

            <button
              onClick={() => resetSession(activeSession.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800/80 rounded-md hover:bg-neutral-800 transition-colors"
              title="Reset race to grid positions"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Grid</span>
            </button>

            <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-md border border-neutral-800">
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimulationSpeed(speed)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                    simulationSpeed === speed
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Quick Head-to-Head Compare Trigger */}
          {activeSession.entries.length >= 2 && (
            <button
              onClick={() =>
                onCompareDrivers(
                  activeSession.entries[0]?.driverId || '',
                  activeSession.entries[1]?.driverId || ''
                )
              }
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 px-3 py-1.5 rounded-md hover:bg-neutral-700 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5 text-red-400" />
              <span>Compare P1 vs P2</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Timing Tower (Left) & Real-time Cockpit / Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Timing Tower (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Timing Tower
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Click driver row for telemetry
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/60 text-neutral-400 uppercase font-mono text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-3">Pos</th>
                  <th className="py-2.5 px-2">No.</th>
                  <th className="py-2.5 px-3">Driver & Team</th>
                  <th className="py-2.5 px-2">Car</th>
                  <th className="py-2.5 px-2">Tyre</th>
                  <th className="py-2.5 px-3 text-right">Gap to P1</th>
                  <th className="py-2.5 px-3 text-right">Interval</th>
                  <th className="py-2.5 px-3 text-right">Best Lap</th>
                  <th className="py-2.5 px-2 text-center">Pit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {activeSession.entries.map((entry) => {
                  const isSelected = entry.driverId === selectedDriverId;
                  const isLeader = entry.currentPosition === 1;
                  const isFastest = entry.driverId === activeSession.fastestLapDriverId;

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedDriverId(entry.driverId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-950/30 border-l-2 border-red-500'
                          : 'hover:bg-neutral-900/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs ${
                            entry.currentPosition === 1
                              ? 'bg-amber-500 text-neutral-950 font-black'
                              : entry.currentPosition === 2
                              ? 'bg-neutral-300 text-neutral-950 font-bold'
                              : entry.currentPosition === 3
                              ? 'bg-amber-700 text-white font-bold'
                              : 'text-neutral-400'
                          }`}
                        >
                          {entry.currentPosition}
                        </span>
                      </td>

                      <td className="py-2.5 px-2 font-mono text-neutral-400">
                        #{entry.driver?.number ?? '--'}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-wide">
                            {entry.driver?.code || 'DRV'}
                          </span>
                          <span className="text-neutral-400 truncate max-w-[120px]">
                            {entry.driver?.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[160px]">
                          {entry.driver?.team}
                        </div>
                      </td>

                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: entry.car?.liveryPrimary || '#ff2a5f' }}
                          />
                          <span className="text-neutral-300 truncate max-w-[90px]">
                            {entry.car?.modelName || 'GT3'}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getTyreColor(
                            entry.currentTyre
                          )}`}
                        >
                          {entry.currentTyre[0]}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-300">
                        {formatDelta(entry.gapToLeaderMs, isLeader)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-400">
                        {isLeader ? '--' : `+${(entry.intervalMs / 1000).toFixed(3)}s`}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span className={isFastest ? 'text-purple-400 font-bold' : 'text-neutral-300'}>
                          {formatLapTime(entry.bestLapTimeMs)}
                        </span>
                      </td>

                      <td className="py-2.5 px-2 text-center font-mono text-neutral-400">
                        {entry.pitStops}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Timing legend */}
          <div className="p-3 bg-neutral-900/40 border-t border-neutral-900 flex flex-wrap items-center justify-between text-[11px] text-neutral-500 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-purple-500" />
                <span>Fastest Lap</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500" />
                <span>Personal Best</span>
              </span>
            </div>
            <span>Timing updates live at 60Hz</span>
          </div>
        </div>

        {/* Right Column: MoTeC-Style Telemetry & Cockpit Instrumentation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Driver Telemetry Header Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-base shadow"
                  style={{ backgroundColor: selectedEntry?.car?.liveryPrimary || '#ff2a5f' }}
                >
                  {selectedEntry?.driver?.number || '0'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {selectedEntry?.driver?.name}
                    </span>
                    <span className="font-mono text-xs text-red-400 font-bold">
                      [{selectedEntry?.driver?.code}]
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {selectedEntry?.car?.modelName} · P{selectedEntry?.currentPosition}
                  </span>
                </div>
              </div>

              {/* Segmented view switcher */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setActiveTelemetryTab('trace')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTelemetryTab === 'trace'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Trace
                </button>
                <button
                  onClick={() => setActiveTelemetryTab('tyres')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTelemetryTab === 'tyres'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Tyres
                </button>
                <button
                  onClick={() => setActiveTelemetryTab('sectors')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTelemetryTab === 'sectors'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Sectors
                </button>
              </div>
            </div>

            {/* Shift Lights & RPM Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-neutral-500">
                <span>Shift Indicator</span>
                <span className="text-neutral-300 font-bold tabular-nums">
                  {liveTelemetry.rpm} RPM
                </span>
              </div>
              <div className="h-3 bg-neutral-900 rounded-sm overflow-hidden flex gap-0.5 p-0.5 border border-neutral-800">
                {Array.from({ length: 16 }).map((_, i) => {
                  const threshold = (i / 16) * 100;
                  const isActive = rpmPercent >= threshold;
                  let colorClass = 'bg-neutral-800';

                  if (isActive) {
                    if (i < 8) colorClass = 'bg-emerald-500';
                    else if (i < 13) colorClass = 'bg-amber-400';
                    else colorClass = 'bg-red-500 animate-pulse';
                  }

                  return <div key={i} className={`flex-1 h-full rounded-[1px] ${colorClass}`} />;
                })}
              </div>
            </div>

            {/* Core Telemetry Gauges (Speed, Gear, Pedals) */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-900/60 rounded-lg border border-neutral-800/80">
              {/* Speed */}
              <div className="flex flex-col items-center justify-center border-r border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">Speed</span>
                <span className="text-3xl font-black font-mono tabular-nums text-white">
                  {liveTelemetry.speedKmh}
                </span>
                <span className="text-[10px] text-neutral-400">km/h</span>
              </div>

              {/* Gear */}
              <div className="flex flex-col items-center justify-center border-r border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">Gear</span>
                <span className="text-3xl font-black font-mono text-amber-400">
                  {liveTelemetry.gear}
                </span>
                <span className="text-[10px] text-neutral-400">Seq GT3</span>
              </div>

              {/* Pedals (Throttle & Brake) */}
              <div className="flex flex-col justify-center space-y-1 px-1">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-0.5">
                    <span className="text-emerald-400">THR</span>
                    <span className="tabular-nums">{liveTelemetry.throttlePct}%</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${liveTelemetry.throttlePct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-0.5">
                    <span className="text-red-400">BRK</span>
                    <span className="tabular-nums">{liveTelemetry.brakePct}%</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-75"
                      style={{ width: `${liveTelemetry.brakePct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab 1: Live Speed & Pedal Trace (SVG Canvas) */}
            {activeTelemetryTab === 'trace' && (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Track Distance: {liveTelemetry.distancePct}%</span>
                  <span className="font-mono text-neutral-500">MoTeC Telemetry View</span>
                </div>

                <div className="relative h-32 bg-neutral-900 rounded-lg p-2 border border-neutral-800 overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-15 pointer-events-none">
                    <div className="border-b border-neutral-500 w-full" />
                    <div className="border-b border-neutral-500 w-full" />
                    <div className="border-b border-neutral-500 w-full" />
                  </div>

                  {/* SVG Telemetry Curves */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Speed curve (Cyan) */}
                    <path
                      d="M 0,70 Q 15,20 25,15 T 45,10 T 55,75 T 70,30 T 85,15 T 100,60"
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="2"
                    />

                    {/* Throttle trace (Green) */}
                    <path
                      d="M 0,20 Q 15,90 25,5 T 45,5 T 55,95 T 70,10 T 85,5 T 100,85"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                      opacity="0.8"
                    />

                    {/* Brake trace (Red) */}
                    <path
                      d="M 0,98 Q 15,10 25,98 T 45,98 T 55,10 T 70,98 T 85,98 T 100,10"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />

                    {/* Current track cursor line */}
                    <line
                      x1={liveTelemetry.distancePct}
                      y1="0"
                      x2={liveTelemetry.distancePct}
                      y2="100"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Speed
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Throttle
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-0.5 bg-red-400 inline-block" /> Brake
                  </span>
                  <span className="text-neutral-400">Track 0% → 100%</span>
                </div>
              </div>
            )}

            {/* Tab 2: 4-Wheel Tyre Heatmap */}
            {activeTelemetryTab === 'tyres' && (
              <div className="space-y-3">
                <div className="text-xs text-neutral-400 flex justify-between">
                  <span>Pirelli DHF GT3 Slick Compound</span>
                  <span className="font-mono text-neutral-300">
                    Wear: {selectedEntry?.tyreWearPct.toFixed(1)}%
                  </span>
                </div>

                {/* Chassis Car silhouette with 4 tyres */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  {/* Front Left */}
                  <div
                    className={`p-2 rounded border text-center ${getTempColor(
                      selectedEntry?.tyreTemps.fl ?? 85
                    )}`}
                  >
                    <div className="text-[10px] font-mono font-bold text-neutral-400">FRONT LEFT</div>
                    <div className="text-lg font-black font-mono tabular-nums">
                      {selectedEntry?.tyreTemps.fl}°C
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">27.4 PSI</div>
                  </div>

                  {/* Front Right */}
                  <div
                    className={`p-2 rounded border text-center ${getTempColor(
                      selectedEntry?.tyreTemps.fr ?? 90
                    )}`}
                  >
                    <div className="text-[10px] font-mono font-bold text-neutral-400">FRONT RIGHT</div>
                    <div className="text-lg font-black font-mono tabular-nums">
                      {selectedEntry?.tyreTemps.fr}°C
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">27.6 PSI</div>
                  </div>

                  {/* Rear Left */}
                  <div
                    className={`p-2 rounded border text-center ${getTempColor(
                      selectedEntry?.tyreTemps.rl ?? 88
                    )}`}
                  >
                    <div className="text-[10px] font-mono font-bold text-neutral-400">REAR LEFT</div>
                    <div className="text-lg font-black font-mono tabular-nums">
                      {selectedEntry?.tyreTemps.rl}°C
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">26.8 PSI</div>
                  </div>

                  {/* Rear Right */}
                  <div
                    className={`p-2 rounded border text-center ${getTempColor(
                      selectedEntry?.tyreTemps.rr ?? 93
                    )}`}
                  >
                    <div className="text-[10px] font-mono font-bold text-neutral-400">REAR RIGHT</div>
                    <div className="text-lg font-black font-mono tabular-nums">
                      {selectedEntry?.tyreTemps.rr}°C
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">27.1 PSI</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                  <span>Optimal: 80°C - 96°C</span>
                  <span>Fuel: {selectedEntry?.fuelLiters} L remaining</span>
                </div>
              </div>
            )}

            {/* Tab 3: Sector Splits */}
            {activeTelemetryTab === 'sectors' && (
              <div className="space-y-3">
                <div className="text-xs text-neutral-400">
                  Last Lap Sector Splits ({activeSession.track?.name})
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
                    <span className="text-[10px] font-mono text-neutral-400 block">SECTOR 1</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {selectedEntry?.currentSector1Ms
                        ? `${(selectedEntry.currentSector1Ms / 1000).toFixed(3)}s`
                        : '39.420s'}
                    </span>
                    <span className="text-[9px] text-neutral-500 block">Personal Best</span>
                  </div>

                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
                    <span className="text-[10px] font-mono text-neutral-400 block">SECTOR 2</span>
                    <span className="text-sm font-bold font-mono text-purple-400 tabular-nums">
                      {selectedEntry?.currentSector2Ms
                        ? `${(selectedEntry.currentSector2Ms / 1000).toFixed(3)}s`
                        : '48.910s'}
                    </span>
                    <span className="text-[9px] text-purple-400/80 block">Session Record</span>
                  </div>

                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
                    <span className="text-[10px] font-mono text-neutral-400 block">SECTOR 3</span>
                    <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                      {selectedEntry?.currentSector3Ms
                        ? `${(selectedEntry.currentSector3Ms / 1000).toFixed(3)}s`
                        : '46.490s'}
                    </span>
                    <span className="text-[9px] text-neutral-500 block">+0.120s delta</span>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-900/50 rounded-lg border border-neutral-800/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Theoretical Best:</span>
                  <span className="font-bold text-white">2:14.820</span>
                </div>
              </div>
            )}
          </div>

          {/* Race Director Radio / Event Ticker */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-2">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Race Control Audio & Incident Log</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {recentEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2 rounded bg-neutral-900/80 border border-neutral-800/80 text-neutral-300 flex items-start gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{evt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
