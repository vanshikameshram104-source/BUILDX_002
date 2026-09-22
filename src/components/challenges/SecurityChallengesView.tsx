import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SECURITY_CHALLENGES } from '../../data/challengesData';
import { SecurityChallenge } from '../../types';
import { ChallengeDetailModal } from './ChallengeDetailModal';
import { 
  Shield, ShieldAlert, AlertTriangle, CheckCircle2, 
  Activity, Play, RotateCcw, ChevronDown, ChevronUp, 
  Server, Lock, Wifi, Zap, Globe, Cpu, Radio, 
  Layers, Terminal, BarChart2, Check, ArrowRight, 
  ExternalLink, Sparkles, Sliders
} from 'lucide-react';

export const SecurityChallengesView: React.FC = () => {
  const { darkMode } = useApp();

  const [selectedChallenge, setSelectedChallenge] = useState<SecurityChallenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  
  // Expanded state for cards (all open by default on desktop, collapsible)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'challenge-1': true,
    'challenge-2': true,
    'challenge-3': true,
    'challenge-4': true,
  });

  const toggleCardExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenChallenge = (challenge: SecurityChallenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  // =========================================================================
  // SIMULATION 1 STATE: Live Cyber Attack Simulation
  // =========================================================================
  const [attackSimStep, setAttackSimStep] = useState<number>(0); // 0 = idle, 1..5 = steps
  const [attackSimRunning, setAttackSimRunning] = useState<boolean>(false);
  const [attackLogs, setAttackLogs] = useState<string[]>([
    '[SYSTEM] Sentinel Telemetry Engine armed. All ingress gateways nominal.',
    '[SYSTEM] Zero anomalous signatures detected on Port 443 / Node Egress.'
  ]);

  const runAttackSimulation = () => {
    if (attackSimRunning) return;
    setAttackSimRunning(true);
    setAttackSimStep(1);
    setAttackLogs([
      `[T+0.0s] ⚠️ ALERT: Suspicious brute-force credential stuffing burst detected (18,400 req/s).`,
      `[T+0.4s] ⚠️ MITRE ATT&CK T1486 matched: Inbound encrypted payload signature identified.`,
    ]);

    setTimeout(() => {
      setAttackSimStep(2);
      setAttackLogs(prev => [
        `[T+1.1s] 🔍 Threat Identified: Ingress Gateway Node-04 flagged as compromised.`,
        ...prev
      ]);
    }, 1200);

    setTimeout(() => {
      setAttackSimStep(3);
      setAttackLogs(prev => [
        `[T+2.3s] 🛡️ Microsegmentation Activated: Node-04 isolated via network policy. Air-gap locked.`,
        ...prev
      ]);
    }, 2400);

    setTimeout(() => {
      setAttackSimStep(4);
      setAttackLogs(prev => [
        `[T+3.6s] 🔒 Incident Contained: Suspect session tokens invalidated. RLS policy clamped down.`,
        ...prev
      ]);
    }, 3600);

    setTimeout(() => {
      setAttackSimStep(5);
      setAttackLogs(prev => [
        `[T+4.8s] ✅ SYSTEM RESTORED: Clean container rollback deployed. Cryptographic hashes verified.`,
        ...prev
      ]);
      setAttackSimRunning(false);
    }, 4800);
  };

  const resetAttackSim = () => {
    setAttackSimStep(0);
    setAttackSimRunning(false);
    setAttackLogs([
      '[SYSTEM] Sentinel Telemetry Engine armed. All ingress gateways nominal.',
      '[SYSTEM] Simulation sandbox reset to baseline.'
    ]);
  };

  // =========================================================================
  // SIMULATION 2 STATE: Zero Trust Tester
  // =========================================================================
  const [ztPersona, setZtPersona] = useState<'citizen' | 'police' | 'untrusted'>('police');
  const [ztStep, setZtStep] = useState<number>(0);
  const [ztTesting, setZtTesting] = useState<boolean>(false);

  const runZtEvaluation = () => {
    setZtTesting(true);
    setZtStep(1);

    const stepInterval = setInterval(() => {
      setZtStep(prev => {
        if (prev >= 7) {
          clearInterval(stepInterval);
          setZtTesting(false);
          return 7;
        }
        return prev + 1;
      });
    }, 400);
  };

  // =========================================================================
  // SIMULATION 3 STATE: Critical Infrastructure Protection
  // =========================================================================
  const [infraNodes, setInfraNodes] = useState([
    { id: 'power', name: 'POWER GRID', status: 'OPERATIONAL', uptime: '99.99%', load: '68%', threat: 'NONE' },
    { id: 'water', name: 'WATER SUPPLY', status: 'OPERATIONAL', uptime: '100.00%', load: '44%', threat: 'NONE' },
    { id: 'transit', name: 'TRANSPORTATION', status: 'OPERATIONAL', uptime: '99.98%', load: '78%', threat: 'NONE' },
    { id: 'services', name: 'PUBLIC SERVICES', status: 'OPERATIONAL', uptime: '100.00%', load: '32%', threat: 'NONE' },
    { id: 'comm', name: 'COMMUNICATION NETWORK', status: 'OPERATIONAL', uptime: '99.99%', load: '52%', threat: 'NONE' },
  ]);
  const [infraSimActive, setInfraSimActive] = useState(false);

  const triggerInfraThreat = () => {
    setInfraSimActive(true);
    // Simulate threat on power grid & water SCADA
    setInfraNodes(prev => prev.map(node => {
      if (node.id === 'power') return { ...node, status: 'ISOLATED', threat: 'SPOOFING DETECTED', load: '92%' };
      if (node.id === 'water') return { ...node, status: 'FAILOVER', threat: 'PRESSURE SPIKE MITIGATED', load: '55%' };
      return node;
    }));
  };

  const restoreInfra = () => {
    setInfraSimActive(false);
    setInfraNodes(prev => prev.map(node => ({
      ...node,
      status: 'OPERATIONAL',
      threat: 'NONE'
    })));
  };

  // =========================================================================
  // SIMULATION 4 STATE: DDoS & Traffic Defense
  // =========================================================================
  const [ddosActive, setDdosActive] = useState(false);
  const [ddosMetrics, setDdosMetrics] = useState({
    reqSec: 24500,
    legitimatePct: 99.4,
    suspiciousCount: 380,
    blockedPct: 99.8,
    serverLoad: 24,
    availability: 100.0
  });

  const runTrafficSimulation = () => {
    if (ddosActive) return;
    setDdosActive(true);
    // Surge traffic to 1.25M
    setDdosMetrics({
      reqSec: 1250000,
      legitimatePct: 98.6,
      suspiciousCount: 1249620,
      blockedPct: 99.92,
      serverLoad: 38,
      availability: 100.0
    });

    setTimeout(() => {
      // Return to nominal after 6s
      setDdosActive(false);
      setDdosMetrics({
        reqSec: 28400,
        legitimatePct: 99.5,
        suspiciousCount: 410,
        blockedPct: 99.8,
        serverLoad: 26,
        availability: 100.0
      });
    }, 6000);
  };

  const filteredChallenges = SECURITY_CHALLENGES.filter(c => {
    if (filterSeverity === 'ALL') return true;
    return c.severity === filterSeverity;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & SECTION TITLE */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all ${
        darkMode 
          ? 'bg-gradient-to-br from-[#0c101a] via-[#111625] to-[#0d1424] border-slate-800 shadow-2xl' 
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white border-slate-700 shadow-xl'
      }`}>
        {/* Subtle Cybersecurity Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                CYBERSECURITY EVALUATION BENCHMARK
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                OFFICIAL SIMULATION / DEMO SANDBOX
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
              SECURITY CHALLENGE SCENARIOS
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              "Real-world security situations your platform must be prepared to detect, manage, and respond to."
            </p>
          </div>

          {/* Quick Filter Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                filterSeverity === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL (4)
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                filterSeverity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              CRITICAL (3)
            </button>
            <button
              onClick={() => setFilterSeverity('HIGH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                filterSeverity === 'HIGH' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              HIGH (1)
            </button>
          </div>
        </div>

        {/* Evaluation Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Total Scenarios</span>
            <span className="text-xl font-bold text-white mt-0.5 block">4 Challenges</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-rose-400 block text-[11px]">Severity Distribution</span>
            <span className="text-xl font-bold text-rose-400 mt-0.5 block">3 Critical • 1 High</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-blue-400 block text-[11px]">Simulation Engine</span>
            <span className="text-xl font-bold text-blue-400 mt-0.5 block">Interactive & Safe</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-emerald-400 block text-[11px]">Defense Readiness</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">100% Operational</span>
          </div>
        </div>
      </div>

      {/* 2. FOUR LARGE INTERACTIVE SCENARIO CARDS */}
      <div className="space-y-6">

        {/* =========================================================================
            CARD 1: LIVE CYBER ATTACK SIMULATION
        ========================================================================= */}
        {filteredChallenges.some(c => c.id === 'challenge-1') && (
          <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
            darkMode 
              ? 'bg-[#0c101a] border-slate-800 hover:border-slate-700 shadow-xl' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'
          }`}>
            {/* Card Header Bar */}
            <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-rose-950/20 via-transparent to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      SCENARIO 01
                    </span>
                    <span className="font-mono text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      THREAT SEVERITY: CRITICAL
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    LIVE CYBER ATTACK SIMULATION
                  </h2>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => handleOpenChallenge(SECURITY_CHALLENGES[0])}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <span>View Challenge</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => toggleCardExpand('challenge-1')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                  aria-label="Toggle card expansion"
                >
                  {expandedCards['challenge-1'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Card Content */}
            {expandedCards['challenge-1'] && (
              <div className="p-6 space-y-6">
                {/* Description & Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      SCENARIO DESCRIPTION
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "During the competition, organizers announce that your system is under an active cyberattack involving ransomware, phishing attempts, or unauthorized access."
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                      CHALLENGE REQUIREMENTS
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "Teams must immediately demonstrate how their solution detects the threat, isolates compromised components, and restores normal operations without affecting legitimate users."
                    </p>
                  </div>
                </div>

                {/* Visual Attack-Response Flow */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      VISUAL ATTACK-RESPONSE FLOW PIPELINE:
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Safe Sandbox Simulation Mode
                    </span>
                  </div>

                  {/* 5-Step Flow Pipeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
                    {[
                      { step: 1, label: 'ATTACK DETECTED', sub: 'Inbound Brute-Force / Anomaly' },
                      { step: 2, label: 'THREAT IDENTIFIED', sub: 'MITRE Signature Matched' },
                      { step: 3, label: 'COMPROMISED COMPONENT ISOLATED', sub: 'Ingress Node Microsegmented' },
                      { step: 4, label: 'INCIDENT CONTAINED', sub: 'Tokens Revoked, RLS Clamped' },
                      { step: 5, label: 'SYSTEM RESTORED', sub: 'Clean Rollback Verified' },
                    ].map((st) => {
                      const isActive = attackSimStep === st.step;
                      const isCompleted = attackSimStep > st.step;

                      return (
                        <div
                          key={st.step}
                          className={`p-3 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                            isActive
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20 scale-[1.02]'
                              : isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold">{st.step}.</span>
                            <span className="font-bold text-[11px] tracking-tight">{st.label}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1">{st.sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulation Terminal Log & Control Buttons */}
                <div className="p-4 rounded-2xl bg-[#080b12] border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-rose-400" />
                      SAFE LIVE SOC TELEMETRY TERMINAL (DEMO ONLY)
                    </span>
                    <span className="text-emerald-400">STATUS: {attackSimRunning ? 'SIMULATING...' : attackSimStep === 5 ? 'RESTORED' : 'READY'}</span>
                  </div>

                  <div className="space-y-1 text-[11px] max-h-24 overflow-y-auto">
                    {attackLogs.map((log, i) => (
                      <p key={i} className={i === 0 ? 'text-white' : 'text-slate-400'}>
                        {log}
                      </p>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400">
                      * Strictly isolated sandbox. No real malicious operations are executed.
                    </div>

                    <div className="flex items-center gap-2">
                      {attackSimStep > 0 && (
                        <button
                          onClick={resetAttackSim}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}

                      <button
                        onClick={runAttackSimulation}
                        disabled={attackSimRunning}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{attackSimRunning ? 'Simulating...' : 'Simulate Attack'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenChallenge(SECURITY_CHALLENGES[0])}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>View Response Workflow</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            CARD 2: ZERO TRUST IMPLEMENTATION CHALLENGE
        ========================================================================= */}
        {filteredChallenges.some(c => c.id === 'challenge-2') && (
          <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
            darkMode 
              ? 'bg-[#0c101a] border-slate-800 hover:border-slate-700 shadow-xl' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'
          }`}>
            {/* Card Header Bar */}
            <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-amber-950/20 via-transparent to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      SCENARIO 02
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      THREAT SEVERITY: HIGH
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    ZERO TRUST IMPLEMENTATION CHALLENGE
                  </h2>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => handleOpenChallenge(SECURITY_CHALLENGES[1])}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <span>View Challenge</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => toggleCardExpand('challenge-2')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                  aria-label="Toggle card expansion"
                >
                  {expandedCards['challenge-2'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Card Content */}
            {expandedCards['challenge-2'] && (
              <div className="p-6 space-y-6">
                {/* Description & Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      SCENARIO DESCRIPTION
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "A new government cybersecurity policy mandates that every user, device, and service must be continuously verified before accessing any system resources."
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      CHALLENGE REQUIREMENTS
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "Teams must redesign their solution based on the Zero Trust Security Model, incorporating multi-factor authentication, role-based access control, continuous verification, and least-privilege principles."
                    </p>
                  </div>
                </div>

                {/* Zero Trust Visual Architecture Flow */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    ZERO TRUST VERIFICATION PIPELINE ARCHITECTURE:
                  </span>

                  {/* 7-Step Architecture Flow */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-xs text-center">
                    {[
                      { step: 1, name: 'USER', desc: 'Identity Request' },
                      { step: 2, name: 'IDENTITY VERIFICATION', desc: 'JWT & Public Key' },
                      { step: 3, name: 'MFA', desc: 'WebAuthn / TOTP' },
                      { step: 4, name: 'DEVICE VERIFICATION', desc: 'Hardware Attestation' },
                      { step: 5, name: 'POLICY CHECK', desc: 'Context & Geofence' },
                      { step: 6, name: 'LEAST-PRIVILEGE ACCESS', desc: 'Scoped Token' },
                      { step: 7, name: 'RESOURCE', desc: 'Encrypted Payload' },
                    ].map((item) => {
                      const isVerified = ztStep >= item.step;
                      return (
                        <div
                          key={item.step}
                          className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                            isVerified
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-500">{item.step}.</span>
                          <span className="font-bold text-[10px] leading-tight my-1">{item.name}</span>
                          <span className="text-[9px] text-slate-400">{item.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Indicators (6 Core Principles) */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    MANDATORY ZERO TRUST CAPABILITIES:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {[
                      { label: 'Multi-Factor Authentication', icon: 'MFA' },
                      { label: 'Role-Based Access Control', icon: 'RBAC' },
                      { label: 'Continuous Verification', icon: 'VERIFY' },
                      { label: 'Least Privilege', icon: 'LEAST' },
                      { label: 'Device Trust', icon: 'DEVICE' },
                      { label: 'Session Monitoring', icon: 'WATCH' },
                    ].map((ind, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-2"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-200 leading-tight">{ind.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Tester & Architecture Explorer Button */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">Test Persona:</span>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <button
                        onClick={() => { setZtPersona('police'); setZtStep(0); }}
                        className={`px-2.5 py-1 rounded-lg border transition ${
                          ztPersona === 'police' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        Police (Armed)
                      </button>
                      <button
                        onClick={() => { setZtPersona('citizen'); setZtStep(0); }}
                        className={`px-2.5 py-1 rounded-lg border transition ${
                          ztPersona === 'citizen' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        Citizen (Public)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={runZtEvaluation}
                      disabled={ztTesting}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{ztTesting ? 'Evaluating Gates...' : 'Test Verification Pipeline'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenChallenge(SECURITY_CHALLENGES[1])}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Explore Zero Trust Architecture</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            CARD 3: CRITICAL INFRASTRUCTURE PROTECTION CHALLENGE
        ========================================================================= */}
        {filteredChallenges.some(c => c.id === 'challenge-3') && (
          <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
            darkMode 
              ? 'bg-[#0c101a] border-slate-800 hover:border-slate-700 shadow-xl' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'
          }`}>
            {/* Card Header Bar */}
            <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Server className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      SCENARIO 03
                    </span>
                    <span className="font-mono text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      THREAT SEVERITY: CRITICAL
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      SIMULATION / DEMO
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    CRITICAL INFRASTRUCTURE PROTECTION CHALLENGE
                  </h2>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => handleOpenChallenge(SECURITY_CHALLENGES[2])}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <span>View Challenge</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => toggleCardExpand('challenge-3')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                  aria-label="Toggle card expansion"
                >
                  {expandedCards['challenge-3'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Card Content */}
            {expandedCards['challenge-3'] && (
              <div className="p-6 space-y-6">
                {/* Description & Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      SCENARIO DESCRIPTION
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "Your solution is now responsible for protecting the digital infrastructure of a smart city, including power grids, water supply systems, transportation networks, and public services."
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                      CHALLENGE REQUIREMENTS
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "Organizers introduce multiple simultaneous attacks targeting these essential services. Teams must adapt their solution to secure critical infrastructure, maintain service availability, and ensure rapid recovery from cyber incidents."
                    </p>
                  </div>
                </div>

                {/* Interactive Infrastructure Visualization Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      SMART CITY CRITICAL INFRASTRUCTURE GRID TELEMETRY:
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      5 Essential Services Monitored
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
                    {infraNodes.map((node) => {
                      const isThreat = node.threat !== 'NONE';
                      return (
                        <div
                          key={node.id}
                          className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                            isThreat
                              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                              : 'bg-slate-900/50 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-slate-400 font-bold">{node.name}</span>
                              <span className={`w-2 h-2 rounded-full ${isThreat ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                            </div>
                            <span className="text-base font-bold tracking-tight block">{node.status}</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">Uptime: {node.uptime}</span>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] flex justify-between text-slate-400">
                            <span>Load: {node.load}</span>
                            <span className={isThreat ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                              {node.threat}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Threat-to-Recovery Architecture Flow */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    RESILIENCE WORKFLOW PIPELINE:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs text-center">
                    {[
                      { step: 1, name: 'Threat Detection', desc: 'SCADA Anomaly Flagged' },
                      { step: 2, name: 'Infrastructure Monitoring', desc: 'Cross-Grid Correlation' },
                      { step: 3, name: 'Threat Isolation', desc: 'Automated Air-Gap Switch' },
                      { step: 4, name: 'Service Protection', desc: 'Auxiliary Power Routing' },
                      { step: 5, name: 'Recovery', desc: 'Zero-Blackout Return' },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between"
                      >
                        <span className="text-[10px] font-bold text-cyan-400">{s.step}. {s.name}</span>
                        <span className="text-[9px] text-slate-400 mt-1">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Metrics & Actions */}
                <div className="p-4 rounded-2xl bg-[#080b12] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full md:w-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Infrastructure Status</span>
                      <span className="text-emerald-400 font-bold">{infraSimActive ? '98.4% (Mitigated)' : '99.98% Operational'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Services Protected</span>
                      <span className="text-white font-bold">5 of 5 Grids</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Active Threats</span>
                      <span className={infraSimActive ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {infraSimActive ? '2 Isolated' : '0 Active'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Recovery Status</span>
                      <span className="text-cyan-400 font-bold">{infraSimActive ? 'Failover Active' : 'Armed'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">System Availability</span>
                      <span className="text-emerald-400 font-bold">100.00%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {infraSimActive ? (
                      <button
                        onClick={restoreInfra}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore All Grids</span>
                      </button>
                    ) : (
                      <button
                        onClick={triggerInfraThreat}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Simulate Grid Threat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            CARD 4: HIGH-TRAFFIC & DDoS DEFENSE CHALLENGE
        ========================================================================= */}
        {filteredChallenges.some(c => c.id === 'challenge-4') && (
          <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
            darkMode 
              ? 'bg-[#0c101a] border-slate-800 hover:border-slate-700 shadow-xl' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'
          }`}>
            {/* Card Header Bar */}
            <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-blue-950/20 via-transparent to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Wifi className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      SCENARIO 04
                    </span>
                    <span className="font-mono text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      THREAT SEVERITY: CRITICAL
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    HIGH-TRAFFIC & DDoS DEFENSE CHALLENGE
                  </h2>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => handleOpenChallenge(SECURITY_CHALLENGES[3])}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <span>View Challenge</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => toggleCardExpand('challenge-4')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                  aria-label="Toggle card expansion"
                >
                  {expandedCards['challenge-4'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Card Content */}
            {expandedCards['challenge-4'] && (
              <div className="p-6 space-y-6">
                {/* Description & Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      SCENARIO DESCRIPTION
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "Moments before the final evaluation, your platform experiences a massive Distributed Denial-of-Service (DDoS) attack, with millions of requests overwhelming the servers."
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                      CHALLENGE REQUIREMENTS
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "Teams must explain and demonstrate how their solution identifies malicious traffic, protects legitimate users, distributes system load, and maintains uninterrupted service availability."
                    </p>
                  </div>
                </div>

                {/* Visual Traffic-Monitoring Dashboard Flow */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                    VISUAL TRAFFIC-MONITORING DASHBOARD PIPELINE:
                  </span>

                  {/* 6-Step Traffic Flow */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs text-center">
                    {[
                      { step: 1, label: 'INCOMING TRAFFIC', desc: ddosActive ? 'Surge: 1.25M req/s' : 'Nominal Ingress' },
                      { step: 2, label: 'TRAFFIC ANALYSIS', desc: 'TLS & User-Agent Profiling' },
                      { step: 3, label: 'MALICIOUS TRAFFIC DETECTION', desc: 'Botnet Cluster Flagged' },
                      { step: 4, label: 'TRAFFIC FILTERING', desc: 'Edge PoW Challenge Imposed' },
                      { step: 5, label: 'LOAD BALANCING', desc: '8 Replicas Evenly Distributed' },
                      { step: 6, label: 'LEGITIMATE USERS', desc: '100% Uninterrupted SOS' },
                    ].map((st) => (
                      <div
                        key={st.step}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          ddosActive
                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                            : 'bg-slate-900/40 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400">{st.step}. {st.label}</span>
                        <span className="text-[9px] text-slate-400 mt-1">{st.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Demo Metrics Dashboard */}
                <div className="p-5 rounded-2xl bg-[#080b12] border border-slate-800 space-y-4 font-mono">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      LIVE VOLUMETRIC MITIGATION TELEMETRY
                    </span>
                    <span className="text-emerald-400">STATUS: {ddosActive ? 'ATTACK SCRUBBING ACTIVE' : 'NOMINAL MONITORING'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Requests/sec</span>
                      <span className={`text-base font-bold ${ddosActive ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                        {ddosMetrics.reqSec.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Legitimate Traffic</span>
                      <span className="text-base font-bold text-emerald-400">
                        {ddosMetrics.legitimatePct}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Suspicious Traffic</span>
                      <span className="text-base font-bold text-amber-400">
                        {ddosMetrics.suspiciousCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Blocked Requests</span>
                      <span className="text-base font-bold text-rose-400">
                        {ddosMetrics.blockedPct}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Server Load</span>
                      <span className="text-base font-bold text-blue-400">
                        {ddosMetrics.serverLoad}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Availability</span>
                      <span className="text-base font-bold text-emerald-400">
                        {ddosMetrics.availability.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      * Safe simulation: Simulates synthetic client request bursts without outbound socket floods.
                    </span>

                    <button
                      onClick={runTrafficSimulation}
                      disabled={ddosActive}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{ddosActive ? 'Scrubbing 1.25M req/s...' : 'Run Traffic Simulation'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Detail Inspection Modal */}
      <ChallengeDetailModal
        challenge={selectedChallenge}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLaunchSim={(id) => {
          if (id === 'challenge-1') runAttackSimulation();
          if (id === 'challenge-2') runZtEvaluation();
          if (id === 'challenge-3') triggerInfraThreat();
          if (id === 'challenge-4') runTrafficSimulation();
        }}
      />
    </div>
  );
};
