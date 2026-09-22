import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Play, ArrowRight, Activity, ExternalLink } from 'lucide-react';

interface CurrentChallengeCardProps {
  onNavigateToChallenges?: () => void;
}

export const CurrentChallengeCard: React.FC<CurrentChallengeCardProps> = ({
  onNavigateToChallenges
}) => {
  const { navigateTo, darkMode } = useApp();

  const handleOpen = () => {
    if (onNavigateToChallenges) {
      onNavigateToChallenges();
    } else {
      navigateTo('challenges');
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
      darkMode 
        ? 'bg-gradient-to-r from-[#0d1424] via-[#0c101a] to-[#121626] border-slate-800 shadow-lg' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Background Accent Glow */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-rose-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left Side: Challenge Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              CURRENT CHALLENGE
            </span>
            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              THREAT LEVEL: CRITICAL
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              STATUS: SIMULATION READY
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              LIVE CYBER ATTACK SIMULATION
            </h3>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Required Response: <strong className="text-slate-200">Threat Detection + Isolation + Recovery</strong>
          </p>
        </div>

        {/* Right Side: Metrics & Launch Button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
          
          {/* Quick Metrics Pill as requested in prompt */}
          <div className="grid grid-cols-4 gap-2 text-center font-mono text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <div className="px-2">
              <span className="text-white font-bold block">4</span>
              <span className="text-[9px] text-slate-400">CHALLENGES</span>
            </div>
            <div className="px-2 border-l border-slate-800">
              <span className="text-rose-400 font-bold block">1</span>
              <span className="text-[9px] text-slate-400">CRITICAL</span>
            </div>
            <div className="px-2 border-l border-slate-800">
              <span className="text-amber-400 font-bold block">2</span>
              <span className="text-[9px] text-slate-400">HIGH</span>
            </div>
            <div className="px-2 border-l border-slate-800">
              <span className="text-blue-400 font-bold block">1</span>
              <span className="text-[9px] text-slate-400">ACTIVE SIM</span>
            </div>
          </div>

          {/* Launch Simulation Button */}
          <button
            onClick={handleOpen}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
};
