import React, { useState } from 'react';
import { useSimRacing } from '../context/SimRacingContext';
import { BarChart2, Zap, Trophy, Shield, Flame, Activity } from 'lucide-react';

interface DriverCompareModalProps {
  driverAId: string;
  driverBId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverCompareModal: React.FC<DriverCompareModalProps> = ({
  driverAId: initialA,
  driverBId: initialB,
  isOpen,
  onClose,
}) => {
  const { drivers } = useSimRacing();

  const [driverAId, setDriverAId] = useState(initialA || drivers[0]?.id || '');
  const [driverBId, setDriverBId] = useState(
    initialB || (drivers[1]?.id ? drivers[1].id : drivers[0]?.id || '')
  );

  if (!isOpen) return null;

  const driverA = drivers.find((d) => d.id === driverAId) || drivers[0];
  const driverB = drivers.find((d) => d.id === driverBId) || drivers[1] || drivers[0];

  const winRateA =
    driverA.totalRaces > 0 ? ((driverA.wins / driverA.totalRaces) * 100).toFixed(1) : '0.0';
  const winRateB =
    driverB.totalRaces > 0 ? ((driverB.wins / driverB.totalRaces) * 100).toFixed(1) : '0.0';

  const podiumRateA =
    driverA.totalRaces > 0 ? ((driverA.podiums / driverA.totalRaces) * 100).toFixed(1) : '0.0';
  const podiumRateB =
    driverB.totalRaces > 0 ? ((driverB.podiums / driverB.totalRaces) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-6 my-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Head-to-Head Driver Telemetry Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white font-mono text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Driver Selectors Strip */}
        <div className="grid grid-cols-2 gap-4">
          {/* Driver A Selector */}
          <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
            <label className="text-[11px] font-mono uppercase text-red-400 font-bold block">
              Driver A (Telemetry Red)
            </label>
            <select
              value={driverAId}
              onChange={(e) => setDriverAId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-bold text-white"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.number} {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Driver B Selector */}
          <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
            <label className="text-[11px] font-mono uppercase text-cyan-400 font-bold block">
              Driver B (Telemetry Cyan)
            </label>
            <select
              value={driverBId}
              onChange={(e) => setDriverBId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-bold text-white"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.number} {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Head-to-Head Comparison Metrics */}
        <div className="space-y-3">
          {/* SimRating */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-1 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="font-bold text-red-400 text-sm">{driverA.simRating} iR</span>
              <span className="text-neutral-400 uppercase text-[11px] font-semibold">SimRating</span>
              <span className="font-bold text-cyan-400 text-sm">{driverB.simRating} iR</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full flex overflow-hidden">
              <div
                className="bg-red-500 h-full"
                style={{
                  width: `${(driverA.simRating / (driverA.simRating + driverB.simRating)) * 100}%`,
                }}
              />
              <div
                className="bg-cyan-500 h-full"
                style={{
                  width: `${(driverB.simRating / (driverA.simRating + driverB.simRating)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Career Wins */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-1 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="font-bold text-red-400 text-sm">{driverA.wins} Wins</span>
              <span className="text-neutral-400 uppercase text-[11px] font-semibold">Career Victories</span>
              <span className="font-bold text-cyan-400 text-sm">{driverB.wins} Wins</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full flex overflow-hidden">
              <div
                className="bg-red-500 h-full"
                style={{
                  width: `${
                    driverA.wins + driverB.wins > 0
                      ? (driverA.wins / (driverA.wins + driverB.wins)) * 100
                      : 50
                  }%`,
                }}
              />
              <div
                className="bg-cyan-500 h-full"
                style={{
                  width: `${
                    driverA.wins + driverB.wins > 0
                      ? (driverB.wins / (driverA.wins + driverB.wins)) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Win Rate % */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-1 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="font-bold text-red-400 text-sm">{winRateA}%</span>
              <span className="text-neutral-400 uppercase text-[11px] font-semibold">Win Conversion Rate</span>
              <span className="font-bold text-cyan-400 text-sm">{winRateB}%</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full flex overflow-hidden">
              <div
                className="bg-red-500 h-full"
                style={{
                  width: `${
                    parseFloat(winRateA) + parseFloat(winRateB) > 0
                      ? (parseFloat(winRateA) / (parseFloat(winRateA) + parseFloat(winRateB))) * 100
                      : 50
                  }%`,
                }}
              />
              <div
                className="bg-cyan-500 h-full"
                style={{
                  width: `${
                    parseFloat(winRateA) + parseFloat(winRateB) > 0
                      ? (parseFloat(winRateB) / (parseFloat(winRateA) + parseFloat(winRateB))) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Podiums */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-1 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="font-bold text-red-400 text-sm">{driverA.podiums} Podiums</span>
              <span className="text-neutral-400 uppercase text-[11px] font-semibold">Podium Finishes</span>
              <span className="font-bold text-cyan-400 text-sm">{driverB.podiums} Podiums</span>
            </div>
          </div>
        </div>

        {/* Telemetry Speed Overlay Curve */}
        <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Speed & Delta Overlay Simulation</span>
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-red-400 flex items-center gap-1">
                <span className="w-2.5 h-1 bg-red-500 inline-block" /> {driverA.code}
              </span>
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2.5 h-1 bg-cyan-400 inline-block" /> {driverB.code}
              </span>
            </div>
          </div>

          <div className="h-28 bg-neutral-950 rounded-lg p-2 border border-neutral-800 overflow-hidden relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Driver A curve (Red) */}
              <path
                d="M 0,65 Q 20,25 35,15 T 50,70 T 68,20 T 85,15 T 100,55"
                fill="none"
                stroke="#ff2a5f"
                strokeWidth="2.5"
              />
              {/* Driver B curve (Cyan) */}
              <path
                d="M 0,68 Q 20,30 35,18 T 50,68 T 68,23 T 85,14 T 100,58"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2"
                strokeDasharray="3,2"
              />
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
            <span>Turn 1 (La Source)</span>
            <span>Kemmel Straight (290 km/h)</span>
            <span>Chicane</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
