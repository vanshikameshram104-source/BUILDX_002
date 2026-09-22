import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Users, AlertTriangle, Radio, Navigation, 
  ScanFace, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, Play
} from 'lucide-react';

interface DemoBarProps {
  onOpenTour: () => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({ onOpenTour }) => {
  const { 
    simulateMissingPersonDemo,
    simulateIncidentDemo,
    simulateCrowdSurgeDemo,
    simulateBroadcastDemo,
    simulateRouteDeviationDemo,
    simulateAIMatchDemo,
    resetToDemoData,
    switchRole,
    darkMode
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const triggerAction = (label: string, action: () => void) => {
    action();
    setLastAction(label);
    setTimeout(() => setLastAction(null), 2500);
  };

  return (
    <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[96%] max-w-5xl shadow-2xl rounded-2xl border backdrop-blur-xl ${
      darkMode 
        ? 'bg-slate-950/95 border-blue-500/40 text-white' 
        : 'bg-white/95 border-blue-300 text-slate-900'
    }`}>
      
      {/* Top Header / Bar Handle */}
      <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="font-mono text-[11px]">HACKATHON EVALUATOR TOOLBAR</span>
          </div>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            1-Click Live Triggers for the 10-Step Demo Story
          </span>
          {lastAction && (
            <span className="text-emerald-400 font-bold text-[11px] animate-pulse flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {lastAction} Triggered!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTour}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow transition"
          >
            <Play className="w-3 h-3 fill-current" /> Guided 10-Step Story
          </button>

          <button
            onClick={() => triggerAction('Demo Reset to Baseline', resetToDemoData)}
            title="Reset All Data"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Action Buttons Row */}
      {!isCollapsed && (
        <div className="p-2.5 flex items-center gap-2 overflow-x-auto text-xs">
          
          {/* Step 1 & 2: Missing Child */}
          <button
            onClick={() => {
              switchRole('family');
              triggerAction('Step 1-2: Missing Child Reported', simulateMissingPersonDemo);
            }}
            className="px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 whitespace-nowrap font-semibold transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>[ 👶 1-2. Missing Child ]</span>
          </button>

          {/* Step 4 & 5: Crowd Surge Exit B */}
          <button
            onClick={() => {
              switchRole('admin');
              triggerAction('Step 4-5: Exit B Crowd Surge (89%)', simulateCrowdSurgeDemo);
            }}
            className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 whitespace-nowrap font-semibold transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>[ 📈 4-5. Crowd Surge Exit B ]</span>
          </button>

          {/* Step 6: Emergency Broadcast */}
          <button
            onClick={() => {
              switchRole('admin');
              triggerAction('Step 6: Emergency Broadcast Dispatched', simulateBroadcastDemo);
            }}
            className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 whitespace-nowrap font-semibold transition flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>[ 📢 6. Broadcast Alert ]</span>
          </button>

          {/* Step 7 & 8: Chain Snatching */}
          <button
            onClick={() => {
              switchRole('admin');
              triggerAction('Step 7-8: Chain Snatching Incident', simulateIncidentDemo);
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 whitespace-nowrap font-semibold transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>[ 🚨 7-8. Incident Report ]</span>
          </button>

          {/* Step 9: Safety Journey & Route Deviation */}
          <button
            onClick={() => {
              switchRole('citizen');
              triggerAction('Step 9: Route Deviation Triggered', simulateRouteDeviationDemo);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 whitespace-nowrap font-semibold transition flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>[ ⚠️ 9. Route Deviation ]</span>
          </button>

          {/* Step 10: AI Face Match */}
          <button
            onClick={() => {
              switchRole('admin');
              triggerAction('Step 10: AI Face Match Detected (91%)', simulateAIMatchDemo);
            }}
            className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 whitespace-nowrap font-semibold transition flex items-center gap-1.5"
          >
            <ScanFace className="w-3.5 h-3.5 text-cyan-400" />
            <span>[ 🎯 10. AI CCTV Match ]</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={() => triggerAction('Reset Demo Data', resetToDemoData)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap font-medium transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>

        </div>
      )}
    </div>
  );
};
