import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SecurityMap } from '../common/SecurityMap';
import { AICrowdMonitor } from './AICrowdMonitor';
import { AIMissingPersonMatcher } from './AIMissingPersonMatcher';
import { EmergencyBroadcastModal } from './EmergencyBroadcastModal';
import { Incident, MissingPerson, IncidentPriority, IncidentStatus } from '../../types';
import { 
  ShieldAlert, Users, Radio, AlertTriangle, UserCheck, 
  MapPin, Clock, Filter, Eye, CheckCircle2, ChevronRight,
  TrendingUp, BarChart3, Bell, ArrowRight, UserX, Compass
} from 'lucide-react';

export const ControlRoomDashboard: React.FC = () => {
  const { 
    incidents, 
    missingPersons, 
    responders, 
    crowdZones, 
    alerts,
    updateIncidentStatus,
    updateIncidentPriority,
    assignResponder,
    darkMode 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'crowd' | 'missing' | 'broadcast' | 'analytics'>('overview');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // KPI calculations
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalIncidentsCount = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const activeMissingCount = missingPersons.filter(m => m.status !== 'CLOSED' && m.status !== 'FOUND').length;
  const availableRespondersCount = responders.filter(r => r.availability === 'available').length;
  const criticalZonesCount = crowdZones.filter(z => z.riskLevel === 'CRITICAL').length;

  const filteredIncidents = incidents.filter(i => {
    if (filterPriority !== 'all' && i.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Command Banner / Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CENTRAL SECURITY COMMAND // DEEKSHABHOOMI
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Operations Hub</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Real-Time Public Safety Operations Center
          </h1>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Emergency Broadcast</span>
          </button>
        </div>
      </div>

      {/* 1. TOP STATISTICS BAR (Section 10 Requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Active Incidents */}
        <div className={`p-4 rounded-xl border transition shadow-sm ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Incidents</span>
            <AlertTriangle className={`w-4 h-4 ${criticalIncidentsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">{activeIncidents.length}</span>
            {criticalIncidentsCount > 0 && (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                {criticalIncidentsCount} Critical
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">5 Resolved in last 1 hr</span>
        </div>

        {/* Missing Persons */}
        <div className={`p-4 rounded-xl border transition shadow-sm ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Missing Persons</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">{activeMissingCount}</span>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              Active Cases
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">1 Possible AI Match pending</span>
        </div>

        {/* Active Responders */}
        <div className={`p-4 rounded-xl border transition shadow-sm ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Responders</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">{availableRespondersCount} / {responders.length}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Available
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Police, Vols & Medics</span>
        </div>

        {/* Critical Zones */}
        <div className={`p-4 rounded-xl border transition shadow-sm ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Crowd Risk</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">{criticalZonesCount}</span>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              Critical Surge
            </span>
          </div>
          <span className="text-[10px] text-amber-400 mt-1 block truncate">Exit B (87% Density)</span>
        </div>

        {/* Active Alerts */}
        <div className={`p-4 rounded-xl border transition shadow-sm ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Live Alerts</span>
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">{alerts.length}</span>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
              Dispatched
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Across mobile devices</span>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-bold rounded-lg transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-4 h-4" /> Live Command Overview
        </button>

        <button
          onClick={() => setActiveTab('crowd')}
          className={`px-4 py-2.5 font-bold rounded-lg transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'crowd'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" /> AI Crowd Monitoring & YOLO (Step 4-5)
          {criticalZonesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('missing')}
          className={`px-4 py-2.5 font-bold rounded-lg transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'missing'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Missing Persons & AI Biometrics (Step 1-3, 10)
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 font-bold rounded-lg transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'broadcast'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4" /> Broadcast History & Console (Step 6)
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 font-bold rounded-lg transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Operations Analytics
        </button>
      </div>

      {/* 3. TAB VIEWS */}
      
      {/* OVERVIEW TAB: Live Map + Incident Triage Feed */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Tactical Map */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-400" /> Interactive Tactical Grid (Deekshabhoomi, Nagpur)
              </span>
              <span className="text-slate-400">Click any marker to inspect & dispatch</span>
            </div>
            <SecurityMap 
              height="440px" 
              selectedIncidentId={selectedIncident?.id}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          </div>

          {/* Incident Feed & Triage Table */}
          <div className={`rounded-xl border p-4 shadow-sm ${
            darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Live Incident Dispatch Feed
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time incoming reports from citizens, volunteers, and officers (No page refresh needed)
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={`p-1.5 rounded-lg border text-xs outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                >
                  <option value="all">All Priorities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`p-1.5 rounded-lg border text-xs outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="REPORTED">Reported</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="RESPONDING">Responding</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {/* Incident Cards / Rows */}
            <div className="space-y-3">
              {filteredIncidents.map(inc => {
                const isCrit = inc.priority === 'CRITICAL';
                const isHigh = inc.priority === 'HIGH';
                const isResolved = inc.status === 'RESOLVED';

                return (
                  <div 
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer ${
                      selectedIncident?.id === inc.id
                        ? 'border-blue-500 ring-1 ring-blue-500/40 bg-slate-800/90'
                        : isResolved 
                        ? 'bg-slate-900/30 border-slate-800/50 opacity-70'
                        : darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Left: Category, ID, Desc */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-400">{inc.id}</span>
                          <span className="font-bold text-sm text-white">{inc.category}</span>
                          
                          {/* Priority Selector / Badge */}
                          <select
                            value={inc.priority}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateIncidentPriority(inc.id, e.target.value as IncidentPriority)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer outline-none ${
                              isCrit ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                              isHigh ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                              'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <option value="CRITICAL">CRITICAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                          </select>

                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            inc.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            inc.status === 'RESPONDING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
                            inc.status === 'ASSIGNED' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {inc.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-1">{inc.description}</p>
                        
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {inc.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {inc.createdAt}
                          </span>
                          <span>Reporter: <strong className="text-slate-300">{inc.reporterName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Dispatch / Status Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Responder Assignment Select */}
                      <div className="text-right">
                        <select
                          value={inc.assignedResponderId || ''}
                          onChange={(e) => {
                            if (e.target.value) assignResponder(inc.id, e.target.value);
                          }}
                          className={`p-2 rounded-lg border text-xs outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                          }`}
                        >
                          <option value="">{inc.assignedResponderName ? `Assigned: ${inc.assignedResponderName}` : 'Assign Responder...'}</option>
                          {responders.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.role} - {r.availability})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Next Button */}
                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={() => {
                            const nextStatus: IncidentStatus = 
                              inc.status === 'REPORTED' ? 'ACKNOWLEDGED' :
                              inc.status === 'ACKNOWLEDGED' ? 'RESPONDING' :
                              inc.status === 'ASSIGNED' ? 'RESPONDING' : 'RESOLVED';
                            updateIncidentStatus(inc.id, nextStatus);
                          }}
                          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                        >
                          <span>Advance</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={() => updateIncidentStatus(inc.id, 'RESOLVED')}
                          className="px-3 py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/40 transition"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CROWD MONITORING TAB */}
      {activeTab === 'crowd' && (
        <AICrowdMonitor />
      )}

      {/* MISSING PERSONS & AI BIOMETRICS TAB */}
      {activeTab === 'missing' && (
        <AIMissingPersonMatcher />
      )}

      {/* BROADCAST CONSOLE TAB */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-500 animate-pulse" /> Emergency Broadcast Logs & Transmit Station
              </h3>
              <p className="text-xs text-slate-400">
                Pushes push alerts to citizen apps, digital signages, and responder terminals
              </p>
            </div>
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <Radio className="w-4 h-4" /> Create New Broadcast
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  alert.type === 'CRITICAL' ? 'bg-rose-950/20 border-rose-500/40' :
                  alert.type === 'WARNING' ? 'bg-amber-950/20 border-amber-500/40' :
                  'bg-blue-950/20 border-blue-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                      alert.type === 'CRITICAL' ? 'bg-rose-600 text-white' :
                      alert.type === 'WARNING' ? 'bg-amber-500 text-slate-950' :
                      'bg-blue-600 text-white'
                    }`}>
                      {alert.type}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{alert.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{alert.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target Zone: <strong className="text-slate-200">{alert.targetZone}</strong></span>
                  <span className="capitalize">Audience: {alert.targetRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Resolution Metrics */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Response Efficiency
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Average Dispatch Time</span>
                    <span className="font-mono font-bold text-emerald-400">1.8 minutes</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[85%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Average Resolution Time</span>
                    <span className="font-mono font-bold text-blue-400">7.4 minutes</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[72%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Case Clearance Rate</span>
                    <span className="font-mono font-bold text-purple-400">88.5%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[88%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Incidents by Category */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h4 className="font-bold text-sm text-white mb-3">Incidents by Category</h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Crowd Congestion', count: 4, pct: 40, color: 'bg-rose-500' },
                  { name: 'Medical Emergency', count: 3, pct: 30, color: 'bg-amber-500' },
                  { name: 'Missing Persons', count: 2, pct: 20, color: 'bg-blue-500' },
                  { name: 'Theft / Snatching', count: 1, pct: 10, color: 'bg-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{item.name}</span>
                      <span className="font-mono">{item.count} cases</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Footfall Heat Index */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h4 className="font-bold text-sm text-white mb-3">Zone Footfall & Density Index</h4>
              <div className="space-y-2.5 text-xs">
                {crowdZones.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between">
                    <span className="text-slate-300 truncate max-w-[120px]">{zone.zoneName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{zone.crowdCount} / {zone.capacity}</span>
                      <span className={`font-mono font-bold w-10 text-right ${
                        zone.density >= 80 ? 'text-rose-400' : zone.density >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {zone.density}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Emergency Broadcast Modal */}
      <EmergencyBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </div>
  );
};
