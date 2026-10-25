import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Trophy,
  Award,
  Zap,
  Shield,
  Trash2,
  Edit2,
  BarChart2,
  Flame,
} from 'lucide-react';
import { useSimRacing } from '../context/SimRacingContext';
import { Driver } from '../types';

interface DriverManagerProps {
  onCompareDrivers: (driverAId: string, driverBId: string) => void;
}

export const DriverManager: React.FC<DriverManagerProps> = ({ onCompareDrivers }) => {
  const { drivers, addDriver, deleteDriver } = useSimRacing();

  const [searchQuery, setSearchQuery] = useState('');
  const [safetyFilter, setSafetyFilter] = useState<'All' | 'S' | 'A' | 'B' | 'C'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDriverDetails, setSelectedDriverDetails] = useState<Driver | null>(null);

  // New Driver Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [number, setNumber] = useState(1);
  const [nationality, setNationality] = useState('Indonesian');
  const [countryCode, setCountryCode] = useState('ID');
  const [team, setTeam] = useState('Garuda Sim Racing');
  const [safetyRating, setSafetyRating] = useState<'S' | 'A' | 'B' | 'C'>('S');
  const [simRating, setSimRating] = useState(3800);
  const [bio, setBio] = useState('');

  // Filtered drivers
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.nationality.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSafety = safetyFilter === 'All' || driver.safetyRating === safetyFilter;
    return matchesSearch && matchesSafety;
  });

  const handleAddDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    await addDriver({
      name: name.trim(),
      code: code.trim().toUpperCase().slice(0, 4),
      number: Number(number),
      nationality: nationality.trim(),
      countryCode: countryCode.trim().toUpperCase().slice(0, 3),
      team: team.trim(),
      safetyRating,
      simRating: Number(simRating),
      totalRaces: 0,
      wins: 0,
      podiums: 0,
      fastestLaps: 0,
      bio: bio.trim(),
    });

    setIsAddModalOpen(false);
    setName('');
    setCode('');
    setBio('');
  };

  const getSafetyBadge = (sr: Driver['safetyRating']) => {
    switch (sr) {
      case 'S':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/80';
      case 'A':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80';
      case 'B':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/80';
      case 'C':
        return 'text-neutral-400 bg-neutral-900 border-neutral-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            Sim Racing Driver Roster
          </h1>
          <p className="text-xs md:text-sm text-neutral-400">
            Monitor driver ratings, career victories, safety indexes, and head-to-head consistency metrics.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-red-950/40 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Driver</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, driver code, team, or nationality..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-xs text-neutral-500 mr-1">Safety Rating:</span>
          {(['All', 'S', 'A', 'B', 'C'] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setSafetyFilter(grade)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors ${
                safetyFilter === grade
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDrivers.map((driver) => {
          const winRate =
            driver.totalRaces > 0 ? ((driver.wins / driver.totalRaces) * 100).toFixed(1) : '0.0';
          const podiumRate =
            driver.totalRaces > 0 ? ((driver.podiums / driver.totalRaces) * 100).toFixed(1) : '0.0';

          return (
            <div
              key={driver.id}
              className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 transition-all flex flex-col justify-between shadow-md space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Number & Safety Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded bg-red-600/20 text-red-400 border border-red-800/40 flex items-center justify-center font-mono font-black text-xs">
                      #{driver.number}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-400">
                      [{driver.code}]
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSafetyBadge(
                      driver.safetyRating
                    )}`}
                  >
                    SR: {driver.safetyRating}
                  </span>
                </div>

                {/* Name & Team */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {driver.name}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate">{driver.team}</p>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    {driver.nationality} ({driver.countryCode})
                  </p>
                </div>

                {/* SimRating Bar */}
                <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800/80 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-mono text-[10px] uppercase">SimRating</span>
                    <span className="font-mono font-black text-white tabular-nums text-sm">
                      {driver.simRating} iR
                    </span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (driver.simRating / 4500) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Career Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 bg-neutral-900/60 rounded border border-neutral-900">
                    <span className="text-[10px] text-neutral-500 block">Races</span>
                    <span className="font-bold text-neutral-300 tabular-nums">
                      {driver.totalRaces}
                    </span>
                  </div>

                  <div className="p-2 bg-neutral-900/60 rounded border border-neutral-900">
                    <span className="text-[10px] text-amber-500/80 block">Wins</span>
                    <span className="font-bold text-amber-400 tabular-nums">{driver.wins}</span>
                  </div>

                  <div className="p-2 bg-neutral-900/60 rounded border border-neutral-900">
                    <span className="text-[10px] text-neutral-400 block">Podiums</span>
                    <span className="font-bold text-white tabular-nums">{driver.podiums}</span>
                  </div>
                </div>

                {/* Win / Podium Rate strip */}
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                  <span>Win Rate: {winRate}%</span>
                  <span>Podium: {podiumRate}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-900 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDriverDetails(driver)}
                  className="text-xs text-neutral-400 hover:text-white font-semibold"
                >
                  View Dossier
                </button>

                <div className="flex items-center gap-1.5">
                  {drivers.length >= 2 && (
                    <button
                      onClick={() => {
                        const otherDriver = drivers.find((d) => d.id !== driver.id);
                        if (otherDriver) onCompareDrivers(driver.id, otherDriver.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 rounded border border-neutral-800 transition-colors"
                      title="Compare Head-to-Head"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteDriver(driver.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-900 rounded border border-neutral-800 transition-colors"
                    title="Remove driver"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Register New Driver */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Register New GT3 Driver</h3>
                <p className="text-xs text-neutral-400">
                  Add driver details, sim racing license grade, and starting rating.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDriverSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lewis Hamilton"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Code (3-char)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="HAM"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono uppercase focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Number</label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    required
                    value={number}
                    onChange={(e) => setNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Nationality</label>
                  <input
                    type="text"
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. British"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Country Code</label>
                  <input
                    type="text"
                    maxLength={3}
                    required
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                    placeholder="GB"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono uppercase focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-neutral-400">Sim Team</label>
                <input
                  type="text"
                  required
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="e.g. Apex Esports Engineering"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Safety Rating</label>
                  <select
                    value={safetyRating}
                    onChange={(e) => setSafetyRating(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                  >
                    <option value="S">S Class (Pro Elite)</option>
                    <option value="A">A Class (Advanced)</option>
                    <option value="B">B Class (Intermediate)</option>
                    <option value="C">C Class (Rookie)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">SimRating (iR)</label>
                  <input
                    type="number"
                    min={1000}
                    max={6000}
                    step={50}
                    value={simRating}
                    onChange={(e) => setSimRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-neutral-400">Driver Bio & Style</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Driving style notes, preferred setup characteristics..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-red-950/40"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Driver Detailed Dossier */}
      {selectedDriverDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-mono font-black text-base">
                  #{selectedDriverDetails.number}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDriverDetails.name}</h3>
                  <span className="text-xs text-neutral-400">
                    {selectedDriverDetails.team} · [{selectedDriverDetails.code}]
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriverDetails(null)}
                className="text-neutral-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block mb-1">Driver Bio & Telemetry Profile</span>
                <p className="text-neutral-300 italic">
                  "{selectedDriverDetails.bio || 'Consistent sim racer with strong qualifying pace.'}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Nationality</span>
                  <span className="text-sm font-bold text-white">
                    {selectedDriverDetails.nationality} ({selectedDriverDetails.countryCode})
                  </span>
                </div>
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Safety Grade</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    Class {selectedDriverDetails.safetyRating}
                  </span>
                </div>
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">SimRating</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {selectedDriverDetails.simRating} iR
                  </span>
                </div>
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Fastest Laps Awarded</span>
                  <span className="text-sm font-bold text-purple-400 font-mono">
                    {selectedDriverDetails.fastestLaps} Laps
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDriverDetails(null)}
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
