import React, { useState } from 'react';
import {
  Database,
  Check,
  Copy,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Code2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
} from 'lucide-react';
import { useSimRacing } from '../context/SimRacingContext';
import { SUPABASE_SQL_SCHEMA, ANALYTICAL_SQL_QUERIES } from '../lib/supabase-schema';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ isOpen, onClose }) => {
  const {
    supabaseConfig,
    connectSupabase,
    disconnectSupabase,
    syncToSupabase,
    pullFromSupabase,
  } = useSimRacing();

  const [activeTab, setActiveTab] = useState<'connect' | 'schema' | 'queries'>('connect');
  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey || '');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedQueryIdx, setCopiedQueryIdx] = useState<number | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await connectSupabase(urlInput, keyInput);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleCopyQuery = (sql: string, idx: number) => {
    navigator.clipboard.writeText(sql);
    setCopiedQueryIdx(idx);
    setTimeout(() => setCopiedQueryIdx(null), 2000);
  };

  const handlePushSync = async () => {
    setSyncStatusMsg('Pushing local roster and sessions to Supabase...');
    const res = await syncToSupabase();
    setSyncStatusMsg(res.message);
  };

  const handlePullSync = async () => {
    setSyncStatusMsg('Pulling remote records from Supabase...');
    const res = await pullFromSupabase();
    setSyncStatusMsg(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Supabase Integration & SQL Engine
              </h2>
              <p className="text-xs text-neutral-400">
                Connect your PostgreSQL database, manage schemas, and run high-efficiency analytics queries.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white font-mono text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-neutral-900/50 border-b border-neutral-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Connection & Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Database Schema (SQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('queries')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'queries'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Analytical Queries ({ANALYTICAL_SQL_QUERIES.length})</span>
          </button>
        </div>

        {/* Tab 1: Connect & Sync */}
        {activeTab === 'connect' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Connection Status Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-950/20 border-emerald-800/50'
                  : 'bg-neutral-900/40 border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {supabaseConfig.isConnected ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {supabaseConfig.isConnected
                      ? 'Connected to Live Supabase Project'
                      : 'Running in Local Reactive Mode'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {supabaseConfig.isConnected
                      ? `Active synchronization enabled. Last synced: ${
                          supabaseConfig.lastSyncAt || 'Just now'
                        }`
                      : 'Data is persisted in browser storage. Enter your Supabase credentials below to sync with real PostgreSQL tables.'}
                  </p>
                </div>
              </div>

              {supabaseConfig.isConnected && (
                <button
                  onClick={disconnectSupabase}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-neutral-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  Disconnect
                </button>
              )}
            </div>

            {/* Quick 3-Step Setup Guide */}
            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-xs space-y-2">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                Quick 3-Minute Setup Guide
              </span>
              <ol className="list-decimal list-inside space-y-1 text-neutral-300">
                <li>Create a free project at <strong className="text-emerald-400">supabase.com</strong>.</li>
                <li>Go to the <strong className="text-white">Database Schema (SQL)</strong> tab above, click <strong className="text-red-400">Copy SQL Schema</strong>, and run it in the Supabase SQL Editor.</li>
                <li>Go to Supabase Project Settings → API, copy your <strong className="text-white">Project URL</strong> and <strong className="text-white">anon public key</strong>, and paste them below.</li>
              </ol>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleTestAndConnect} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-neutral-400">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-neutral-400">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/40 border-red-800 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                >
                  {isTesting ? 'Verifying Connection...' : 'Test & Connect to Supabase'}
                </button>
              </div>
            </form>

            {/* Sync Controls (Push / Pull) */}
            {supabaseConfig.isConnected && (
              <div className="p-4 bg-neutral-900/70 rounded-xl border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Database Synchronization Tools
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handlePushSync}
                    className="flex items-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Push Local Roster to Supabase</span>
                  </button>

                  <button
                    onClick={handlePullSync}
                    className="flex items-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Pull Fresh Records from Supabase</span>
                  </button>
                </div>

                {syncStatusMsg && (
                  <p className="text-xs text-neutral-400 font-mono italic">{syncStatusMsg}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Database Schema (SQL) */}
        {activeTab === 'schema' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Complete PostgreSQL / Supabase Schema
                </h3>
                <p className="text-xs text-neutral-400">
                  Creates tables: drivers, tracks, cars, race_sessions, session_entries, lap_times, telemetry_logs + RLS policies.
                </p>
              </div>

              <button
                onClick={handleCopySchema}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-red-950/30"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <div className="relative bg-neutral-900 rounded-xl border border-neutral-800 p-4 font-mono text-xs text-neutral-300 overflow-x-auto max-h-96">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        )}

        {/* Tab 3: Analytical SQL Queries */}
        {activeTab === 'queries' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div>
              <h3 className="text-sm font-bold text-white">
                Optimized SQL Queries for Race Analytics
              </h3>
              <p className="text-xs text-neutral-400">
                Pre-written queries designed for driver consistency tracking, fastest lap sector splits, BoP balancing, and standings.
              </p>
            </div>

            <div className="space-y-4">
              {ANALYTICAL_SQL_QUERIES.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900">
                          {q.category}
                        </span>
                        <h4 className="text-sm font-bold text-white">{q.title}</h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{q.description}</p>
                    </div>

                    <button
                      onClick={() => handleCopyQuery(q.sql, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors shrink-0"
                    >
                      {copiedQueryIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 font-mono text-[11px] text-neutral-300 overflow-x-auto">
                    <pre>{q.sql}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>PostgreSQL 15+ compatible with Row Level Security</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
