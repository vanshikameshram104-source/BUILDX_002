import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SecurityMap } from '../common/SecurityMap';
import { AIMissingPersonMatcher } from '../controlRoom/AIMissingPersonMatcher';
import { AICrowdMonitor } from '../controlRoom/AICrowdMonitor';
import { Incident, MissingPerson, IncidentStatus, IncidentPriority } from '../../types';
import { 
  ShieldAlert, Radio, Users, Activity, MapPin, 
  Clock, CheckCircle2, ChevronRight, UserCheck, AlertTriangle, 
  PhoneCall, Eye, BadgeAlert, Send, Sparkles, Shield, Sliders
} from 'lucide-react';

export const PoliceDashboard: React.FC = () => {
  const { 
    currentUser, 
    incidents, 
    missingPersons, 
    crowdZones, 
    alerts, 
    responders,
    updateIncidentStatus,
    updateIncidentPriority,
    assignResponder,
    darkMode 
  } = useApp();

  // Section 34: Dashboard, Cases, Crowd, Responders, Map, Alerts
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'crowd' | 'responders' | 'map' | 'alerts'>('dashboard');
  const [commsMessage, setCommsMessage] = useState('');
  const [commsLog, setCommsLog] = useState<string[]>([
    '17:28 [CTRL-001]: Unit 4, hold perimeter at Main Gate security arch.',
    '17:34 [MH-NGP-4019]: Acknowledged. Suspect apprehended in harassment case at Exit A.',
    '17:42 [CTRL-001]: Inspect camera match at Exit B for missing child Case MSP-2026-00124.'
  ]);

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const activeMissing = missingPersons.filter(m => m.status !== 'CLOSED');

  const handleSendComms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commsMessage.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCommsLog(prev => [`${now} [${currentUser.badgeNumber || 'POLICE-UNIT'}]: ${commsMessage}`, ...prev]);
    setCommsMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Top Police Header */}
      <div className={`p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40">
                {currentUser.badgeNumber || 'MH-NGP-4019'}
              </span>
              <span className="text-xs text-slate-400">Nagpur Police Control</span>
            </div>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Sector Commander • Perimeter Command Post • Assigned Sector: <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>Main Gate & Perimeter</strong>
            </p>
          </div>
        </div>

        {/* Radio Feed Pill */}
        <div className="text-right">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Encrypted UHF Net #2: ACTIVE
          </span>
        </div>
      </div>

      {/* Police Section 34 Tabs: Dashboard, Cases, Crowd, Responders, Map, Alerts */}
      <div className={`flex items-center gap-2 border-b pb-1 text-xs overflow-x-auto ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        {([
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'cases', label: `Cases (${activeIncidents.length + activeMissing.length})` },
          { id: 'crowd', label: 'Crowd Risks' },
          { id: 'responders', label: `Responders (${responders.length})` },
          { id: 'map', label: 'Tactical Map' },
          { id: 'alerts', label: 'Alerts & Radio' }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. POLICE DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400">Critical Incidents</span>
              <p className="text-2xl font-bold text-rose-500 mt-1">
                {incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400">Missing Persons</span>
              <p className="text-2xl font-bold text-blue-500 mt-1">{activeMissing.length}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400">Crowd Hotspots</span>
              <p className="text-2xl font-bold text-amber-500 mt-1">Exit B (87%)</p>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400">Field Units</span>
              <p className="text-2xl font-bold text-emerald-500 mt-1">8 Active</p>
            </div>
          </div>

          {/* Critical Tasks Stream */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active High-Priority Triage</h3>
            {activeIncidents.slice(0, 3).map(inc => (
              <div 
                key={inc.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  inc.priority === 'CRITICAL' ? 'border-rose-500/40 bg-rose-500/5' :
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400 font-bold">{inc.id}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{inc.category}</h4>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      inc.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inc.priority}
                    </span>
                  </div>
                  <p className={`mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{inc.description}</p>
                  <p className="text-slate-400 text-[11px] mt-1">📍 {inc.location} • Status: {inc.status}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateIncidentStatus(inc.id, 'RESOLVED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => setActiveTab('cases')}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white"
                  >
                    Case File
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CASES VIEW (Incident Queue + Missing Persons + AI Biometric Matcher) */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Incident Queue</h3>
            {activeIncidents.map(inc => (
              <div 
                key={inc.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 shadow-sm text-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-400">{inc.id}</span>
                      <h3 className="font-bold text-sm text-white">{inc.category}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        inc.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {inc.priority}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-slate-300">{inc.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Location: <strong className="text-white">{inc.location}</strong></span>
                      <span>Reporter: {inc.reporterName}</span>
                      {inc.reporterPhone && <span>Phone: {inc.reporterPhone}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <select
                      value={inc.assignedResponderId || ''}
                      onChange={(e) => assignResponder(inc.id, e.target.value)}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value="">-- Assign Unit --</option>
                      {responders.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                      ))}
                    </select>

                    <button
                      onClick={() => updateIncidentStatus(inc.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Face Biometric Matcher for Authorized Police Personnel (Section 20) */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  AI Facial Recognition Prototype (Police Authorized Access)
                </h3>
                <p className="text-xs text-slate-400">
                  Compare CCTV footage against registered missing-person biometric templates
                </p>
              </div>
            </div>
            <AIMissingPersonMatcher />
          </div>
        </div>
      )}

      {/* 3. CROWD RISKS TAB */}
      {activeTab === 'crowd' && (
        <div className="space-y-6">
          <AICrowdMonitor />
        </div>
      )}

      {/* 4. RESPONDERS TAB */}
      {activeTab === 'responders' && (
        <div className="space-y-4">
          <div className="border-b pb-3 border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Field Personnel & Patrol Units</h2>
            <p className="text-xs text-slate-400">Deployed units across Deekshabhoomi perimeter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responders.map(r => (
              <div 
                key={r.id} 
                className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</h4>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                    {r.availability}
                  </span>
                </div>
                <p className="text-slate-400 capitalize">{r.role} • Sector: {r.zone}</p>
                <p className="font-mono text-[11px] text-slate-500">Callsign: {r.badge || 'UNIT-0'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TACTICAL MAP */}
      {activeTab === 'map' && (
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-sm bg-slate-950">
          <SecurityMap height="560px" />
        </div>
      )}

      {/* 6. ALERTS & RADIO NET LOG */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Radio Communication Feed */}
          <div className={`p-5 rounded-2xl border space-y-4 text-xs ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-sm">Encrypted Tactical Dispatch Radio Feed</h3>
              <span className="text-[10px] font-mono text-emerald-400">CH-02 UHF LINK</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px] p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              {commsLog.map((line, idx) => (
                <div key={idx} className="text-slate-300">
                  {line}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComms} className="flex gap-2">
              <input
                type="text"
                value={commsMessage}
                onChange={(e) => setCommsMessage(e.target.value)}
                placeholder="Broadcast dispatch order to sector units..."
                className={`flex-1 p-2 rounded-xl border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Transmit
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
