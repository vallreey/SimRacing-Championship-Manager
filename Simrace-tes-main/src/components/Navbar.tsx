import React from 'react';
import { Database, Gauge, Flag, Users, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSimRacing } from '../context/SimRacingContext';

export type NavTab = 'telemetry' | 'sessions' | 'drivers' | 'garage' | 'supabase';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openSupabaseModal }) => {
  const { supabaseConfig } = useSimRacing();

  return (
    <header className="sticky top-0 z-40 bg-[#090c10]/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => setActiveTab('telemetry')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/40 text-white font-black text-sm tracking-tighter">
            APX
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-red-400 transition-colors">
              ApexSim Telemetry
            </span>
          </div>
        </div>

        {/* Zone 2: 5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-neutral-400">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'telemetry'
                ? 'text-red-400 border-b-2 border-red-500 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Live Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'sessions'
                ? 'text-red-400 border-b-2 border-red-500 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Race Sessions</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'drivers'
                ? 'text-red-400 border-b-2 border-red-500 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Driver Roster</span>
          </button>

          <button
            onClick={() => setActiveTab('garage')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'garage'
                ? 'text-red-400 border-b-2 border-red-500 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>GT3 Garage</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'supabase'
                ? 'text-red-400 border-b-2 border-red-500 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase & SQL</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openSupabaseModal}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap shrink-0 ${
              supabaseConfig.isConnected
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white'
            }`}
            title="Configure Supabase connection & inspect schema"
          >
            {supabaseConfig.isConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Live</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-neutral-400" />
                <span>Connect Supabase</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-neutral-800/80 gap-3 text-xs uppercase tracking-wider font-semibold text-neutral-400">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`whitespace-nowrap ${activeTab === 'telemetry' ? 'text-red-400 font-bold' : ''}`}
        >
          Live Telemetry
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`whitespace-nowrap ${activeTab === 'sessions' ? 'text-red-400 font-bold' : ''}`}
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`whitespace-nowrap ${activeTab === 'drivers' ? 'text-red-400 font-bold' : ''}`}
        >
          Drivers
        </button>
        <button
          onClick={() => setActiveTab('garage')}
          className={`whitespace-nowrap ${activeTab === 'garage' ? 'text-red-400 font-bold' : ''}`}
        >
          GT3 Garage
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`whitespace-nowrap ${activeTab === 'supabase' ? 'text-red-400 font-bold' : ''}`}
        >
          Supabase & SQL
        </button>
      </div>
    </header>
  );
};
