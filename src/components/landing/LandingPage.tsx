import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowRight, UserCheck, AlertCircle, Navigation, MapPin } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (targetRole?: 'citizen' | 'admin' | 'family' | 'police' | 'volunteer') => void;
  onOpenReport: () => void;
  onOpenChallenges?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenReport, onOpenChallenges }) => {
  const { darkMode } = useApp();

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      darkMode ? 'bg-[#0f1117] text-slate-100' : 'bg-[#fafafa] text-slate-900'
    }`}>
      
      {/* Minimal Header */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-30 ${
        darkMode ? 'border-slate-800/80 bg-[#0f1117]/80' : 'border-slate-200/80 bg-white/80'
      }`}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight">SafeNet</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={() => onEnterApp('citizen')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Citizen App
            </button>
            <button
              onClick={() => onEnterApp('admin')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition shadow-sm"
            >
              Control Room
            </button>
            {onOpenChallenges && (
              <button
                onClick={onOpenChallenges}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
                  darkMode 
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                    : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Challenges</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center">
        
        {/* Subtle Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 border ${
          darkMode 
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
            : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Real-Time Public Safety & Emergency Coordination
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight max-w-3xl">
          One connected platform for citizens, responders and communities.
        </h1>

        {/* Subtitle */}
        <p className={`text-base md:text-lg mt-6 max-w-2xl font-normal leading-relaxed ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Replacing fragmented incident reporting and delayed alerts with a single, intelligent coordination network for public gatherings and smart cities.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-10 w-full sm:w-auto">
          <button
            onClick={onOpenReport}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <span>Report an Incident</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEnterApp('admin')}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border font-medium text-sm transition ${
              darkMode 
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200' 
                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
          >
            Explore SafeNet
          </button>

          {onOpenChallenges && (
            <button
              onClick={onOpenChallenges}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border font-medium text-sm transition flex items-center justify-center gap-2 ${
                darkMode 
                  ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300' 
                  : 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 shadow-sm'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Security Challenges (4)</span>
            </button>
          )}
        </div>

        {/* Simple Workflow Visualization: Citizen → SafeNet → Response */}
        <div className="mt-20 w-full max-w-2xl">
          <p className={`text-xs uppercase tracking-widest font-mono mb-6 ${
            darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            How SafeNet Coordinates
          </p>

          <div className={`p-6 rounded-2xl border ${
            darkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="grid grid-cols-3 gap-2 items-center text-center">
              
              <div className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 ${
                  darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  <UserCheck className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-semibold">Citizen</span>
                <span className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Instant report</span>
              </div>

              <div className="flex items-center justify-center">
                <div className={`h-[1px] flex-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <span className="px-2 text-xs text-blue-500 font-mono font-medium">SafeNet</span>
                <div className={`h-[1px] flex-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 ${
                  darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-xs font-semibold">Response</span>
                <span className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Targeted dispatch</span>
              </div>

            </div>
          </div>
        </div>

        {/* Three Core Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          
          {/* Missing Person */}
          <div className={`p-6 rounded-2xl border transition ${
            darkMode ? 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}>
            <h3 className="text-base font-semibold">Missing Person</h3>
            <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Real-time assistance for families and responders with instant location markers and case tracking.
            </p>
          </div>

          {/* Live Safety */}
          <div className={`p-6 rounded-2xl border transition ${
            darkMode ? 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}>
            <h3 className="text-base font-semibold">Live Safety</h3>
            <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Location-aware incidents, predictive crowd-risk detection, and automated movement recommendations.
            </p>
          </div>

          {/* Emergency Response */}
          <div className={`p-6 rounded-2xl border transition ${
            darkMode ? 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}>
            <h3 className="text-base font-semibold">Emergency Response</h3>
            <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Connect citizens, volunteers, and security teams instantly through one centralized digital network.
            </p>
          </div>

        </div>

        {/* Security Challenge Scenarios Callout Showcase */}
        {onOpenChallenges && (
          <div className={`mt-16 w-full p-6 sm:p-8 rounded-3xl border text-left transition-all ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/30 border-blue-500/20 shadow-xl' 
              : 'bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-blue-200 shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    COMPETITION EVALUATION SUITE
                  </span>
                  <span className="text-xs font-mono text-slate-400">4 Scenarios Ready</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Security Challenge Scenarios
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Real-world security situations SafeNet is engineered to detect, contain, and resolve during live technical evaluation:
                  Live Cyber Attack, Zero Trust, Smart City Critical Infrastructure, and 1.25M req/s DDoS Defense.
                </p>
              </div>

              <button
                onClick={onOpenChallenges}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
              >
                <span>Explore All 4 Scenarios</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Minimal Footer */}
      <footer className={`border-t py-6 text-xs text-center ${
        darkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-400'
      }`}>
        <p>SafeNet • Deekshabhoomi, Nagpur Public Gathering Pilot</p>
      </footer>

    </div>
  );
};
