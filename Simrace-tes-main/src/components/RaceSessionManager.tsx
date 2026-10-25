import React, { useState } from 'react';
import {
  Plus,
  Play,
  RotateCcw,
  CheckCircle,
  Flag,
  MapPin,
  Calendar,
  CloudSun,
  Users,
  Car,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useSimRacing } from '../context/SimRacingContext';
import { RaceSession, Region, SessionType, SessionStatus } from '../types';

interface RaceSessionManagerProps {
  onSelectSessionForTelemetry: (sessionId: string) => void;
}

export const RaceSessionManager: React.FC<RaceSessionManagerProps> = ({
  onSelectSessionForTelemetry,
}) => {
  const {
    sessions,
    tracks,
    drivers,
    cars,
    activeSessionId,
    setActiveSessionId,
    addSession,
    updateSessionStatus,
    addDriverToSession,
    removeDriverFromSession,
    resetSession,
  } = useSimRacing();

  const [regionFilter, setRegionFilter] = useState<'All' | Region>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | SessionStatus>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionForRoster, setSelectedSessionForRoster] = useState<RaceSession | null>(null);

  // Form states for creating a new session
  const [newTitle, setNewTitle] = useState('');
  const [newSessionType, setNewSessionType] = useState<SessionType>('Sprint Race');
  const [newRegion, setNewRegion] = useState<Region>('Europe');
  const [newTrackId, setNewTrackId] = useState(tracks[0]?.id || '');
  const [newWeather, setNewWeather] = useState<RaceSession['weather']>('Dry');
  const [newTotalLaps, setNewTotalLaps] = useState(15);
  const [newAirTemp, setNewAirTemp] = useState(24);
  const [newTrackTemp, setNewTrackTemp] = useState(36);
  const [assignedDriverCarPairs, setAssignedDriverCarPairs] = useState<{ driverId: string; carId: string }[]>([
    { driverId: drivers[0]?.id || '', carId: cars[0]?.id || '' },
    { driverId: drivers[1]?.id || '', carId: cars[1]?.id || '' },
    { driverId: drivers[2]?.id || '', carId: cars[2]?.id || '' },
  ]);

  // Form states for adding driver to existing session
  const [addDriverId, setAddDriverId] = useState(drivers[0]?.id || '');
  const [addCarId, setAddCarId] = useState(cars[0]?.id || '');

  // Filtered tracks based on selected region in create modal
  const filteredTracks = tracks.filter((t) => t.region === newRegion);

  // Filtered sessions
  const visibleSessions = sessions.filter((s) => {
    if (regionFilter !== 'All' && s.region !== regionFilter) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    return true;
  });

  const handleRegionChange = (reg: Region) => {
    setNewRegion(reg);
    const trackInRegion = tracks.find((t) => t.region === reg);
    if (trackInRegion) {
      setNewTrackId(trackInRegion.id);
    }
  };

  const handleAddDriverPair = () => {
    // Find unassigned driver
    const assignedIds = new Set(assignedDriverCarPairs.map((p) => p.driverId));
    const availableDriver = drivers.find((d) => !assignedIds.has(d.id));
    if (!availableDriver) return;

    setAssignedDriverCarPairs((prev) => [
      ...prev,
      { driverId: availableDriver.id, carId: cars[0]?.id || '' },
    ]);
  };

  const handleRemoveDriverPair = (index: number) => {
    setAssignedDriverCarPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addSession({
      title: newTitle.trim(),
      sessionType: newSessionType,
      region: newRegion,
      trackId: newTrackId,
      weather: newWeather,
      totalLaps: Number(newTotalLaps),
      airTempC: Number(newAirTemp),
      trackTempC: Number(newTrackTemp),
      assignedDrivers: assignedDriverCarPairs,
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
  };

  const selectedTrackInfo = tracks.find((t) => t.id === newTrackId);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            Race Session Management
          </h1>
          <p className="text-xs md:text-sm text-neutral-400">
            Configure GT3 race events across global regions, assign driver grids, and track live session status.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-red-950/40 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Race Session</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-500 mr-1">Region:</span>
          {(['All', 'Europe', 'Americas', 'Asia-Pacific', 'Middle East'] as const).map((reg) => (
            <button
              key={reg}
              onClick={() => setRegionFilter(reg)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                regionFilter === reg
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500 mr-1">Status:</span>
          {(['All', 'Live', 'Scheduled', 'Finished'] as const).map((stat) => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                statusFilter === stat
                  ? 'bg-red-950/50 text-red-400 border border-red-800/60 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleSessions.map((session) => {
          const track = tracks.find((t) => t.id === session.trackId);
          const isCurrentlyActive = session.id === activeSessionId;

          return (
            <div
              key={session.id}
              className={`flex flex-col justify-between bg-neutral-950 border rounded-xl p-5 transition-all shadow-md ${
                isCurrentlyActive
                  ? 'border-red-600/70 shadow-red-950/20 ring-1 ring-red-500/30'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header Tag strip */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <span className="font-semibold text-neutral-300">{session.region}</span>
                    <span>·</span>
                    <span>{session.sessionType}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      session.status === 'Live'
                        ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                        : session.status === 'Scheduled'
                        ? 'bg-neutral-900 text-amber-400 border border-neutral-700'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {session.title}
                </h3>

                {/* Track Details */}
                <div className="p-3 bg-neutral-900/70 rounded-lg border border-neutral-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{track?.name || 'Unknown Circuit'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>{track?.lengthKm} km · {track?.turns} Turns</span>
                    <span>{session.weather} · {session.trackTempC}°C Track</span>
                  </div>
                </div>

                {/* Grid Roster stats */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{session.entries.length} Drivers Entered</span>
                  </div>
                  <div className="font-mono text-neutral-300">
                    {session.currentLap} / {session.totalLaps} Laps
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-neutral-900 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedSessionForRoster(session)}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-md border border-neutral-800 transition-colors"
                >
                  Manage Grid ({session.entries.length})
                </button>

                <div className="flex items-center gap-2">
                  {session.status !== 'Live' && (
                    <button
                      onClick={() => updateSessionStatus(session.id, 'Live')}
                      className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 rounded-md border border-emerald-800/60"
                      title="Set Status to Live"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectSessionForTelemetry(session.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-md transition-colors"
                  >
                    <span>Launch</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Create New Race Session */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Race Session</h2>
                <p className="text-xs text-neutral-400">
                  Select region, circuit, session parameters, and configure the driver grid.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-500 hover:text-white text-sm font-mono px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
              {/* Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. GT3 Winter Cup - Spa Qualifying"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">
                    Session Type
                  </label>
                  <select
                    value={newSessionType}
                    onChange={(e) => setNewSessionType(e.target.value as SessionType)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Practice">Practice</option>
                    <option value="Qualifying">Qualifying</option>
                    <option value="Sprint Race">Sprint Race</option>
                    <option value="Feature Race">Feature Race</option>
                    <option value="Endurance 2.4h">Endurance 2.4h</option>
                  </select>
                </div>
              </div>

              {/* Region & Track Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => handleRegionChange(e.target.value as Region)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Americas">Americas</option>
                    <option value="Asia-Pacific">Asia-Pacific</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Track</label>
                  <select
                    value={newTrackId}
                    onChange={(e) => setNewTrackId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    {filteredTracks.map((trk) => (
                      <option key={trk.id} value={trk.id}>
                        {trk.name} ({trk.lengthKm}km · {trk.turns}T)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Track Preview Info Strip */}
              {selectedTrackInfo && (
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 text-xs flex flex-wrap justify-between gap-2 text-neutral-400">
                  <span>Record: <strong className="text-white">{selectedTrackInfo.lapRecord}</strong></span>
                  <span>Holder: <strong className="text-white">{selectedTrackInfo.recordHolder}</strong></span>
                  <span>Elevation: <strong className="text-white">{selectedTrackInfo.elevationChangeMeters}m</strong></span>
                </div>
              )}

              {/* Weather, Laps, Temps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-neutral-400">Weather</label>
                  <select
                    value={newWeather}
                    onChange={(e) => setNewWeather(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                  >
                    <option value="Dry">Dry</option>
                    <option value="Overcast">Overcast</option>
                    <option value="Light Rain">Light Rain</option>
                    <option value="Heavy Wet">Heavy Wet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-neutral-400">Laps</label>
                  <input
                    type="number"
                    min={3}
                    max={120}
                    value={newTotalLaps}
                    onChange={(e) => setNewTotalLaps(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-neutral-400">Air (°C)</label>
                  <input
                    type="number"
                    min={5}
                    max={45}
                    value={newAirTemp}
                    onChange={(e) => setNewAirTemp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-neutral-400">Track (°C)</label>
                  <input
                    type="number"
                    min={10}
                    max={65}
                    value={newTrackTemp}
                    onChange={(e) => setNewTrackTemp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Driver Grid Configuration */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-neutral-300">
                    Driver Grid Lineup ({assignedDriverCarPairs.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDriverPair}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    + Add Grid Slot
                  </button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {assignedDriverCarPairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-neutral-900 rounded-md border border-neutral-800 text-xs"
                    >
                      <span className="font-mono text-neutral-500 w-6">P{idx + 1}</span>

                      {/* Driver select */}
                      <select
                        value={pair.driverId}
                        onChange={(e) => {
                          const updated = [...assignedDriverCarPairs];
                          updated[idx].driverId = e.target.value;
                          setAssignedDriverCarPairs(updated);
                        }}
                        className="flex-1 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-200"
                      >
                        {drivers.map((drv) => (
                          <option key={drv.id} value={drv.id}>
                            #{drv.number} {drv.name} ({drv.code})
                          </option>
                        ))}
                      </select>

                      {/* Car select */}
                      <select
                        value={pair.carId}
                        onChange={(e) => {
                          const updated = [...assignedDriverCarPairs];
                          updated[idx].carId = e.target.value;
                          setAssignedDriverCarPairs(updated);
                        }}
                        className="flex-1 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-200"
                      >
                        {cars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.manufacturer} {car.modelName}
                          </option>
                        ))}
                      </select>

                      {assignedDriverCarPairs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDriverPair(idx)}
                          className="text-neutral-500 hover:text-red-400 px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-red-950/40"
                >
                  Save & Launch Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Session Grid & Lineup Manager */}
      {selectedSessionForRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Grid Roster: {selectedSessionForRoster.title}
                </h3>
                <span className="text-xs text-neutral-400">
                  {selectedSessionForRoster.entries.length} Drivers Enrolled
                </span>
              </div>
              <button
                onClick={() => setSelectedSessionForRoster(null)}
                className="text-neutral-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            {/* Current enrolled drivers */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedSessionForRoster.entries.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">No drivers enrolled in this grid yet.</p>
              ) : (
                selectedSessionForRoster.entries.map((entry, idx) => {
                  const drv = drivers.find((d) => d.id === entry.driverId);
                  const car = cars.find((c) => c.id === entry.carId);

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-400 font-bold">P{idx + 1}</span>
                        <div>
                          <span className="font-bold text-white mr-1">{drv?.name}</span>
                          <span className="text-neutral-500 font-mono">[{drv?.code}]</span>
                          <div className="text-[10px] text-neutral-400">
                            {car?.manufacturer} {car?.modelName}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeDriverFromSession(selectedSessionForRoster.id, entry.driverId)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="Remove driver from session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add new driver into session */}
            <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-300 block">Enroll Additional Driver</span>
              <div className="flex gap-2">
                <select
                  value={addDriverId}
                  onChange={(e) => setAddDriverId(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-white"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      #{d.number} {d.name} ({d.code})
                    </option>
                  ))}
                </select>

                <select
                  value={addCarId}
                  onChange={(e) => setAddCarId(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-white"
                >
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.modelName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    addDriverToSession(selectedSessionForRoster.id, addDriverId, addCarId);
                    // Refresh local modal session reference
                    const updated = sessions.find((s) => s.id === selectedSessionForRoster.id);
                    if (updated) setSelectedSessionForRoster(updated);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSessionForRoster(null)}
                className="px-4 py-2 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
