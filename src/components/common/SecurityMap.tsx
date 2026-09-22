import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident, MissingPerson, Responder, CrowdZone } from '../../types';
import { 
  ShieldAlert, AlertTriangle, UserCheck, Users, Radio, 
  MapPin, Eye, Filter, RefreshCw, ZoomIn, ZoomOut, Compass
} from 'lucide-react';

interface SecurityMapProps {
  height?: string;
  selectedIncidentId?: string | null;
  selectedMissingId?: string | null;
  onSelectIncident?: (incident: Incident) => void;
  onSelectMissing?: (person: MissingPerson) => void;
}

export const SecurityMap: React.FC<SecurityMapProps> = ({
  height = '500px',
  selectedIncidentId,
  selectedMissingId,
  onSelectIncident,
  onSelectMissing
}) => {
  const { 
    incidents, 
    missingPersons, 
    responders, 
    crowdZones, 
    darkMode,
    assignResponder 
  } = useApp();

  // Filters
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [filterIncidents, setFilterIncidents] = useState(true);
  const [filterMissing, setFilterMissing] = useState(true);
  const [filterResponders, setFilterResponders] = useState(true);
  const [filterZones, setFilterZones] = useState(true);

  // Selected item detail popover
  const [activeItem, setActiveItem] = useState<{
    type: 'incident' | 'missing' | 'responder' | 'zone';
    data: Incident | MissingPerson | Responder | CrowdZone;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Coordinates bounding box for Deekshabhoomi, Nagpur
  // Center: 21.1278, 79.0669
  const bounds = {
    minLat: 21.1245,
    maxLat: 21.1310,
    minLng: 79.0635,
    maxLng: 79.0705
  };

  // Convert lat/lng to percentage on container
  const getCoordinatesPct = (lat: number, lng: number) => {
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    // Clamping to visible canvas
    return {
      top: Math.max(8, Math.min(92, y)),
      left: Math.max(8, Math.min(92, x))
    };
  };

  // Sync selected incident or missing person
  useEffect(() => {
    if (selectedIncidentId) {
      const match = incidents.find(i => i.id === selectedIncidentId);
      if (match) setActiveItem({ type: 'incident', data: match });
    }
  }, [selectedIncidentId, incidents]);

  useEffect(() => {
    if (selectedMissingId) {
      const match = missingPersons.find(m => m.id === selectedMissingId);
      if (match) setActiveItem({ type: 'missing', data: match });
    }
  }, [selectedMissingId, missingPersons]);

  const filteredIncidents = incidents.filter(i => {
    if (!filterIncidents) return false;
    if (showCriticalOnly) return i.priority === 'CRITICAL';
    return true;
  });

  return (
    <div className={`relative rounded-xl overflow-hidden border shadow-sm flex flex-col ${
      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-200'
    }`} style={{ height }}>
      
      {/* Map Control Header / Filter Toolbar */}
      <div className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20 border-b backdrop-blur-md ${
        darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-800/95 border-slate-700 text-slate-200'
      }`}>
        <div className="flex items-center gap-2 font-medium">
          <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
          <span className="font-semibold text-white tracking-wide">DEEKSHABHOOMI TACTICAL GRID</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
            LIVE GPS FEED
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterIncidents(!filterIncidents)}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              filterIncidents 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-slate-800 text-slate-400 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            Incidents ({filteredIncidents.length})
          </button>

          <button
            onClick={() => setFilterMissing(!filterMissing)}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              filterMissing 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                : 'bg-slate-800 text-slate-400 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Missing ({missingPersons.filter(m => m.status !== 'CLOSED').length})
          </button>

          <button
            onClick={() => setFilterResponders(!filterResponders)}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              filterResponders 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Responders ({responders.length})
          </button>

          <button
            onClick={() => setFilterZones(!filterZones)}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              filterZones 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                : 'bg-slate-800 text-slate-400 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
            Zones ({crowdZones.length})
          </button>
        </div>

        {/* Zoom & Quick Actions */}
        <div className="flex items-center gap-1 text-slate-400">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.6))}
            title="Zoom In"
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
            title="Zoom Out"
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setZoomLevel(1); setActiveItem(null); }}
            title="Reset View"
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tactical Map Surface */}
      <div 
        ref={mapContainerRef}
        className="relative flex-1 w-full overflow-hidden select-none bg-slate-950"
      >
        {/* Tactical Grid Background Pattern */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `scale(${zoomLevel})`,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.25) 0%, transparent 70%),
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px'
          }}
        >
          {/* Stylized Architectural Footprint of Deekshabhoomi */}
          <div className="absolute top-[40%] left-[42%] w-[20%] h-[25%] rounded-full border border-blue-500/20 bg-blue-950/20 flex items-center justify-center pointer-events-none">
            <div className="w-[70%] h-[70%] rounded-full border border-dashed border-blue-400/30 flex items-center justify-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-blue-300/40 text-center font-bold">
                Central Stupa<br/>Monument
              </span>
            </div>
          </div>

          {/* Perimeter Pathways */}
          <div className="absolute top-[18%] left-[12%] right-[12%] bottom-[18%] border border-slate-800/80 rounded-3xl pointer-events-none" />
          <div className="absolute top-[28%] left-[22%] right-[22%] bottom-[28%] border border-dashed border-slate-800/60 rounded-2xl pointer-events-none" />

          {/* Compass Rose in Corner */}
          <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-500/60 flex flex-col items-center">
            <span>N ▲</span>
            <span>21.1278° N, 79.0669° E</span>
          </div>
        </div>

        {/* Interactive Map Transform Layer */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >

          {/* 1. CROWD ZONES (Color-Coded Heat Bubbles) */}
          {filterZones && crowdZones.map(zone => {
            const pos = getCoordinatesPct(zone.latitude, zone.longitude);
            const isCritical = zone.riskLevel === 'CRITICAL';
            const isModerate = zone.riskLevel === 'MODERATE';
            const bubbleColor = isCritical ? 'rgba(239, 68, 68, 0.25)' : isModerate ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.15)';
            const borderColor = isCritical ? 'rgba(239, 68, 68, 0.6)' : isModerate ? 'rgba(245, 158, 11, 0.5)' : 'rgba(34, 197, 94, 0.4)';

            return (
              <div
                key={zone.id}
                onClick={() => setActiveItem({ type: 'zone', data: zone })}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              >
                {/* Zone Aura */}
                <div 
                  className={`w-28 h-28 rounded-full transition-all duration-500 flex items-center justify-center ${
                    isCritical ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: bubbleColor,
                    border: `1.5px dashed ${borderColor}`
                  }}
                >
                  <div className="text-center px-1.5 py-0.5 rounded backdrop-blur-sm bg-slate-900/80 border border-slate-700/60 shadow-lg">
                    <p className="text-[10px] font-bold text-white tracking-wide truncate max-w-[90px]">{zone.zoneName}</p>
                    <p className={`text-[9px] font-mono font-bold ${
                      isCritical ? 'text-rose-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {zone.density}% Density
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 2. RESPONDERS (Green Patrol Markers) */}
          {filterResponders && responders.map(resp => {
            const pos = getCoordinatesPct(resp.latitude, resp.longitude);
            const isAvailable = resp.availability === 'available';

            return (
              <div
                key={resp.id}
                onClick={() => setActiveItem({ type: 'responder', data: resp })}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group hover:scale-125 transition-transform"
                title={`${resp.name} (${resp.role.toUpperCase()})`}
              >
                <div className={`p-1.5 rounded-full border-2 shadow-lg flex items-center justify-center ${
                  resp.role === 'police' 
                    ? 'bg-blue-600 border-white text-white' 
                    : resp.role === 'medical'
                    ? 'bg-emerald-600 border-white text-white'
                    : 'bg-amber-500 border-white text-white'
                }`}>
                  {resp.role === 'police' && <ShieldAlert className="w-3.5 h-3.5" />}
                  {resp.role === 'medical' && <span className="font-bold text-xs leading-none">+</span>}
                  {resp.role === 'volunteer' && <UserCheck className="w-3.5 h-3.5" />}
                </div>

                {/* Status Dot */}
                <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                  isAvailable ? 'bg-emerald-400' : 'bg-rose-400'
                }`} />

                {/* Hover Label */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none z-30">
                  {resp.name} ({resp.role})
                </div>
              </div>
            );
          })}

          {/* 3. MISSING PERSONS (Blue Target Markers) */}
          {filterMissing && missingPersons.filter(m => m.status !== 'CLOSED').map(person => {
            const pos = getCoordinatesPct(person.latitude, person.longitude);
            const isPossibleMatch = person.status === 'POSSIBLE MATCH';

            return (
              <div
                key={person.id}
                onClick={() => {
                  setActiveItem({ type: 'missing', data: person });
                  if (onSelectMissing) onSelectMissing(person);
                }}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-25 group hover:scale-125 transition-transform"
              >
                {/* Radar Ring */}
                <div className="absolute -inset-2 rounded-full border-2 border-blue-400 animate-ping opacity-60" />
                
                <div className={`relative w-8 h-8 rounded-full border-2 overflow-hidden shadow-xl ${
                  isPossibleMatch ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-blue-400 ring-2 ring-blue-500/40'
                }`}>
                  <img 
                    src={person.photo} 
                    alt={person.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Case Badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap border border-blue-400">
                  {person.name.split(' ')[0]} ({person.age}y)
                </div>
              </div>
            );
          })}

          {/* 4. INCIDENTS (Red / Amber Pulsing Markers) */}
          {filteredIncidents.map(inc => {
            const pos = getCoordinatesPct(inc.latitude, inc.longitude);
            const isCritical = inc.priority === 'CRITICAL';
            const isResolved = inc.status === 'RESOLVED';

            if (isResolved) return null;

            return (
              <div
                key={inc.id}
                onClick={() => {
                  setActiveItem({ type: 'incident', data: inc });
                  if (onSelectIncident) onSelectIncident(inc);
                }}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group hover:scale-125 transition-transform"
              >
                {/* Critical Ping Wave */}
                {isCritical && (
                  <div className="absolute -inset-3 rounded-full border-2 border-rose-500 animate-ping opacity-75" />
                )}

                <div className={`p-2 rounded-full shadow-2xl border-2 flex items-center justify-center text-white ${
                  isCritical 
                    ? 'bg-rose-600 border-rose-300 pulse-critical' 
                    : inc.priority === 'HIGH'
                    ? 'bg-amber-600 border-amber-300'
                    : 'bg-slate-700 border-slate-400'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>

                {/* Tooltip Label */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-rose-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-rose-400 uppercase">
                  {inc.category}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Inspector Overlay (Bottom-Right) */}
        {activeItem && (
          <div className={`absolute bottom-3 right-3 max-w-sm w-full p-4 rounded-xl border shadow-2xl backdrop-blur-md z-40 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            darkMode ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between gap-2 border-b pb-2 mb-2">
              <div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
                  activeItem.type === 'incident' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  activeItem.type === 'missing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  activeItem.type === 'zone' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {activeItem.type}
                </span>
                <h4 className="font-bold text-sm mt-1">
                  {activeItem.type === 'incident' && (activeItem.data as Incident).category}
                  {activeItem.type === 'missing' && (activeItem.data as MissingPerson).name}
                  {activeItem.type === 'responder' && (activeItem.data as Responder).name}
                  {activeItem.type === 'zone' && (activeItem.data as CrowdZone).zoneName}
                </h4>
              </div>
              <button 
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Incident Details */}
            {activeItem.type === 'incident' && (() => {
              const inc = activeItem.data as Incident;
              return (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300">{inc.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <div>
                      <span className="text-slate-400 block">Location:</span>
                      <span className="font-semibold text-white">{inc.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Priority:</span>
                      <span className={`font-bold ${inc.priority === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {inc.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Status:</span>
                      <span className="font-semibold text-blue-400">{inc.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Assigned:</span>
                      <span className="font-medium text-emerald-300">{inc.assignedResponderName || 'Unassigned'}</span>
                    </div>
                  </div>

                  {inc.status !== 'RESOLVED' && !inc.assignedResponderId && (
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Quick Dispatch:</span>
                      <button
                        onClick={() => {
                          const available = responders.find(r => r.availability === 'available');
                          if (available) assignResponder(inc.id, available.id);
                        }}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition flex items-center justify-center gap-1"
                      >
                        <Radio className="w-3.5 h-3.5" /> Dispatch Nearest
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Missing Person Details */}
            {activeItem.type === 'missing' && (() => {
              const person = activeItem.data as MissingPerson;
              return (
                <div className="space-y-2 text-xs">
                  <div className="flex gap-3">
                    <img src={person.photo} alt={person.name} className="w-16 h-16 rounded-lg object-cover border border-slate-700" />
                    <div>
                      <p className="font-semibold text-white">{person.name} ({person.age} yrs, {person.gender})</p>
                      <p className="text-slate-300 text-[11px]">Last Seen: <span className="font-medium text-white">{person.lastSeenLocation}</span> ({person.lastSeenTime})</p>
                      <p className="text-blue-400 text-[11px] font-mono">Case #{person.id}</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ${
                        person.status === 'POSSIBLE MATCH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {person.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <span className="text-slate-400 block">Clothing & Features:</span>
                    <p className="text-slate-200">{person.clothing}</p>
                    <p className="text-slate-300 italic mt-0.5">{person.identifyingFeatures}</p>
                  </div>
                </div>
              );
            })()}

            {/* Zone Details */}
            {activeItem.type === 'zone' && (() => {
              const zone = activeItem.data as CrowdZone;
              return (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300">{zone.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <div>
                      <span className="text-slate-400 block">Estimated Crowd:</span>
                      <span className="font-bold text-white">{zone.crowdCount.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Density:</span>
                      <span className={`font-bold ${zone.density >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {zone.density}% ({zone.riskLevel})
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Velocity Trend:</span>
                      <span className="font-medium text-amber-300">{zone.trend}</span>
                    </div>
                  </div>
                  {zone.recommendedAction && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                      <strong>AI Recommendation:</strong> {zone.recommendedAction}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Responder Details */}
            {activeItem.type === 'responder' && (() => {
              const resp = activeItem.data as Responder;
              return (
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] bg-slate-800/60 p-2 rounded border border-slate-700/50 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span className="font-semibold text-white uppercase">{resp.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Patrol Zone:</span>
                      <span className="font-semibold text-white">{resp.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Availability:</span>
                      <span className={`font-bold ${resp.availability === 'available' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {resp.availability.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Secure Comms:</span>
                      <span className="font-mono text-slate-300">{resp.phone}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Legend in bottom left */}
        <div className={`absolute bottom-3 left-3 p-2 rounded-lg text-[10px] space-y-1 backdrop-blur-md border shadow-md ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-900/90 border-slate-700 text-slate-200'
        }`}>
          <div className="font-bold text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-700 pb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-1 ring-rose-300 inline-block" />
            <span>Critical Incidents</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Missing Person (Last Seen)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Active Patrol / Responders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>Crowd Zones (Normal / Critical)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
