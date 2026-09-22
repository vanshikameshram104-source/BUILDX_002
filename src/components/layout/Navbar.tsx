import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AppView } from '../../types';
import { NotificationCenter } from './NotificationCenter';
import { 
  Shield, Moon, Sun, Volume2, VolumeX, 
  ChevronDown, Sparkles, Check, Bell, UserCheck, Database
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenTour }) => {
  const { 
    currentUser, 
    switchRole, 
    darkMode, 
    setDarkMode, 
    soundEnabled, 
    setSoundEnabled,
    notifications,
    isSupabaseConnected
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roles: { role: UserRole; view: AppView; label: string; desc: string }[] = [
    { role: 'citizen', view: 'citizen', label: 'Priya (Citizen)', desc: 'General public portal' },
    { role: 'family', view: 'family', label: 'Rajesh (Family)', desc: 'Missing person tracking' },
    { role: 'volunteer', view: 'volunteer', label: 'Amit (Volunteer)', desc: 'Sector marshal' },
    { role: 'police', view: 'police', label: 'Insp. Deshmukh (Police)', desc: 'Law enforcement' },
    { role: 'admin', view: 'control_room', label: 'Controller Roy (Admin)', desc: 'Central command HQ' },
  ];

  const handleRoleSelect = (r: { role: UserRole; view: AppView }) => {
    switchRole(r.role);
    onNavigate(r.view);
    setIsRoleDropdownOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        darkMode ? 'bg-[#0f1117]/90 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand / Logo */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight leading-none">SafeNet</span>
              <span className={`text-[10px] font-mono tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Nagpur Command
              </span>
            </div>
          </div>

          {/* Quick View Navigation Tabs */}
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                currentView === 'landing'
                  ? darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900 font-semibold'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => {
                switchRole('citizen');
                onNavigate('citizen');
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                currentView === 'citizen'
                  ? darkMode ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Citizen
            </button>

            <button
              onClick={() => {
                switchRole('family');
                onNavigate('family');
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                currentView === 'family'
                  ? darkMode ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Family
            </button>

            <button
              onClick={() => {
                switchRole('volunteer');
                onNavigate('volunteer');
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                currentView === 'volunteer'
                  ? darkMode ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Volunteer
            </button>

            <button
              onClick={() => {
                switchRole('police');
                onNavigate('police');
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                currentView === 'police'
                  ? darkMode ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Police
            </button>

            <button
              onClick={() => {
                switchRole('admin');
                onNavigate('control_room');
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                currentView === 'control_room'
                  ? darkMode ? 'bg-blue-600 text-white font-semibold' : 'bg-blue-600 text-white font-semibold'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Control Room
            </button>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-2">

            {/* Database Engine Status Pill */}
            <button
              onClick={() => {
                switchRole('admin');
                onNavigate('control_room');
              }}
              title={isSupabaseConnected 
                ? "Cloud Database Engine: Supabase PostgreSQL (Live Realtime Connected). Click to inspect."
                : "Primary Storage Engine: IndexedDB (safenet_security_db v1). Supabase & Neon PostgreSQL cloud sync ready. Click to inspect."
              }
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
                isSupabaseConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : darkMode 
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-blue-500/40' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-medium">
                {isSupabaseConnected ? 'DB: Supabase (Live)' : 'DB: IndexedDB (Offline-Ready)'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            </button>

            {/* Guided Demo Flow Trigger */}
            <button
              onClick={onOpenTour}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                darkMode 
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                  : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden md:inline">Demo Flow</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              title="Notifications"
              className={`relative p-1.5 rounded-lg border transition ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Role Switcher Popover */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                  darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="capitalize">{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400">
                    Switch Active Persona
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition ${
                        currentUser.role === r.role 
                          ? 'bg-blue-600 text-white font-medium' 
                          : darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">{r.label}</span>
                        <span className={`text-[10px] ${
                          currentUser.role === r.role ? 'text-blue-100' : darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {r.desc}
                        </span>
                      </div>
                      {currentUser.role === r.role && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
              className={`p-1.5 rounded-lg border transition ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-1.5 rounded-lg border transition ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </>
  );
};
