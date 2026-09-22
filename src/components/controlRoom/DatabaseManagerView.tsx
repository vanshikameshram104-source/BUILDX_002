import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { safenetDB, DBTransactionLog, SafeNetStoreName } from '../../services/db/safenetDB';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection, 
  SupabaseConfig 
} from '../../services/db/supabaseClient';
import { SUPABASE_POSTGRES_SCHEMA } from '../../services/db/supabaseSchemaText';
import { 
  Database, Cloud, RefreshCw, Download, Upload, 
  Trash2, CheckCircle2, AlertTriangle, ShieldCheck, Search, 
  FileJson, Server, Activity, Zap, Layers, 
  Eye, X, Copy, CheckCheck, Code, Check
} from 'lucide-react';

type StoreName = SafeNetStoreName;

interface StoreMeta {
  name: StoreName;
  label: string;
  description: string;
  keyPath: string;
  pgType: string;
  indexes: string[];
}

const SECTION_26_STORES: StoreMeta[] = [
  {
    name: 'users',
    label: 'USERS',
    description: 'Citizen, Volunteer, Police, and Admin accounts with roles and credentials',
    keyPath: 'id',
    pgType: 'public.users (PostgreSQL Table)',
    indexes: ['by-role', 'by-email']
  },
  {
    name: 'incidents',
    label: 'INCIDENTS',
    description: 'Active emergency dispatches, crowd surges, medical calls, and field status',
    keyPath: 'id',
    pgType: 'public.incidents (PostgreSQL Table)',
    indexes: ['by-status', 'by-priority', 'by-reporter', 'by-category']
  },
  {
    name: 'missing_persons',
    label: 'MISSING_PERSONS',
    description: 'Lost child and elderly cases with biometric vectors and CCTV match records',
    keyPath: 'id',
    pgType: 'public.missing_persons (PostgreSQL Table)',
    indexes: ['by-status', 'by-type', 'by-reporter']
  },
  {
    name: 'responders',
    label: 'RESPONDERS',
    description: 'Tactical police units, volunteer marshals, duty statuses, and sector allocations',
    keyPath: 'id',
    pgType: 'public.responders (PostgreSQL Table)',
    indexes: ['by-role', 'by-availability', 'by-zone']
  },
  {
    name: 'alerts',
    label: 'ALERTS',
    description: 'Zone-targeted emergency broadcasts, evacuation notices, and mass SMS alerts',
    keyPath: 'id',
    pgType: 'public.alerts (PostgreSQL Table)',
    indexes: ['by-priority', 'by-type', 'by-zone']
  },
  {
    name: 'crowd_zones',
    label: 'CROWD_ZONES',
    description: 'Deekshabhoomi monitoring zones with live sensor density and bottleneck risks',
    keyPath: 'id',
    pgType: 'public.crowd_zones (PostgreSQL Table)',
    indexes: ['by-risk']
  },
  {
    name: 'safety_journeys',
    label: 'SAFETY_JOURNEYS',
    description: 'Solo attendee route tracking, checkpoint pings, and deviation triggers',
    keyPath: 'id',
    pgType: 'public.safety_journeys (PostgreSQL Table)',
    indexes: ['by-user', 'by-status']
  }
];

export const DatabaseManagerView: React.FC = () => {
  const { 
    darkMode, 
    exportDatabaseBackup, 
    importDatabaseBackup, 
    resetToDemoData,
    isSupabaseConnected,
    reconnectSupabase
  } = useApp();

  const [selectedStore, setSelectedStore] = useState<StoreName>('incidents');
  const [storeRecords, setStoreRecords] = useState<Record<string, unknown>[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<StoreName, number>>({
    users: 0,
    incidents: 0,
    missing_persons: 0,
    responders: 0,
    alerts: 0,
    crowd_zones: 0,
    safety_journeys: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewingRecord, setViewingRecord] = useState<Record<string, unknown> | null>(null);
  const [transactionLogs, setTransactionLogs] = useState<DBTransactionLog[]>([]);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: string; quota: string }>({ usage: '1.4 MB', quota: 'Unlimited' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Supabase / Neon Cloud settings
  const [showSupabasePanel, setShowSupabasePanel] = useState(false);
  const [supabaseSettings, setSupabaseSettings] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [supabaseTestFeedback, setSupabaseTestFeedback] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);

  // Load record counts & active store data
  const loadDatabaseData = async () => {
    try {
      setIsRefreshing(true);
      const [users, incs, msps, resps, alts, zones, journeys] = await Promise.all([
        safenetDB.getStoreData('users'),
        safenetDB.getStoreData('incidents'),
        safenetDB.getStoreData('missing_persons'),
        safenetDB.getStoreData('responders'),
        safenetDB.getStoreData('alerts'),
        safenetDB.getStoreData('crowd_zones'),
        safenetDB.getStoreData('safety_journeys')
      ]);

      setRecordCounts({
        users: users.length,
        incidents: incs.length,
        missing_persons: msps.length,
        responders: resps.length,
        alerts: alts.length,
        crowd_zones: zones.length,
        safety_journeys: journeys.length
      });

      const activeData = await safenetDB.getStoreData(selectedStore);
      setStoreRecords(activeData as Record<string, unknown>[]);

      // Storage quota estimation
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usageMB = ((est.usage || 0) / (1024 * 1024)).toFixed(2);
        const quotaMB = ((est.quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
        setStorageEstimate({
          usage: `${usageMB} MB`,
          quota: `${quotaMB} GB`
        });
      }
    } catch (err) {
      console.error('Error fetching database records:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
    const unsubscribe = safenetDB.subscribeToLogs((logs) => {
      setTransactionLogs(logs);
    });
    return () => unsubscribe();
  }, [selectedStore]);

  const handleStoreSelect = async (name: StoreName) => {
    setSelectedStore(name);
    try {
      const data = await safenetDB.getStoreData(name);
      setStoreRecords(data as Record<string, unknown>[]);
    } catch (err) {
      console.error(err);
    }
  };

  // Export JSON Dump
  const handleExportBackup = async () => {
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `safenet-database-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setActionNotice({
        type: 'success',
        message: 'Database backup downloaded successfully.'
      });
      setTimeout(() => setActionNotice(null), 4000);
    } catch {
      setActionNotice({
        type: 'error',
        message: 'Failed to export database backup.'
      });
    }
  };

  // Import JSON Dump
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const success = await importDatabaseBackup(content);
        if (success) {
          await loadDatabaseData();
          setActionNotice({
            type: 'success',
            message: 'Database restored successfully from backup JSON.'
          });
        } else {
          setActionNotice({
            type: 'error',
            message: 'Invalid backup file format or incompatible schema.'
          });
        }
      } catch {
        setActionNotice({
          type: 'error',
          message: 'Error parsing backup file.'
        });
      }
      setTimeout(() => setActionNotice(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset database to initial event state
  const handleResetDefaults = async () => {
    if (window.confirm('Reset database to default Dhammachakra Pravartan Din baseline records? Current modifications will be replaced.')) {
      resetToDemoData();
      await loadDatabaseData();
      setActionNotice({
        type: 'success',
        message: 'Database reseeded with baseline event data.'
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Delete individual record
  const handleDeleteRecord = async (id: string) => {
    if (window.confirm(`Delete record '${id}' from '${selectedStore}'?`)) {
      await safenetDB.deleteItem(selectedStore, id);
      await loadDatabaseData();
      if (viewingRecord && viewingRecord.id === id) {
        setViewingRecord(null);
      }
    }
  };

  // Save Supabase Configuration & Reconnect
  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseSettings);
    const connected = await reconnectSupabase();
    setActionNotice({
      type: connected ? 'success' : 'error',
      message: connected 
        ? 'Supabase PostgreSQL connected! Live Realtime Sync active.' 
        : 'Supabase credentials saved. (Offline-First mode active)'
    });
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Test Supabase Connection
  const handleTestSupabase = async () => {
    setSupabaseTestStatus('testing');
    setSupabaseTestFeedback('');
    const res = await testSupabaseConnection(supabaseSettings.url, supabaseSettings.anonKey);
    if (res.success) {
      setSupabaseTestStatus('success');
      setSupabaseTestFeedback(res.message);
    } else {
      setSupabaseTestStatus('error');
      setSupabaseTestFeedback(res.message);
    }
  };

  // Copy SQL Schema to Clipboard
  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_POSTGRES_SCHEMA);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 3000);
      setActionNotice({
        type: 'success',
        message: 'PostgreSQL Schema copied to clipboard! Paste into Supabase or Neon SQL Editor.'
      });
      setTimeout(() => setActionNotice(null), 4500);
    } catch {
      // Fallback
    }
  };

  // Filter records in current store
  const filteredRecords = storeRecords.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return JSON.stringify(rec).toLowerCase().includes(q);
  });

  const activeStoreMeta = SECTION_26_STORES.find(s => s.name === selectedStore)!;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                SafeNet Database Governance & Storage Architecture
              </h2>
              {isSupabaseConnected ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Supabase PostgreSQL (Live Realtime)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  IndexedDB v1 (Offline-First Active)
                </span>
              )}
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Section 26 Compliant • Supabase & Neon PostgreSQL Compatibility • Native Client ACID Storage • Realtime Multi-Device Sync
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadDatabaseData}
            disabled={isRefreshing}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
              darkMode 
                ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700' 
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Dump</span>
          </button>

          <label className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
            darkMode 
              ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' 
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}>
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          <button
            onClick={handleResetDefaults}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
              darkMode 
                ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10' 
                : 'border-rose-200 text-rose-600 hover:bg-rose-50'
            }`}
            title="Reset database to default event data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reseed</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs animate-in fade-in ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            )}
            <span className="font-medium">{actionNotice.message}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)} 
            className="p-1 rounded-lg hover:bg-black/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Database Health & Architecture Metrics (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        {/* Card 1: Primary Database */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cloud Engine</span>
            <Cloud className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {isSupabaseConnected ? 'Supabase Postgres' : 'PostgreSQL Cloud'}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 font-medium text-[11px]">
            {isSupabaseConnected ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Connected & Realtime Active</span>
              </span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Configurable (Neon / Supabase)</span>
              </span>
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
            {isSupabaseConnected ? supabaseSettings.url : 'supabase_schema.sql ready'}
          </div>
        </div>

        {/* Card 2: Field Resilience */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Offline Engine</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-500">
            IndexedDB v1
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            100% offline-first fallback when cellular towers congest.
          </p>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            safenet_security_db (0ms latency)
          </div>
        </div>

        {/* Card 3: Storage Quota */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Allocated Storage</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {storageEstimate.usage}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-[11px]">
            <span>Quota: {storageEstimate.quota}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Persistent client quota
          </div>
        </div>

        {/* Card 4: Replication Sync */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Replication Sync</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-blue-500">
            {isSupabaseConnected ? 'WebSockets' : 'Broadcast Channel'}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-[11px]">
            <span>{isSupabaseConnected ? 'PostgreSQL Changes Channel' : 'Cross-tab & Multi-window'}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
            {isSupabaseConnected ? 'safenet_public_realtime' : 'safenet_cross_tab_sync'}
          </div>
        </div>

      </div>

      {/* SECTION 26 OBJECT STORES EXPLORER */}
      <div className={`p-5 rounded-3xl border space-y-4 ${
        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Section 26 Database Stores & PostgreSQL Tables ({SECTION_26_STORES.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an entity store to view live records, indexes, primary keys, and PostgreSQL DDL mapping
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySchema}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                copiedSchema 
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' 
                  : darkMode ? 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Copy complete PostgreSQL DDL schema for Supabase or Neon SQL Editor"
            >
              {copiedSchema ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema (Supabase / Neon)'}</span>
            </button>

            <button
              onClick={() => setShowSchemaModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                darkMode ? 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Inspect raw PostgreSQL DDL"
            >
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span>View SQL DDL</span>
            </button>

            <button
              onClick={() => setShowSupabasePanel(!showSupabasePanel)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                showSupabasePanel 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : darkMode ? 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{showSupabasePanel ? 'Close Cloud Config' : 'Supabase / Neon Sync Settings'}</span>
            </button>
          </div>
        </div>

        {/* SUPABASE & NEON CLOUD CONFIGURATION PANEL */}
        {showSupabasePanel && (
          <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in ${
            darkMode ? 'bg-slate-950/70 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Supabase & Neon PostgreSQL Cloud Synchronization
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Connect an active Supabase or Neon PostgreSQL database instance to enable real-time replication.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${
                  isSupabaseConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {isSupabaseConnected ? '● REALTIME POSTGRES ACTIVE' : '○ OFFLINE-FIRST BUFFER (IndexedDB Active)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSupabase} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Supabase Project URL (or Neon REST Endpoint)
                </label>
                <input 
                  type="text"
                  value={supabaseSettings.url}
                  onChange={(e) => setSupabaseSettings({ ...supabaseSettings, url: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="https://xyzproject.supabase.co"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Supabase Public Anon API Key
                </label>
                <input 
                  type="password"
                  value={supabaseSettings.anonKey}
                  onChange={(e) => setSupabaseSettings({ ...supabaseSettings, anonKey: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>

              {supabaseTestFeedback && (
                <div className={`sm:col-span-2 p-2.5 rounded-xl border text-xs font-mono ${
                  supabaseTestStatus === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {supabaseTestFeedback}
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="px-3 py-1.5 rounded-xl border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    {copiedSchema ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>1-Click Copy Schema for SQL Editor</span>
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Run in Supabase or Neon SQL editor
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={supabaseTestStatus === 'testing'}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                      supabaseTestStatus === 'success' 
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                        : darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {supabaseTestStatus === 'testing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : supabaseTestStatus === 'success' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {supabaseTestStatus === 'testing' ? 'Testing Handshake...' : 'Test Connection'}
                    </span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
                  >
                    Save & Reconnect
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* 7 Stores Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {SECTION_26_STORES.map((store) => {
            const count = recordCounts[store.name] || 0;
            const isSelected = selectedStore === store.name;
            return (
              <button
                key={store.name}
                onClick={() => handleStoreSelect(store.name)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-medium transition flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                    : darkMode 
                      ? 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <span>{store.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Store Details Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                Store: {activeStoreMeta.name}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-400 font-mono text-[11px]">
                {activeStoreMeta.pgType}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                PK: <code className="text-blue-400">"{activeStoreMeta.keyPath}"</code>
              </span>
            </div>
            <p className={`text-[11px] mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {activeStoreMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400">B-Tree Indexes:</span>
            {activeStoreMeta.indexes.map(idx => (
              <span 
                key={idx} 
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] border ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {idx}
              </span>
            ))}
          </div>
        </div>

        {/* Search Bar for Store Data */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search records in '${selectedStore}' (ID, description, location, status)...`}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border transition ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Showing {filteredRecords.length} of {storeRecords.length} records
          </span>
        </div>

        {/* Live Store Records Table */}
        <div className="rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className={`sticky top-0 z-10 border-b font-mono text-[11px] uppercase tracking-wider ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Primary Key</th>
                  <th className="py-2.5 px-4 font-semibold">Key Attributes</th>
                  <th className="py-2.5 px-4 font-semibold">Status / Priority</th>
                  <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No records found in '{selectedStore}'.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const id = String(record.id || 'N/A');
                    const status = String(record.status || record.riskLevel || record.availability || record.role || 'ACTIVE');
                    const timestamp = String(record.updatedAt || record.createdAt || record.timestamp || record.lastSeenTime || 'Just now');
                    
                    let summary = '';
                    if (record.name) summary += `${record.name} `;
                    if (record.category) summary += `• ${record.category} `;
                    if (record.location) summary += `• ${record.location} `;
                    if (record.zoneName) summary += `${record.zoneName} (${record.density}%) `;
                    if (record.title) summary += `${record.title} `;
                    if (record.email) summary += `${record.email} `;
                    if (record.destination) summary += `Route: ${record.destination} `;

                    return (
                      <tr 
                        key={id} 
                        className={`transition ${
                          darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-blue-500">
                          {id}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                          <span className="line-clamp-1">{summary || JSON.stringify(record).slice(0, 60)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            status === 'CRITICAL' || status === 'REPORTED'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : status === 'RESOLVED' || status === 'NORMAL' || status === 'available'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {timestamp}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingRecord(record)}
                              className={`p-1.5 rounded-lg border transition ${
                                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                              title="Inspect raw document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(id)}
                              className={`p-1.5 rounded-lg border transition ${
                                darkMode ? 'border-rose-500/20 hover:bg-rose-500/20 text-rose-400' : 'border-rose-200 hover:bg-rose-50 text-rose-600'
                              }`}
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LIVE TRANSACTION & AUDIT LOG */}
      <div className={`p-5 rounded-3xl border space-y-3 ${
        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Database Transaction Stream (ACID Audit Log)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {transactionLogs.length} Transactions Tracked
          </span>
        </div>

        <div className="space-y-1.5 max-h-[220px] overflow-y-auto font-mono text-[11px] pr-1">
          {transactionLogs.map((log) => (
            <div 
              key={log.id} 
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                darkMode ? 'bg-slate-950/60 border-slate-800/70' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                  log.action === 'WRITE' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : log.action === 'DELETE' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : log.action === 'RESET' || log.action === 'RESTORE'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {log.action}
                </span>
                <span className="text-blue-400 font-semibold shrink-0">[{log.store}]</span>
                <span className={`truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {log.details}
                </span>
              </div>
              <span className="text-slate-500 text-[10px] shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RAW JSON RECORD INSPECTOR MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full p-6 rounded-3xl border shadow-2xl space-y-4 max-h-[85vh] flex flex-col ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold">
                  Document Inspector: <span className="font-mono text-blue-400">{String(viewingRecord.id)}</span>
                </h3>
              </div>
              <button 
                onClick={() => setViewingRecord(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 rounded-2xl font-mono text-xs ${
              darkMode ? 'bg-slate-950 text-emerald-400 border border-slate-800' : 'bg-slate-900 text-emerald-400'
            }`}>
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(viewingRecord, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Store: {selectedStore}
              </span>
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POSTGRESQL SCHEMA MODAL (For Supabase / Neon) */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-3xl w-full p-6 rounded-3xl border shadow-2xl space-y-4 max-h-[85vh] flex flex-col ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold">
                  PostgreSQL DDL Schema (Supabase & Neon Compatible)
                </h3>
              </div>
              <button 
                onClick={() => setShowSchemaModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 rounded-2xl font-mono text-xs ${
              darkMode ? 'bg-slate-950 text-slate-300 border border-slate-800' : 'bg-slate-900 text-slate-300'
            }`}>
              <pre className="whitespace-pre-wrap leading-relaxed">
                {SUPABASE_POSTGRES_SCHEMA}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopySchema}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-2"
              >
                {copiedSchema ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy Entire SQL Schema'}</span>
              </button>

              <button
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
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
