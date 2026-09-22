import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  ShieldAlert, Bell, Moon, Sun, Volume2, VolumeX, 
  ChevronDown, UserCheck, Users, Radio, Sparkles, Check, CheckCircle2, RotateCcw
} from 'lucide-react';

interface HeaderProps {
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTour }) => {
  const { 
    currentUser, 
    switchRole, 
    darkMode, 
    setDarkMode, 
    soundEnabled, 
    setSoundEnabled,
    notifications,
    markNotificationRead,
    clearNotifications,
    resetToDemoData
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleOptions: { role: UserRole; title: string; subtitle: string; icon: React.ReactNode }[] = [
    { role: 'citizen', title: 'Citizen App', subtitle: 'Priya Sharma (Attendee)', icon: <Users className="w-4 h-4 text-blue-400" /> },
    { role: 'family', title: 'Family Member', subtitle: 'Rajesh Verma (Parent)', icon: <Users className="w-4 h-4 text-amber-400" /> },
    { role: 'volunteer', title: 'Volunteer Corps', subtitle: 'Amit Patil (Sector B)', icon: <UserCheck className="w-4 h-4 text-emerald-400" /> },
    { role: 'police', title: 'Police / Security', subtitle: 'Insp. S. Deshmukh', icon: <ShieldAlert className="w-4 h-4 text-indigo-400" /> },
    { role: 'admin', title: 'Control Room Admin', subtitle: 'Chief K. Roy (HQ)', icon: <Radio className="w-4 h-4 text-rose-400" /> },
  ];

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
      darkMode ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-wider text-blue-500">SAFE<span className={darkMode ? 'text-white' : 'text-slate-900'}>NET</span></span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  MVP v2.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-xs font-medium">
                One Network. One Response. Safer Communities.
              </p>
            </div>
          </div>

          {/* Center: Quick Guided Tour Button */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenTour}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 animate-pulse-slow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive 10-Step Demo Flow</span>
            </button>
          </div>

          {/* Right Controls: Role Switcher, Sound, Theme, Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  darkMode 
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline text-slate-400">Role:</span>
                <span className="capitalize font-bold text-blue-400">
                  {currentUser.role === 'admin' ? 'Control Room' : currentUser.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role (Section 4 RBAC)
                    </p>
                  </div>
                  <div className="space-y-1">
                    {roleOptions.map((opt) => (
                      <button
                        key={opt.role}
                        onClick={() => {
                          switchRole(opt.role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                          currentUser.role === opt.role 
                            ? 'bg-blue-600 text-white shadow' 
                            : darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${currentUser.role === opt.role ? 'bg-white/20' : 'bg-slate-800'}`}>
                            {opt.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{opt.title}</p>
                            <p className="text-[10px] opacity-80 mt-0.5">{opt.subtitle}</p>
                          </div>
                        </div>
                        {currentUser.role === opt.role && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Alert Sirens' : 'Enable Alert Sirens'}
              className={`p-2 rounded-xl border transition ${
                soundEnabled 
                  ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' 
                  : 'text-slate-500 border-slate-800 bg-slate-900'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-xl border transition ${
                darkMode 
                  ? 'text-amber-400 border-slate-800 bg-slate-900 hover:bg-slate-800' 
                  : 'text-slate-700 border-slate-300 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-xl border transition ${
                  darkMode ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-slate-100'
                }`}
              >
                <Bell className="w-4 h-4 text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Popover (Section 26) */}
              {isNotifOpen && (
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <h4 className="font-bold text-xs">Notification Center</h4>
                    </div>
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-400 py-6">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            !n.read 
                              ? 'bg-blue-950/40 border-blue-500/40 text-white' 
                              : darkMode ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-xs leading-snug">{n.title}</span>
                            <span className="text-[9px] font-mono text-slate-500 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
