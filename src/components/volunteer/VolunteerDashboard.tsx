import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SecurityMap } from '../common/SecurityMap';
import { Incident, MissingPerson, IncidentStatus } from '../../types';
import { 
  UserCheck, ShieldAlert, Users, Radio, MapPin, 
  Clock, CheckCircle2, ChevronRight, AlertTriangle, 
  Activity, PhoneCall, HeartHandshake, Eye, Check, Navigation, Shield
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { 
    currentUser, 
    incidents, 
    missingPersons, 
    crowdZones, 
    alerts,
    updateIncidentStatus,
    responders,
    updateResponderStatus,
    darkMode 
  } = useApp();

  // Section 34: Dashboard, Nearby, Assignments, Map, Profile
  const [activeTab, setActiveTab] = useState<'dashboard' | 'nearby' | 'assignments' | 'map' | 'profile'>('dashboard');
  const [volunteerStatus, setVolunteerStatus] = useState<'available' | 'busy' | 'offline'>('available');

  const myResponder = responders.find(r => r.userId === currentUser.id) || responders.find(r => r.role === 'volunteer');

  const handleStatusToggle = (newStatus: 'available' | 'busy' | 'offline') => {
    setVolunteerStatus(newStatus);
    if (myResponder) {
      updateResponderStatus(myResponder.id, newStatus);
    }
  };

  const handleAdvanceIncident = (inc: Incident, targetStatus: IncidentStatus) => {
    updateIncidentStatus(inc.id, targetStatus, myResponder?.id);
  };

  // Prioritized nearby incidents and missing persons
  const nearbyIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const myAssignments = incidents.filter(i => i.assignedResponderId === myResponder?.id && i.status !== 'RESOLVED');
  const activeMissing = missingPersons.filter(m => m.status !== 'CLOSED');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Volunteer Profile Header & Duty Status Toggle */}
      <div className={`p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                {currentUser.badgeNumber || 'VOL-042'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Nagpur Youth Safety Corps • Sector: <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                {currentUser.currentLocation?.zoneName || 'Exit B (East)'}
              </strong>
            </p>
          </div>
        </div>

        {/* Live Availability Toggle */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Duty Status:</span>
          <div className={`flex items-center p-1 rounded-xl border text-xs ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => handleStatusToggle('available')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                volunteerStatus === 'available' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => handleStatusToggle('busy')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                volunteerStatus === 'busy' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              On Scene
            </button>
            <button
              onClick={() => handleStatusToggle('offline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                volunteerStatus === 'offline' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Advisory Banner (if any) */}
      {alerts.length > 0 && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          alerts[0].type === 'CRITICAL' 
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' 
            : 'bg-purple-950/30 border-purple-500/40 text-purple-300'
        }`}>
          <Radio className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] block">
              Active Advisory: {alerts[0].title}
            </span>
            <p className="mt-0.5">{alerts[0].message}</p>
            <span className="text-[10px] opacity-75 font-mono">Target: {alerts[0].targetZone}</span>
          </div>
        </div>
      )}

      {/* Section 34 Tabs: Dashboard, Nearby, Assignments, Map, Profile */}
      <div className={`flex items-center gap-2 border-b pb-1 text-xs overflow-x-auto ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        {([
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'nearby', label: `Nearby (${nearbyIncidents.length + activeMissing.length})` },
          { id: 'assignments', label: `My Assignments (${myAssignments.length})` },
          { id: 'map', label: 'Sector Map' },
          { id: 'profile', label: 'Profile' }
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

      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400">Assigned Tasks</span>
              <p className="text-2xl font-bold text-blue-500 mt-1">{myAssignments.length}</p>
            </div>
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400">Nearby Lookouts</span>
              <p className="text-2xl font-bold text-amber-500 mt-1">{activeMissing.length}</p>
            </div>
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400">Sector Crowd Risk</span>
              <p className="text-2xl font-bold text-rose-500 mt-1">87%</p>
            </div>
          </div>

          {/* Missing Person Urgent Lookout Alert */}
          {activeMissing.length > 0 && (
            <div className="p-4 rounded-2xl border border-blue-500/40 bg-blue-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  HIGH-PRIORITY MISSING CHILD LOOKOUT
                </span>
                <span className="font-mono text-xs text-blue-400">{activeMissing[0].id}</span>
              </div>

              <div className="flex items-start gap-3">
                <img 
                  src={activeMissing[0].photo} 
                  alt={activeMissing[0].name} 
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" 
                />
                <div className="text-xs space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeMissing[0].name} ({activeMissing[0].age}y)
                  </h4>
                  <p className="text-slate-300">Clothing: {activeMissing[0].clothing}</p>
                  <p className="text-slate-400">Last seen: {activeMissing[0].lastSeenLocation} • {activeMissing[0].lastSeenTime}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-400">Emergency Desk: Help Booth #2 (Exit B)</span>
                <button
                  onClick={() => setActiveTab('nearby')}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
                >
                  View Full Lookout Details
                </button>
              </div>
            </div>
          )}

          {/* Active Sector Crowd Status */}
          <div className={`p-4 rounded-2xl border space-y-2 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exit B Egress Status</h3>
            <p className="text-xs text-slate-300">
              High compaction near turnstiles. Please guide attendees calmly towards Exit C promenade.
            </p>
          </div>
        </div>
      )}

      {/* 2. NEARBY INCIDENTS & MISSING PERSONS (Section 18: [Accept], [Responding], [On Scene], [Resolved]) */}
      {activeTab === 'nearby' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Sorted by proximity & priority</span>
            <span className="text-xs font-semibold text-blue-400">Your Location: Exit B Corridor</span>
          </div>

          {/* Missing Person Lookouts first */}
          {activeMissing.map(m => (
            <div 
              key={m.id}
              className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-3 text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-blue-400 uppercase tracking-wider">
                  🔵 MISSING PERSON LOOKOUT • {m.id}
                </span>
                <span className="font-mono text-slate-400">{m.lastSeenTime}</span>
              </div>

              <div className="flex items-start gap-3">
                <img src={m.photo} alt={m.name} className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">{m.name} ({m.age}y, {m.gender})</h4>
                  <p className="text-slate-300"><strong>Clothing:</strong> {m.clothing}</p>
                  <p className="text-slate-300"><strong>Features:</strong> {m.identifyingFeatures}</p>
                  <p className="text-slate-400"><strong>Last Seen:</strong> {m.lastSeenLocation} (~40m from you)</p>
                </div>
              </div>
            </div>
          ))}

          {/* Nearby Incidents */}
          {nearbyIncidents.map(inc => {
            const isAssignedToMe = inc.assignedResponderId === myResponder?.id;

            return (
              <div 
                key={inc.id}
                className={`p-4 rounded-2xl border space-y-3 text-xs ${
                  inc.priority === 'CRITICAL' ? 'border-rose-500/40 bg-rose-500/5' :
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400">{inc.id}</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{inc.category}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inc.priority}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-blue-400">{inc.status}</span>
                </div>

                <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {inc.description}
                </p>

                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                  <span>📍 {inc.location} (~80m away)</span>
                  <span>Reported: {inc.createdAt}</span>
                </div>

                {/* Response Lifecycle Actions (Section 18) */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex gap-2">
                    {inc.status === 'REPORTED' && (
                      <button
                        onClick={() => handleAdvanceIncident(inc, 'ASSIGNED')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
                      >
                        [ Accept ]
                      </button>
                    )}

                    {inc.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleAdvanceIncident(inc, 'RESPONDING')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition"
                      >
                        [ Responding ]
                      </button>
                    )}

                    {inc.status === 'RESPONDING' && (
                      <button
                        onClick={() => handleAdvanceIncident(inc, 'RESOLVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                      >
                        [ Mark Resolved ]
                      </button>
                    )}

                    {inc.status === 'RESOLVED' && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Resolved
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    GPS Coordinates linked to Command HQ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MY ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="border-b pb-3 border-slate-800">
            <h2 className="text-base font-semibold">Your Active Assignments</h2>
            <p className="text-xs text-slate-400">Tasks specifically assigned to your callsign ({currentUser.badgeNumber})</p>
          </div>

          {myAssignments.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center text-xs space-y-1.5 ${
              darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-semibold">No pending assigned incidents.</p>
              <p>You can accept any nearby incident from the 'Nearby' tab.</p>
            </div>
          ) : (
            myAssignments.map(inc => (
              <div 
                key={inc.id}
                className="p-5 rounded-2xl border border-blue-500/40 bg-blue-500/5 space-y-3 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">{inc.category} ({inc.id})</span>
                  <span className="font-mono text-blue-400 font-bold">{inc.status}</span>
                </div>
                <p className="text-slate-300">{inc.description}</p>
                <p className="text-slate-400">Location: {inc.location}</p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleAdvanceIncident(inc, 'RESOLVED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    [ Mark Case Resolved ]
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. SECTOR TACTICAL MAP */}
      {activeTab === 'map' && (
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-sm bg-slate-950">
          <SecurityMap height="500px" />
        </div>
      )}

      {/* 5. PROFILE */}
      {activeTab === 'profile' && (
        <div className={`p-5 rounded-2xl border space-y-4 text-xs ${
          darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-sm font-semibold">Volunteer Marshal Credentials</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Badge ID:</strong> {currentUser.badgeNumber || 'VOL-042'}</p>
            <p><strong>Organization:</strong> Nagpur Youth Safety Corps</p>
            <p><strong>Radio Callsign:</strong> CORPS-UNIT-42</p>
            <p><strong>Sector:</strong> Exit B / East Pedestrian Egress</p>
          </div>
        </div>
      )}

    </div>
  );
};
