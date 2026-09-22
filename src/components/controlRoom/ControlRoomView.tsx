import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SecurityMap } from '../common/SecurityMap';
import { AIMissingPersonMatcher } from './AIMissingPersonMatcher';
import { AICrowdMonitor } from './AICrowdMonitor';
import { EmergencyBroadcastModal } from './EmergencyBroadcastModal';
import { DatabaseManagerView } from './DatabaseManagerView';
import { CurrentChallengeCard } from '../challenges/CurrentChallengeCard';
import { Incident, MissingPerson, IncidentPriority, IncidentStatus } from '../../types';
import { 
  Radio, CheckCircle2, X, ChevronRight, 
  Search, Sparkles, ShieldAlert, UserCheck, Shield
} from 'lucide-react';

export const ControlRoomView: React.FC = () => {
  const { 
    incidents, 
    missingPersons, 
    responders, 
    crowdZones, 
    alerts,
    updateIncidentStatus,
    updateIncidentPriority,
    assignResponder,
    approveCrowdRecommendation,
    broadcastAlert,
    navigateTo,
    darkMode 
  } = useApp();

  // 8 Tabs: Overview, Live Map, Cases, Crowd, Responders, Broadcast, Analytics, Database
  const [activeNav, setActiveNav] = useState<'overview' | 'map' | 'cases' | 'crowd' | 'responders' | 'broadcast' | 'analytics' | 'database'>('overview');
  const [selectedCase, setSelectedCase] = useState<{ type: 'incident' | 'missing'; data: Incident | MissingPerson } | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Cases tab state
  const [caseFilterType, setCaseFilterType] = useState<'all' | 'incidents' | 'missing'>('all');
  const [caseStatusFilter, setCaseStatusFilter] = useState<string>('all');
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [assigneeModalIncident, setAssigneeModalIncident] = useState<Incident | null>(null);

  // Inline Broadcast tab state (Section 16: Select Zone -> Write Message -> Preview -> Broadcast)
  const [broadcastZone, setBroadcastZone] = useState('Exit B (East)');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'citizens' | 'volunteers' | 'police'>('all');
  const [broadcastPriority, setBroadcastPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('CRITICAL');
  const [broadcastTitle, setBroadcastTitle] = useState('⚠️ CROWD DIVERSION: EXIT B');
  const [broadcastMessage, setBroadcastMessage] = useState('Exit B has reached 87% density. Please divert calmly towards Exit C.');
  const [broadcastSentSuccess, setBroadcastSentSuccess] = useState(false);

  // Key metrics
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const activeMissing = missingPersons.filter(m => m.status !== 'CLOSED');
  const criticalZones = crowdZones.filter(z => z.riskLevel === 'CRITICAL');
  const availableResponders = responders.filter(r => r.availability === 'available');

  // Critical crowd surge zone (Exit B surge)
  const surgeZone = crowdZones.find(z => z.riskLevel === 'CRITICAL' && !z.alertIssued);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    broadcastAlert({
      type: broadcastPriority === 'CRITICAL' ? 'CRITICAL' : broadcastPriority === 'HIGH' ? 'WARNING' : 'INFO',
      title: broadcastTitle,
      message: broadcastMessage,
      targetZone: broadcastZone,
      targetRole: broadcastTarget,
      priority: broadcastPriority,
      createdBy: 'Central Security Control Room'
    });

    setBroadcastSentSuccess(true);
    setTimeout(() => setBroadcastSentSuccess(false), 3000);
  };

  // Filtered cases
  const filteredIncidents = incidents.filter(inc => {
    if (caseFilterType === 'missing') return false;
    if (caseStatusFilter !== 'all' && inc.status !== caseStatusFilter) return false;
    if (caseSearchQuery.trim()) {
      const q = caseSearchQuery.toLowerCase();
      return inc.category.toLowerCase().includes(q) || 
             inc.location.toLowerCase().includes(q) || 
             inc.id.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredMissing = missingPersons.filter(m => {
    if (caseFilterType === 'incidents') return false;
    if (caseStatusFilter !== 'all' && m.status !== caseStatusFilter) return false;
    if (caseSearchQuery.trim()) {
      const q = caseSearchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || 
             m.lastSeenLocation.toLowerCase().includes(q) || 
             m.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Navigation for Control Room (Section 34: Overview, Live Map, Cases, Crowd, Responders, Broadcast, Analytics) */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3 sm:gap-6 text-xs font-medium overflow-x-auto pb-1">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'map', label: 'Live Map' },
            { id: 'cases', label: `Cases (${activeIncidents.length + activeMissing.length})` },
            { id: 'crowd', label: 'Crowd AI' },
            { id: 'responders', label: `Responders (${availableResponders.length}/${responders.length})` },
            { id: 'broadcast', label: 'Broadcast' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'database', label: 'Database (IndexedDB)' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id)}
              className={`whitespace-nowrap transition pb-1 ${
                activeNav === tab.id 
                  ? `${darkMode ? 'text-white border-b-2 border-blue-500 font-semibold' : 'text-slate-900 border-b-2 border-blue-600 font-semibold'}` 
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('challenges')}
            className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security Challenges</span>
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Emergency Broadcast</span>
          </button>
        </div>
      </div>

      {/* CURRENT CHALLENGE INTEGRATION CARD (Competition Evaluation) */}
      <CurrentChallengeCard onNavigateToChallenges={() => navigateTo('challenges')} />

      {/* CRITICAL SURGE ALERT BANNER (Exit B 87% crowd surge notification with 1-click diversion) */}
      {surgeZone && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[11px] font-mono font-semibold text-rose-500 uppercase tracking-wider">
                ⚠️ CRITICAL CROWD RISK DETECTED
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {surgeZone.zoneName} density has surged to {surgeZone.density}% ({surgeZone.trend}).
            </h3>
            <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Recommended Action: Divert attendees towards Exit C (South Egress).
            </p>
          </div>

          <button
            onClick={() => approveCrowdRecommendation(surgeZone.id)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition whitespace-nowrap self-start sm:self-auto shadow-sm"
          >
            Approve & Broadcast Diversion
          </button>
        </div>
      )}

      {/* ESSENTIAL STATS ROW (Minimal, Clean, Intelligent) */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs ${
        darkMode ? 'text-slate-400' : 'text-slate-600'
      }`}>
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className="block text-[11px] font-medium">Active Incidents</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white">
              {activeIncidents.length}
            </span>
            <span className="text-[11px] font-mono text-rose-500">
              {incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length} Critical
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className="block text-[11px] font-medium">Missing Persons</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-blue-500">
              {activeMissing.length}
            </span>
            <span className="text-[11px] font-mono text-amber-500">
              {missingPersons.filter(m => m.status === 'POSSIBLE MATCH').length} Potential Matches
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className="block text-[11px] font-medium">Critical Zones</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-rose-500">
              {criticalZones.length}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              of {crowdZones.length} Monitored
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className="block text-[11px] font-medium">Responders On Duty</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-emerald-500">
              {availableResponders.length} / {responders.length}
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* 1. OVERVIEW VIEW (Map-First Command Center with Compact Stream) */}
      {activeNav === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Central Live Tactical Map */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border shadow-sm border-slate-800 bg-slate-950">
            <SecurityMap 
              height="560px"
              onSelectIncident={(inc) => setSelectedCase({ type: 'incident', data: inc })}
              onSelectMissing={(m) => setSelectedCase({ type: 'missing', data: m })}
            />
          </div>

          {/* Compact Incident Stream */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Incident Stream
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {/* Missing Persons at the top */}
              {activeMissing.map(person => (
                <div 
                  key={person.id}
                  onClick={() => setSelectedCase({ type: 'missing', data: person })}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                    darkMode 
                      ? 'bg-slate-900/50 border-slate-800 hover:border-blue-500/40' 
                      : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-blue-500 uppercase tracking-wider">
                      MISSING PERSON • {person.id}
                    </span>
                    <span className={`text-[10px] font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {person.lastSeenTime}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {person.name} ({person.age}y)
                  </h4>

                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Last seen: {person.lastSeenLocation}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                    <span className="text-[11px] text-blue-500 font-medium">
                      Status: {person.status}
                    </span>
                    <button className="text-xs font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
                      <span>View Case</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Incidents */}
              {activeIncidents.map(inc => {
                const isCrit = inc.priority === 'CRITICAL';

                return (
                  <div 
                    key={inc.id}
                    onClick={() => setSelectedCase({ type: 'incident', data: inc })}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                      isCrit 
                        ? 'border-rose-500/30 bg-rose-500/5' 
                        : darkMode 
                        ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        isCrit ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        {inc.priority} • {inc.id}
                      </span>
                      <span className={`text-[10px] font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {inc.createdAt}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {inc.category}
                    </h4>

                    <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {inc.location}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-400">
                        {inc.status} {inc.assignedResponderName ? `• ${inc.assignedResponderName}` : ''}
                      </span>
                      <button className="text-xs font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
                        <span>View Case</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. FULL LIVE MAP VIEW */}
      {activeNav === 'map' && (
        <div className="rounded-2xl overflow-hidden border shadow-sm border-slate-800 bg-slate-950">
          <SecurityMap 
            height="700px"
            onSelectIncident={(inc) => setSelectedCase({ type: 'incident', data: inc })}
            onSelectMissing={(m) => setSelectedCase({ type: 'missing', data: m })}
          />
        </div>
      )}

      {/* 3. CASES VIEW (Unified Incidents & Missing Persons + Status Controls) */}
      {activeNav === 'cases' && (
        <div className="space-y-6">
          {/* Top Controls: Filter & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCaseFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  caseFilterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Cases ({incidents.length + missingPersons.length})
              </button>
              <button
                onClick={() => setCaseFilterType('incidents')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  caseFilterType === 'incidents' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Incidents ({incidents.length})
              </button>
              <button
                onClick={() => setCaseFilterType('missing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  caseFilterType === 'missing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Missing Persons ({missingPersons.length})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search case ID, zone, category..."
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <select
                value={caseStatusFilter}
                onChange={(e) => setCaseStatusFilter(e.target.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs border outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="REPORTED">REPORTED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="RESPONDING">RESPONDING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="SEARCHING">SEARCHING</option>
                <option value="POSSIBLE MATCH">POSSIBLE MATCH</option>
              </select>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Person Cases */}
            {filteredMissing.map(person => (
              <div 
                key={person.id}
                className={`p-5 rounded-2xl border space-y-3 transition ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-blue-500">{person.id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    person.status === 'FOUND' ? 'bg-emerald-500/20 text-emerald-400' :
                    person.status === 'POSSIBLE MATCH' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {person.status}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img 
                    src={person.photo} 
                    alt={person.name} 
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" 
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {person.name} ({person.age}y, {person.gender})
                    </h4>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Last seen: {person.lastSeenLocation} • {person.lastSeenTime}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Clothing: {person.clothing}
                    </p>
                  </div>
                </div>

                {person.aiMatchConfidence && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between">
                    <span className="font-mono text-amber-400 font-medium">
                      🎯 AI Biometric Candidate: {person.aiMatchConfidence}% Match
                    </span>
                    <button
                      onClick={() => setActiveNav('cases')}
                      className="text-[11px] text-amber-300 underline font-medium"
                    >
                      Verify
                    </button>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Reporter: {person.reporterName}</span>
                  <button
                    onClick={() => setSelectedCase({ type: 'missing', data: person })}
                    className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
                  >
                    Manage Case <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Incident Cases */}
            {filteredIncidents.map(inc => {
              const isCrit = inc.priority === 'CRITICAL';

              return (
                <div 
                  key={inc.id}
                  className={`p-5 rounded-2xl border space-y-3 transition ${
                    isCrit 
                      ? 'border-rose-500/40 bg-rose-500/5' 
                      : darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-500">{inc.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inc.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        inc.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {inc.priority}
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={inc.status}
                      onChange={(e) => updateIncidentStatus(inc.id, e.target.value as IncidentStatus)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold outline-none ${
                        inc.status === 'RESOLVED' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="REPORTED">REPORTED</option>
                      <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="RESPONDING">RESPONDING</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {inc.category}
                    </h4>
                    <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {inc.description}
                    </p>
                    <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      📍 {inc.location} • Reported: {inc.createdAt}
                    </p>
                  </div>

                  {/* Priority and Dispatch Controls */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Responder:</span>
                      <select
                        value={inc.assignedResponderId || ''}
                        onChange={(e) => assignResponder(inc.id, e.target.value)}
                        className={`text-[11px] p-1 rounded border outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <option value="">-- Assign Unit --</option>
                        {responders.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.role}) - {r.availability}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => setSelectedCase({ type: 'incident', data: inc })}
                      className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Face Biometric Matcher Integration in Cases Tab */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  AI Facial Biometric Matching Module (Section 20)
                </h3>
                <p className="text-xs text-slate-400">
                  Automated surveillance correlation for missing persons with mandatory human verification
                </p>
              </div>
            </div>
            <AIMissingPersonMatcher />
          </div>
        </div>
      )}

      {/* 4. CROWD MONITORING SECTION (Sections 13, 14, 15) */}
      {activeNav === 'crowd' && (
        <div className="space-y-6">
          <AICrowdMonitor />
        </div>
      )}

      {/* 5. RESPONDERS ROSTER VIEW */}
      {activeNav === 'responders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <div>
              <h2 className="text-base font-semibold">Active Field Responders Roster</h2>
              <p className="text-xs text-slate-400">Nagpur City Police, Medical First Aid, and Youth Safety Volunteers</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {availableResponders.length} Available for Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responders.map(r => (
              <div 
                key={r.id} 
                className={`p-4 rounded-2xl border space-y-3 transition ${
                  darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl text-white ${
                      r.role === 'police' ? 'bg-blue-600' :
                      r.role === 'medical' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {r.role === 'police' ? <ShieldAlert className="w-4 h-4" /> :
                       r.role === 'medical' ? <span className="font-bold text-xs">+</span> :
                       <UserCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{r.name}</h4>
                      <p className="text-[11px] text-slate-400 uppercase font-mono">{r.role} • {r.badge || 'Field'}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    r.availability === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    r.availability === 'busy' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {r.availability}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl text-xs space-y-1 ${darkMode ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                  <div className="flex justify-between text-slate-400">
                    <span>Assigned Sector:</span>
                    <strong className="text-slate-200">{r.zone}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Coordinates:</span>
                    <span className="font-mono text-[10px]">{r.latitude.toFixed(4)}° N, {r.longitude.toFixed(4)}° E</span>
                  </div>
                  {r.currentAssignment && (
                    <div className="flex justify-between text-amber-400 pt-1 border-t border-slate-700/50 font-medium">
                      <span>Task:</span>
                      <span>Case {r.currentAssignment}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 font-mono text-[11px]">{r.phone}</span>
                  <button 
                    onClick={() => setActiveNav('map')}
                    className="text-blue-500 hover:text-blue-400 font-medium text-xs flex items-center gap-1"
                  >
                    Locate on Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BROADCAST CONSOLE VIEW (Section 16: Select Zone -> Write Message -> Preview -> Broadcast) */}
      {activeNav === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Console (7 cols) */}
          <div className={`lg:col-span-7 p-6 rounded-2xl border space-y-5 ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="border-b pb-3 border-slate-800">
              <h3 className="text-base font-semibold">Emergency Broadcast Workflow (Section 16)</h3>
              <p className="text-xs text-slate-400">Targeted real-time broadcast to event zones, citizens, volunteers, or police</p>
            </div>

            {broadcastSentSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Broadcast successfully transmitted to {broadcastZone} ({broadcastTarget.toUpperCase()})!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              {/* Step 1: Select Zone */}
              <div>
                <label className="font-semibold block mb-1">Step 1: Select Target Zone</label>
                <select
                  value={broadcastZone}
                  onChange={(e) => setBroadcastZone(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Entire Event">Entire Event (All Zones)</option>
                  {crowdZones.map(z => (
                    <option key={z.id} value={z.zoneName}>{z.zoneName} ({z.density}% Density)</option>
                  ))}
                </select>
              </div>

              {/* Target Audience & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Target Audience</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as 'all' | 'citizens' | 'volunteers' | 'police')}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone (All Attendees & Units)</option>
                    <option value="citizens">Citizens Only</option>
                    <option value="volunteers">Volunteers Only</option>
                    <option value="police">Police / Security Only</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Priority Level</label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as 'CRITICAL' | 'HIGH' | 'NORMAL')}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Audible Siren)</option>
                    <option value="HIGH">🟠 HIGH (Urgent Advisory)</option>
                    <option value="NORMAL">🔵 NORMAL (Informational)</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Write Message */}
              <div className="space-y-3">
                <div>
                  <label className="font-semibold block mb-1">Step 2: Alert Headline</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Alert Message</label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none leading-relaxed ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Step 3: Preview Box */}
              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1">
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                  Step 3: Preview Broadcast Notification
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{broadcastTitle}</h4>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{broadcastMessage}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Zone: {broadcastZone} • Audience: {broadcastTarget.toUpperCase()} • Priority: {broadcastPriority}
                </p>
              </div>

              {/* Step 4: Broadcast Action */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Radio className="w-4 h-4" />
                <span>Step 4: Transmit Live Emergency Broadcast</span>
              </button>
            </form>
          </div>

          {/* Broadcast History Feed (5 cols) */}
          <div className={`lg:col-span-5 p-5 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="border-b pb-2.5 border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold">Broadcast History</h3>
              <span className="text-xs font-mono text-slate-400">{alerts.length} Total</span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {alerts.map(a => (
                <div 
                  key={a.id} 
                  className={`p-3.5 rounded-xl border space-y-1 text-xs ${
                    a.type === 'CRITICAL' ? 'border-rose-500/40 bg-rose-500/5' :
                    darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono font-bold text-blue-400">{a.targetZone}</span>
                    <span className="text-slate-400 font-mono">{a.createdAt}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{a.title}</h4>
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{a.message}</p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/50 flex justify-between">
                    <span>Target: {a.targetRole.toUpperCase()}</span>
                    <span>By: {a.createdBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. ANALYTICS VIEW (Section 24: Clean charts, Incidents by Category, Zone, Response Time, Recovery Rate) */}
      {activeNav === 'analytics' && (
        <div className="space-y-6">
          <div className="border-b pb-3 border-slate-800">
            <h2 className="text-base font-semibold">Safety & Response Analytics</h2>
            <p className="text-xs text-slate-400">Aggregated operational metrics for Deekshabhoomi Annual Gathering</p>
          </div>

          {/* 4 Core KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs text-slate-400">Average Response Time</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-500">3.4 min</span>
                <span className="text-[10px] text-emerald-400">-42s vs baseline</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs text-slate-400">Resolution Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-blue-500">92.8%</span>
                <span className="text-[10px] text-blue-400">High efficiency</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs text-slate-400">Peak Crowd Density</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-rose-500">87%</span>
                <span className="text-[10px] text-rose-400">Exit B Egress</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs text-slate-400">Missing Persons Found</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-purple-500">100%</span>
                <span className="text-[10px] text-purple-400">All cases tracked</span>
              </div>
            </div>
          </div>

          {/* Incidents by Category & Zone Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incidents by Category */}
            <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-semibold">Incidents by Category</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { cat: 'Chain Snatching', count: 3, pct: 30, color: 'bg-amber-500' },
                  { cat: 'Medical Emergency', count: 2, pct: 20, color: 'bg-rose-500' },
                  { cat: 'Suspicious Activity', count: 2, pct: 20, color: 'bg-blue-500' },
                  { cat: 'Crowd Emergency', count: 1, pct: 15, color: 'bg-purple-500' },
                  { cat: 'Harassment', count: 1, pct: 15, color: 'bg-orange-500' }
                ].map(item => (
                  <div key={item.cat} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{item.cat}</span>
                      <span className="font-mono text-slate-400">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incidents by Zone */}
            <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-semibold">Density & Incident Heat by Zone</h3>
              <div className="space-y-2.5 text-xs">
                {crowdZones.map(z => (
                  <div key={z.id} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{z.zoneName}</span>
                      <span className="font-mono font-medium">{z.density}% Density • {z.riskLevel}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          z.riskLevel === 'CRITICAL' ? 'bg-rose-500' :
                          z.riskLevel === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${z.density}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. DATABASE & STORAGE MANAGEMENT VIEW (Section 26 Governance) */}
      {activeNav === 'database' && (
        <DatabaseManagerView />
      )}

      {/* Case Detail Popover Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold uppercase text-blue-500">
                {selectedCase.type === 'incident' ? 'Incident Case File' : 'Missing Person Case File'}
              </span>
              <button 
                onClick={() => setSelectedCase(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedCase.type === 'incident' && (() => {
              const inc = selectedCase.data as Incident;
              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{inc.category}</h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                        {inc.id}
                      </span>
                    </div>
                    <p className={`mt-1.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {inc.description}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl space-y-2 ${darkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium">{inc.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Priority:</span>
                      <span className={`font-bold ${inc.priority === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`}>
                        {inc.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-medium text-blue-400">{inc.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reporter:</span>
                      <span>{inc.reporterName} {inc.reporterPhone ? `(${inc.reporterPhone})` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Unit:</span>
                      <span className="font-medium">{inc.assignedResponderName || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-semibold block">Update Status:</span>
                    <div className="flex gap-2 flex-wrap">
                      {(['REPORTED', 'ACKNOWLEDGED', 'ASSIGNED', 'RESPONDING', 'RESOLVED'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => {
                            updateIncidentStatus(inc.id, st);
                            setSelectedCase({ type: 'incident', data: { ...inc, status: st } });
                          }}
                          className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition ${
                            inc.status === st 
                              ? 'bg-blue-600 text-white' 
                              : darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}

            {selectedCase.type === 'missing' && (() => {
              const person = selectedCase.data as MissingPerson;
              return (
                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <img 
                      src={person.photo} 
                      alt={person.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0" 
                    />
                    <div>
                      <h3 className="text-lg font-bold">{person.name} ({person.age}y, {person.gender})</h3>
                      <p className="text-blue-400 font-mono text-xs font-medium">Case ID: {person.id}</p>
                      <p className="text-slate-400 mt-1">Last seen: {person.lastSeenLocation} • {person.lastSeenTime}</p>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl space-y-2 ${darkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clothing:</span>
                      <span>{person.clothing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Identifying Features:</span>
                      <span>{person.identifyingFeatures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reporter Contact:</span>
                      <span className="font-mono text-emerald-400">{person.emergencyContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-bold text-blue-400">{person.status}</span>
                    </div>
                  </div>

                  {person.aiMatchConfidence && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <span className="font-bold text-amber-400 block">Biometric Camera Match (91% Confidence)</span>
                      <p className="text-slate-300">Detected on CCTV #04 at Exit B. Field verification is required.</p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Emergency Broadcast Modal */}
      <EmergencyBroadcastModal 
        isOpen={isBroadcastModalOpen} 
        onClose={() => setIsBroadcastModalOpen(false)} 
        defaultZone={surgeZone ? surgeZone.zoneName : 'Entire Event'}
      />

    </div>
  );
};
