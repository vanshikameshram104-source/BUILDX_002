import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, 
  Users, AlertTriangle, Radio, Navigation, ScanFace, Play, ShieldAlert
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ isOpen, onClose }) => {
  const { 
    demoTourStep, 
    setDemoTourStep, 
    switchRole, 
    simulateMissingPersonDemo,
    simulateCrowdSurgeDemo,
    simulateBroadcastDemo,
    simulateIncidentDemo,
    simulateRouteDeviationDemo,
    simulateAIMatchDemo,
    darkMode 
  } = useApp();

  if (!isOpen) return null;

  const steps = [
    {
      stepNum: 1,
      title: 'Step 1: Family Reports Missing 6-Year-Old Child',
      role: 'family' as const,
      roleName: 'Family Member Portal',
      description: 'A family realizes their 6-year-old daughter Ananya is missing in the crowd near Exit B. They open SafeNet, upload her photo, and enter her details (yellow floral frock, red hairband).',
      actionLabel: 'Switch to Family & Trigger Report',
      action: () => {
        switchRole('family');
        simulateMissingPersonDemo();
      }
    },
    {
      stepNum: 2,
      title: 'Step 2: Case ID Generated & Transmitted to Command HQ',
      role: 'admin' as const,
      roleName: 'Central Control Room',
      description: 'SafeNet automatically generates Case ID "MSP-2026-00124". The case instantly appears on the Central Command Center dashboard and real-time incident queue without page refresh.',
      actionLabel: 'View Case in Control Room',
      action: () => {
        switchRole('admin');
      }
    },
    {
      stepNum: 3,
      title: 'Step 3: Field Responders & Tactical Map Pin',
      role: 'volunteer' as const,
      roleName: 'Volunteer & Police Network',
      description: 'Nearby authorized volunteers and police at Exit B receive instant priority lookouts. Her last-seen location is mapped with surrounding security posts and exit choke points.',
      actionLabel: 'Inspect Volunteer Lookout Feed',
      action: () => {
        switchRole('volunteer');
      }
    },
    {
      stepNum: 4,
      title: 'Step 4: AI Crowd Sensor Detects Exit B Surge',
      role: 'admin' as const,
      roleName: 'Crowd Monitoring AI',
      description: 'YOLOv8 surveillance inference registers rapid crowd compaction at Exit B (87% capacity, velocity +18% in 5 min). Zone status escalates to CRITICAL.',
      actionLabel: 'Simulate Exit B Crowd Surge',
      action: () => {
        switchRole('admin');
        simulateCrowdSurgeDemo();
      }
    },
    {
      stepNum: 5,
      title: 'Step 5: Predictive Risk Recommendation Generated',
      role: 'admin' as const,
      roleName: 'Central Command Center',
      description: 'The predictive risk engine calculates high risk of bottleneck stampede and generates an automated recommendation: "Redirect visitors to Exit C (South Egress)".',
      actionLabel: 'Inspect AI Risk Recommendation',
      action: () => {
        switchRole('admin');
      }
    },
    {
      stepNum: 6,
      title: 'Step 6: Targeted Emergency Broadcast Transmitted',
      role: 'admin' as const,
      roleName: 'Emergency Broadcast Console',
      description: 'The Control Room approves the diversion and transmits a location-based emergency broadcast directly to attendees at Exit B: "Exit B congested. Please use Exit C for safe exit."',
      actionLabel: 'Dispatch Emergency Broadcast',
      action: () => {
        switchRole('admin');
        simulateBroadcastDemo();
      }
    },
    {
      stepNum: 7,
      title: 'Step 7: Citizen Reports Chain Snatching Incident',
      role: 'citizen' as const,
      roleName: 'Citizen App',
      description: 'A citizen reports a chain-snatching theft near the Main Gate. GPS coordinates and description are captured. Incident ID "INC-2026-00482" appears instantly in the Control Room.',
      actionLabel: 'Trigger Chain Snatching Report',
      action: () => {
        switchRole('citizen');
        simulateIncidentDemo();
      }
    },
    {
      stepNum: 8,
      title: 'Step 8: Officer Dispatched & Incident Resolved',
      role: 'police' as const,
      roleName: 'Police Tactical Dashboard',
      description: 'Control Room assigns Inspector S. Deshmukh. Officer accepts on mobile terminal. Lifecycle advances: REPORTED → ASSIGNED → RESPONDING → RESOLVED.',
      actionLabel: 'View Police Dispatch Triage',
      action: () => {
        switchRole('police');
      }
    },
    {
      stepNum: 9,
      title: 'Step 9: Safety Journey & Route Deviation Alert',
      role: 'citizen' as const,
      roleName: 'Personal Safety Journey',
      description: 'A citizen sets their destination to the Metro station. The system detects an unplanned deviation toward a dark bypass alley, prompting "Are You Safe?" with a 45s auto-alert countdown.',
      actionLabel: 'Trigger Route Deviation Test',
      action: () => {
        switchRole('citizen');
        simulateRouteDeviationDemo();
      }
    },
    {
      stepNum: 10,
      title: 'Step 10: AI CCTV Biometric Match & Human Verification',
      role: 'admin' as const,
      roleName: 'AI Missing Persons Bureau',
      description: 'CCTV Camera #04 detects a candidate matching missing child Ananya with 91% biometric confidence. In accordance with safety protocol, human verification is required to confirm.',
      actionLabel: 'Trigger AI Face Match Demo',
      action: () => {
        switchRole('admin');
        simulateAIMatchDemo();
      }
    },
    {
      stepNum: 11,
      title: 'Step 11: Section 26 Database Governance & Offline Persistence',
      role: 'admin' as const,
      roleName: 'Data Governance HQ',
      description: 'SafeNet commits all 7 core entities (users, incidents, missing_persons, responders, alerts, crowd_zones, safety_journeys) to native IndexedDB storage with indexed search, zero network latency, JSON export/import disaster recovery, and optional Google Cloud Firestore sync.',
      actionLabel: 'Inspect Live IndexedDB Engine',
      action: () => {
        switchRole('admin');
      }
    }
  ];

  const currentStepData = steps[demoTourStep] || steps[0];

  const handleNext = () => {
    if (demoTourStep < steps.length - 1) {
      const nextStep = demoTourStep + 1;
      setDemoTourStep(nextStep);
      steps[nextStep].action();
    }
  };

  const handlePrev = () => {
    if (demoTourStep > 0) {
      const prevStep = demoTourStep - 1;
      setDemoTourStep(prevStep);
      steps[prevStep].action();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                Section 30 // Official Hackathon Demo Flow
              </span>
              <h3 className="text-lg font-black tracking-tight">SafeNet 10-Step Evaluator Story</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>Step {currentStepData.stepNum} of 10</span>
            <span className="font-bold text-blue-400 uppercase">Viewing as: {currentStepData.roleName}</span>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {steps.map((s, idx) => (
              <div 
                key={s.stepNum}
                onClick={() => {
                  setDemoTourStep(idx);
                  s.action();
                }}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  idx === demoTourStep 
                    ? 'bg-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/40' 
                    : idx < demoTourStep 
                    ? 'bg-blue-500' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Step ${s.stepNum}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-5 text-sm">
          <div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
              {currentStepData.roleName}
            </span>
            <h2 className="text-xl font-black text-white mt-2">
              {currentStepData.title}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Action Banner */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-bold text-blue-200 block">Execute Step Simulation:</span>
              <p className="text-[11px] text-slate-400">Switches role and triggers live state change</p>
            </div>
            <button
              onClick={() => {
                currentStepData.action();
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStepData.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/30">
          <button
            onClick={handlePrev}
            disabled={demoTourStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Step
          </button>

          <span className="text-xs font-mono text-slate-500">
            {demoTourStep + 1} / 10
          </span>

          <button
            onClick={handleNext}
            disabled={demoTourStep === steps.length - 1}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
