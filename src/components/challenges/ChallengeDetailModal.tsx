import React, { useState, useEffect } from 'react';
import { SecurityChallenge, ChallengeStage } from '../../types';
import { 
  X, ShieldAlert, CheckCircle2, AlertTriangle, 
  Activity, ArrowRight, Lock, Server, Cpu, Radio, 
  FileCheck, Shield, Sparkles, Terminal
} from 'lucide-react';

interface ChallengeDetailModalProps {
  challenge: SecurityChallenge | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchSim?: (challengeId: string) => void;
}

const STAGES: { stage: ChallengeStage; label: string; desc: string }[] = [
  { stage: 'DETECT', label: '1. Detect', desc: 'Identify anomaly via telemetry & AI models' },
  { stage: 'ANALYZE', label: '2. Analyze', desc: 'Fingerprint threat signature & attack vector' },
  { stage: 'RESPOND', label: '3. Respond', desc: 'Trigger automated mitigation protocol' },
  { stage: 'CONTAIN', label: '4. Contain', desc: 'Isolate compromised node & prevent lateral spread' },
  { stage: 'RECOVER', label: '5. Recover', desc: 'Deploy verified state rollback & restore services' },
  { stage: 'VERIFY', label: '6. Verify', desc: 'Validate integrity & generate audit report' },
];

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onLaunchSim
}) => {
  const [activeStage, setActiveStage] = useState<ChallengeStage>('DETECT');
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'criteria'>('overview');

  // Reset active stage when challenge changes
  useEffect(() => {
    if (challenge) {
      setActiveStage('DETECT');
      setActiveTab('overview');
    }
  }, [challenge]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !challenge) return null;

  const isCritical = challenge.severity === 'CRITICAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-2xl border border-slate-700/80 bg-[#0c101a] text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-[11px] font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                {challenge.scenarioNumber} // EVALUATION
              </span>
              <span className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                isCritical 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                THREAT LEVEL: {challenge.severity}
              </span>
              <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                SIMULATION & DEMO MODE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {challenge.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {challenge.shortDescription}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Stage Progress Indicator Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-950/80 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              CYBER DEFENSE LIFECYCLE PROGRESSION:
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              Active Phase: <strong>{activeStage}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {STAGES.map((s, idx) => {
              const isSelected = activeStage === s.stage;
              const isPast = STAGES.findIndex(item => item.stage === activeStage) >= idx;

              return (
                <button
                  key={s.stage}
                  onClick={() => setActiveStage(s.stage)}
                  className={`px-2 py-2 rounded-xl text-left transition border text-[11px] font-mono flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : isPast
                      ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold">{s.stage}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                  </div>
                  <span className="text-[9px] text-slate-400 truncate mt-0.5">{s.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Problem & Capabilities
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'workflow'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Response Workflow & Processes
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'criteria'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Evaluation Success Criteria
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Problem Statement Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> PROBLEM STATEMENT
                </span>
                <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                  {challenge.problemStatement}
                </p>
                <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>Target Threat: Active Simulation Vector</span>
                  <span className="text-emerald-400">Environment: Isolated Safe Sandbox</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
                <span className="font-mono text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> COMPETITION CHALLENGE REQUIREMENTS
                </span>
                <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                  {challenge.requirements}
                </p>
              </div>

              {/* Required Capabilities Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" /> REQUIRED SOLUTION CAPABILITIES
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {challenge.requiredCapabilities.length} Architecture Pillars
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenge.requiredCapabilities.map((cap, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition"
                    >
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200 block text-xs leading-snug">{cap}</span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">Verified in SafeNet Core</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-6">
              {/* Detection Process */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> 1. DETECTION PROCESS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Target Latency: &lt;1.5s</span>
                </div>
                <div className="space-y-2">
                  {challenge.detectionProcess.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="font-mono text-amber-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                      <p className="leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Process */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> 2. RESPONSE & CONTAINMENT PROCESS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Automated Microsegmentation</span>
                </div>
                <div className="space-y-2">
                  {challenge.responseProcess.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="font-mono text-blue-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                      <p className="leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovery Process */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 3. RECOVERY & RESTORATION PROCESS
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Zero Data Loss Verified</span>
                </div>
                <div className="space-y-2">
                  {challenge.recoveryProcess.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="font-mono text-emerald-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                      <p className="leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> EVALUATOR SCORING MATRIX & SUCCESS CRITERIA
                </h4>
                <p className="text-xs text-slate-300">
                  During live competition judging, teams are evaluated on verifiable, deterministic metrics:
                </p>
              </div>

              <div className="space-y-3">
                {challenge.successCriteria.map((criterion, idx) => {
                  const [title, desc] = criterion.split(':');
                  return (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs">
                        ✓
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-xs sm:text-sm">{title}</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{desc || title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span>SafeNet Incident Sandbox • Safe Evaluator Mode</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition border border-slate-700"
            >
              Close Inspector
            </button>
            {onLaunchSim && (
              <button
                onClick={() => {
                  onLaunchSim(challenge.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                <span>Launch Interactive Sandbox</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
