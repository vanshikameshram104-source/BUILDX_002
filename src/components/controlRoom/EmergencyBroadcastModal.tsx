import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Radio, AlertTriangle, Send, ShieldAlert, Users, Info, X } from 'lucide-react';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultZone?: string;
}

export const EmergencyBroadcastModal: React.FC<EmergencyBroadcastModalProps> = ({
  isOpen,
  onClose,
  defaultZone = 'Entire Event'
}) => {
  const { broadcastAlert, crowdZones, darkMode } = useApp();

  const [type, setType] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('CRITICAL');
  const [title, setTitle] = useState('⚠️ CROWD DIVERSION NOTICE');
  const [message, setMessage] = useState('Exit B is experiencing heavy pedestrian congestion. Please divert and exit via Exit C.');
  const [targetZone, setTargetZone] = useState(defaultZone);
  const [targetRole, setTargetRole] = useState<'all' | 'citizens' | 'volunteers' | 'police'>('all');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('CRITICAL');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    broadcastAlert({
      type,
      title,
      message,
      targetZone,
      targetRole,
      priority,
      createdBy: 'Central Security Control Room'
    });

    onClose();
  };

  const handleTemplate = (tpl: 'exit-b' | 'lost-child' | 'weather') => {
    if (tpl === 'exit-b') {
      setType('CRITICAL');
      setTitle('⚠️ CROWD DIVERSION: EXIT B');
      setMessage('Exit B has reached 87% density capacity. Please use Exit C for immediate safe exit.');
      setTargetZone('Exit B (East)');
      setTargetRole('all');
      setPriority('CRITICAL');
    } else if (tpl === 'lost-child') {
      setType('WARNING');
      setTitle('🔵 CHILD LOOKOUT ADVISORY');
      setMessage('Volunteers & security: Be on lookout for 6yo girl in yellow floral dress with red hairband near East corridor.');
      setTargetZone('Exit B (East)');
      setTargetRole('volunteers');
      setPriority('HIGH');
    } else if (tpl === 'weather') {
      setType('INFO');
      setTitle('💧 FREE HYDRATION & MEDICAL SUPPORT');
      setMessage('Free drinking water refill and heat relief post available near Medical Zone and Stage perimeter.');
      setTargetZone('Entire Event');
      setTargetRole('citizens');
      setPriority('NORMAL');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-900/60 via-slate-900 to-blue-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/40">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Emergency Broadcast Console</h3>
              <p className="text-xs text-slate-300">Push instant real-time alerts across network devices</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Quick Scenarios (Hackathon Presets):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTemplate('exit-b')}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition"
              >
                Exit B Surge (Step 6)
              </button>
              <button
                type="button"
                onClick={() => handleTemplate('lost-child')}
                className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition"
              >
                Child Lookout
              </button>
              <button
                type="button"
                onClick={() => handleTemplate('weather')}
                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
              >
                Water / Aid Station
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Alert Type */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Alert Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'CRITICAL' | 'WARNING' | 'INFO')}
                className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <option value="CRITICAL">🔴 CRITICAL (Emergency Siren)</option>
                <option value="WARNING">🟡 WARNING (Advisory)</option>
                <option value="INFO">🔵 INFO (Public Assistance)</option>
              </select>
            </div>

            {/* Target Role */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as 'all' | 'citizens' | 'volunteers' | 'police')}
                className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <option value="all">🌐 Entire Audience (All Users)</option>
                <option value="citizens">👤 Citizens & Families Only</option>
                <option value="volunteers">🤝 Field Volunteers Only</option>
                <option value="police">👮 Police & Security Only</option>
              </select>
            </div>
          </div>

          {/* Target Zone */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Geographic Target Zone</label>
            <select
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value)}
              className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
              }`}
            >
              <option value="Entire Event">Entire Event (All 6 Zones)</option>
              {crowdZones.map(z => (
                <option key={z.id} value={z.zoneName}>{z.zoneName}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Alert Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none font-semibold ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
              }`}
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Broadcast Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <Send className="w-4 h-4" /> Transmit Broadcast Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
