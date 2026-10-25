import React, { useState } from 'react';
import { SimRacingProvider, useSimRacing } from './context/SimRacingContext';
import { Navbar, NavTab } from './components/Navbar';
import { LiveTelemetryDashboard } from './components/LiveTelemetryDashboard';
import { RaceSessionManager } from './components/RaceSessionManager';
import { DriverManager } from './components/DriverManager';
import { CarGarage } from './components/CarGarage';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { DriverCompareModal } from './components/DriverCompareModal';
import { Database, Gauge, Flag, Users, Car, Sparkles, ExternalLink } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('telemetry');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [compareModal, setCompareModal] = useState<{
    isOpen: boolean;
    driverAId: string;
    driverBId: string;
  }>({
    isOpen: false,
    driverAId: '',
    driverBId: '',
  });

  const { setActiveSessionId, drivers, cars, tracks, sessions, supabaseConfig } = useSimRacing();

  const handleLaunchSessionTelemetry = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setActiveTab('telemetry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompareDrivers = (driverAId: string, driverBId: string) => {
    setCompareModal({
      isOpen: true,
      driverAId,
      driverBId,
    });
  };

  return (
    <div className="min-h-screen bg-[#090c10] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'telemetry' && (
          <LiveTelemetryDashboard
            onCompareDrivers={handleCompareDrivers}
            onNavigateToSessions={() => setActiveTab('sessions')}
          />
        )}

        {activeTab === 'sessions' && (
          <RaceSessionManager onSelectSessionForTelemetry={handleLaunchSessionTelemetry} />
        )}

        {activeTab === 'drivers' && <DriverManager onCompareDrivers={handleCompareDrivers} />}

        {activeTab === 'garage' && <CarGarage />}

        {activeTab === 'supabase' && (
          <div className="space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <Database className="w-6 h-6 text-emerald-400" />
                  <span>Supabase Database & Real-Time Sync</span>
                </h1>
                <p className="text-xs md:text-sm text-neutral-400 mt-1">
                  Manage persistent Cloud PostgreSQL schemas, inspect table structures, and run analytical queries.
                </p>
              </div>

              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-950/40 shrink-0"
              >
                Open Supabase Connection Manager
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-500 uppercase font-mono block">Active Drivers</span>
                <span className="text-2xl font-extrabold text-white font-mono">{drivers.length}</span>
                <span className="text-[11px] text-neutral-400 block mt-1">Stored in public.drivers</span>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-500 uppercase font-mono block">GT3 Machines</span>
                <span className="text-2xl font-extrabold text-white font-mono">{cars.length}</span>
                <span className="text-[11px] text-neutral-400 block mt-1">Stored in public.cars</span>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-500 uppercase font-mono block">Global Tracks</span>
                <span className="text-2xl font-extrabold text-white font-mono">{tracks.length}</span>
                <span className="text-[11px] text-neutral-400 block mt-1">Across 4 FIA regions</span>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-500 uppercase font-mono block">Race Sessions</span>
                <span className="text-2xl font-extrabold text-white font-mono">{sessions.length}</span>
                <span className="text-[11px] text-neutral-400 block mt-1">Stored in public.race_sessions</span>
              </div>
            </div>

            {/* In-tab connection launcher card */}
            <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Database Status & Integration
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold ${
                    supabaseConfig.isConnected
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {supabaseConfig.isConnected ? 'Connected & Synchronized' : 'Offline Reactive Storage'}
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                ApexSim is built with a dual-layer architecture: it runs instantly with full reactive local
                persistence out-of-the-box, and seamlessly binds with Supabase PostgreSQL via the official{' '}
                <code className="text-emerald-400 font-mono">@supabase/supabase-js</code> client when your
                project URL and anon public key are supplied.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
                >
                  View PostgreSQL Schema & Analytical Queries
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Supabase Connection Modal */}
      <SupabaseConnectModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Driver Compare Modal */}
      <DriverCompareModal
        isOpen={compareModal.isOpen}
        driverAId={compareModal.driverAId}
        driverBId={compareModal.driverBId}
        onClose={() =>
          setCompareModal({
            isOpen: false,
            driverAId: '',
            driverBId: '',
          })
        }
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#090c10] py-6 px-4 sm:px-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-400">ApexSim Hub</span>
            <span>·</span>
            <span>Sim Racing Management & Real-Time Telemetry</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>GT3 Homologation Spec</span>
            <span>·</span>
            <span>Supabase PostgreSQL Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SimRacingProvider>
      <MainAppContent />
    </SimRacingProvider>
  );
}
