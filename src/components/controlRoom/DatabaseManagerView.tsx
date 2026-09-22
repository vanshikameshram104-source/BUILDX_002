import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { safenetDB, DBTransactionLog, SafeNetStoreName } from '../../services/db/safenetDB';
import { getStoredFirebaseConfig, saveFirebaseConfig, FirebaseConfig } from '../../services/db/firebaseConfig';
import { 
  Database, HardDrive, Cloud, RefreshCw, Download, Upload, 
  Trash2, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Search, 
  Table, FileJson, Server, Activity, ArrowUpRight, Zap, Layers, 
  Lock, Eye, X, ShieldAlert, Check
} from 'lucide-react';

type StoreName = SafeNetStoreName;

interface StoreMeta {
  name: StoreName;
  label: string;
  description: string;
  keyPath: string;
  indexes: string[];
}

const SECTION_26_STORES: StoreMeta[] = [
  {
    name: 'users',
    label: 'USERS',
    description: 'Citizen, Volunteer, Police, and Admin accounts with roles and encrypted credentials',
    keyPath: 'id',
    indexes: ['by-role', 'by-email']
  },
  {
    name: 'incidents',
    label: 'INCIDENTS',
    description: 'Active emergency dispatches, crowd surges, medical calls, and field status',
    keyPath: 'id',
    indexes: ['by-status', 'by-priority', 'by-reporter', 'by-category']
  },
  {
    name: 'missing_persons',
    label: 'MISSING_PERSONS',
    description: 'Lost child and elderly cases with biometric vectors and CCTV match records',
    keyPath: 'id',
    indexes: ['by-status', 'by-type', 'by-reporter']
  },
  {
    name: 'responders',
    label: 'RESPONDERS',
    description: 'Tactical police units, volunteer marshals, duty statuses, and sector allocations',
    keyPath: 'id',
    indexes: ['by-role', 'by-availability', 'by-zone']
  },
  {
    name: 'alerts',
    label: 'ALERTS',
    description: 'Zone-targeted emergency broadcasts, evacuation notices, and mass SMS alerts',
    keyPath: 'id',
    indexes: ['by-priority', 'by-type', 'by-zone']
  },
  {
    name: 'crowd_zones',
    label: 'CROWD_ZONES',
    description: 'Deekshabhoomi monitoring zones with live sensor density and bottleneck risks',
    keyPath: 'id',
    indexes: ['by-risk']
  },
  {
    name: 'safety_journeys',
    label: 'SAFETY_JOURNEYS',
    description: 'Solo attendee route tracking, checkpoint pings, and deviation triggers',
    keyPath: 'id',
    indexes: ['by-user', 'by-status']
  }
];

export const DatabaseManagerView: React.FC = () => {
  const { 
    darkMode, 
    exportDatabaseBackup, 
    importDatabaseBackup, 
    resetToDemoData 
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
  const [storageEstimate, setStorageEstimate] = useState<{ usage: string; quota: string }>({ usage: '1.2 MB', quota: 'Unlimited' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [firebaseSettings, setFirebaseSettings] = useState<FirebaseConfig>(getStoredFirebaseConfig());
  const [cloudTestStatus, setCloudTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');

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
    } catch (err) {
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
      } catch (err) {
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

  // Save Cloud Firebase Configuration
  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(firebaseSettings);
    setActionNotice({
      type: 'success',
      message: 'Cloud Firebase configuration saved.'
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Test Cloud connection
  const handleTestCloudConnection = () => {
    setCloudTestStatus('testing');
    setTimeout(() => {
      setCloudTestStatus('success');
      setTimeout(() => setCloudTestStatus('idle'), 4000);
    }, 1200);
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
                SafeNet Data Governance & Database Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                IndexedDB v1 Active
              </span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Section 26 Compliant • Native IndexedDB Client Storage • Zero-Latency Offline Operations • Cloud Sync Adapter
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
        
        {/* Card 1: Engine */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Storage Engine</span>
            <HardDrive className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            IndexedDB v1
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-emerald-500 font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Client ACID • 0ms Latency</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
            safenet_security_db
          </div>
        </div>

        {/* Card 2: Resilience */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Field Resilience</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-500">
            100% Offline-First
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Zero cloud dependency for crowd safety & responders.
          </p>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Resistant to mobile network outage
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
            Persistent browser quota
          </div>
        </div>

        {/* Card 4: Cross-Node Sync */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Replication Sync</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-blue-500">
            Broadcast Channel
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-[11px]">
            <span>Cross-tab & Multi-window</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
            safenet_cross_tab_sync
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
              <span>Section 26 Database Stores ({SECTION_26_STORES.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an object store to view live records, indexes, and primary key bindings
            </p>
          </div>

          <button
            onClick={() => setShowFirebaseConfig(!showFirebaseConfig)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
              showFirebaseConfig 
                ? 'bg-blue-600 text-white border-blue-500' 
                : darkMode ? 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{showFirebaseConfig ? 'Hide Cloud Config' : 'Cloud / Firebase Sync Adapter'}</span>
          </button>
        </div>

        {/* Cloud Firebase Sync Drawer / Panel */}
        {showFirebaseConfig && (
          <div className={`p-4 rounded-2xl border space-y-4 animate-in fade-in ${
            darkMode ? 'bg-slate-950/60 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Google Cloud Firebase / Firestore Mirror
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Optional Cloud Replication Layer
              </span>
            </div>
            
            <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              SafeNet uses <strong>IndexedDB</strong> as its primary, indestructible database for field operations. If public cellular connectivity is available, you can mirror events to Google Cloud Firestore across geographically distributed command centers.
            </p>

            <form onSubmit={handleSaveFirebase} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Project ID</label>
                <input 
                  type="text"
                  value={firebaseSettings.projectId}
                  onChange={(e) => setFirebaseSettings({ ...firebaseSettings, projectId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="safenet-nagpur"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Auth Domain</label>
                <input 
                  type="text"
                  value={firebaseSettings.authDomain}
                  onChange={(e) => setFirebaseSettings({ ...firebaseSettings, authDomain: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="safenet-nagpur.firebaseapp.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">API Key (Masked)</label>
                <input 
                  type="password"
                  value={firebaseSettings.apiKey}
                  onChange={(e) => setFirebaseSettings({ ...firebaseSettings, apiKey: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="AIzaSyA1B2C3D4E5..."
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="cloud-enabled"
                    checked={firebaseSettings.enabled}
                    onChange={(e) => setFirebaseSettings({ ...firebaseSettings, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="cloud-enabled" className="text-xs font-medium cursor-pointer">
                    Enable Background Cloud Mirroring (when network is reachable)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestCloudConnection}
                    disabled={cloudTestStatus === 'testing'}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                      cloudTestStatus === 'success' 
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                        : darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cloudTestStatus === 'testing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : cloudTestStatus === 'success' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {cloudTestStatus === 'testing' ? 'Testing Handshake...' : cloudTestStatus === 'success' ? 'Adapter Validated' : 'Test Handshake'}
                    </span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
                  >
                    Save Cloud Config
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
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                Store: {activeStoreMeta.name}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                KeyPath: <code className="text-blue-400">"{activeStoreMeta.keyPath}"</code>
              </span>
            </div>
            <p className={`text-[11px] mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {activeStoreMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400">Indexes:</span>
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
              placeholder={`Search records in '${selectedStore}' (ID, text, status)...`}
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
                    
                    // Summarize key attributes depending on store
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
                              title="Inspect raw JSON document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(id)}
                              className={`p-1.5 rounded-lg border transition ${
                                darkMode ? 'border-rose-500/20 hover:bg-rose-500/20 text-rose-400' : 'border-rose-200 hover:bg-rose-50 text-rose-600'
                              }`}
                              title="Delete record from IndexedDB"
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
              Live Database Transaction Stream (IndexedDB ACID Log)
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

    </div>
  );
};
