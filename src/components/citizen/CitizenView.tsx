import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentCategory, IncidentPriority, MissingPersonType } from '../../types';
import { 
  Shield, AlertTriangle, Users, Navigation, 
  CheckCircle2, ShieldCheck
} from 'lucide-react';

export const CitizenView: React.FC = () => {
  const { 
    currentUser, 
    incidents, 
    reportIncident, 
    reportMissingPerson,
    alerts, 
    activeJourney, 
    startSafetyJourney, 
    endSafetyJourney, 
    respondToDeviation,
    triggerEmergencySOS,
    simulateRouteDeviationDemo,
    switchRole,
    darkMode 
  } = useApp();

  // Navigation: Home, Reports, Safety, Alerts, Profile per Section 34
  const [activeNav, setActiveNav] = useState<'home' | 'reports' | 'safety' | 'alerts' | 'profile'>('home');
  const [activeModal, setActiveModal] = useState<'none' | 'incident' | 'missing' | 'journey' | 'emergency_confirm'>('none');

  // INCIDENT REPORTING STATE (Section 10)
  const [incStep, setIncStep] = useState<'category' | 'details' | 'success'>('category');
  const [incCategory, setIncCategory] = useState<IncidentCategory>('Chain Snatching');
  const [incDesc, setIncDesc] = useState('');
  const [incLocation, setIncLocation] = useState('Near Main Gate (Sector 1)');
  const [incPhoto, setIncPhoto] = useState<string | null>(null);
  const [incSubmittedId, setIncSubmittedId] = useState<string | null>(null);

  // MISSING PERSON STEP-BY-STEP FORM (Section 8: Steps 1 to 4)
  const [mspStep, setMspStep] = useState<1 | 2 | 3 | 4>(1);
  const [mspName, setMspName] = useState('Aarohi Verma');
  const [mspAge, setMspAge] = useState<number>(6);
  const [mspGender, setMspGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [mspPhoto, setMspPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1595454223600-91fbdd774780?w=300&auto=format&fit=crop&q=80'
  );
  const [mspClothing, setMspClothing] = useState('Yellow floral dress, red hairband');
  const [mspFeatures, setMspFeatures] = useState('Small birthmark near left wrist');
  const [mspMedical, setMspMedical] = useState('Mild asthma inhaler needed');
  const [mspLocation, setMspLocation] = useState('Exit B (East Gate Corridor)');
  const [mspTime, setMspTime] = useState('5:32 PM');
  const [mspContact, setMspContact] = useState('+91 98230 11223');
  const [mspSubmittedId, setMspSubmittedId] = useState<string | null>(null);

  // SAFETY JOURNEY STATE (Section 17)
  const [destInput, setDestInput] = useState('Deekshabhoomi Metro Station');
  const [contactName, setContactName] = useState('Rajesh Verma (Family)');
  const [contactPhone, setContactPhone] = useState('+91 98230 11223');
  const [deviationTimer, setDeviationTimer] = useState<number>(45);

  // Route Deviation Countdown
  useEffect(() => {
    if (!activeJourney || activeJourney.routeStatus !== 'DEVIATION_DETECTED') {
      return;
    }
    const interval = setInterval(() => {
      setDeviationTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          respondToDeviation(false); // Auto-alert trusted contacts
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeJourney, respondToDeviation]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const myReports = incidents.filter(i => i.reporterId === currentUser.id);
  const relevantAlert = alerts[0];

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDesc.trim()) return;

    const isCritical = incCategory === 'Medical Emergency' || incCategory === 'Fire' || incCategory === 'Crowd Emergency';
    const isHigh = incCategory === 'Chain Snatching' || incCategory === 'Harassment';
    const priority: IncidentPriority = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MEDIUM';

    const created = reportIncident({
      category: incCategory,
      description: incDesc,
      location: incLocation,
      latitude: 21.1290,
      longitude: 79.0660,
      priority,
      photo: incPhoto || undefined,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone
    });

    setIncSubmittedId(created.id);
    setIncStep('success');
  };

  const handleMissingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mspName.trim()) return;

    const personType: MissingPersonType = mspAge < 14 ? 'child' : mspAge > 60 ? 'elderly' : 'adult';

    const created = reportMissingPerson({
      name: mspName,
      age: mspAge,
      gender: mspGender,
      personType,
      photo: mspPhoto,
      clothing: mspClothing,
      identifyingFeatures: mspFeatures,
      medicalNotes: mspMedical || undefined,
      lastSeenLocation: mspLocation,
      latitude: 21.1275,
      longitude: 79.0690,
      lastSeenTime: mspTime,
      reporterId: currentUser.id,
      reporterName: `${currentUser.name} (Family)`,
      emergencyContact: mspContact
    });

    setMspSubmittedId(created.id);
  };

  const categories: { name: IncidentCategory; desc: string; icon: string }[] = [
    { name: 'Chain Snatching', desc: 'Theft of jewelry or valuables', icon: '💎' },
    { name: 'Suspicious Activity', desc: 'Unattended baggage or activity', icon: '👁️' },
    { name: 'Medical Emergency', desc: 'Fainting, injury or illness', icon: '🚑' },
    { name: 'Crowd Emergency', desc: 'Severe congestion or crush risk', icon: '👥' },
    { name: 'Fire', desc: 'Smoke, spark or flame detected', icon: '🔥' },
    { name: 'Accident', desc: 'Fall, collision or structural hazard', icon: '⚠️' },
    { name: 'Harassment', desc: 'Verbal or physical distress', icon: '🛡️' },
    { name: 'Other', desc: 'General safety assistance needed', icon: 'ℹ️' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      
      {/* Citizen Navigation: Home, Reports, Safety, Alerts, Profile per Section 34 */}
      <nav className={`flex items-center justify-between border-b pb-3 text-xs font-medium ${
        darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-5 sm:gap-7">
          {(['home', 'reports', 'safety', 'alerts', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNav(tab)}
              className={`capitalize transition pb-1 ${
                activeNav === tab 
                  ? `${darkMode ? 'text-white border-b-2 border-blue-500 font-semibold' : 'text-slate-900 border-b-2 border-blue-600 font-semibold'}` 
                  : darkMode ? 'hover:text-white' : 'hover:text-slate-900'
              }`}
            >
              {tab}
              {tab === 'reports' && myReports.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-blue-400 font-mono">
                  {myReports.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Nagpur Sector 1</span>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 1. HOME TAB (Section 7: How can we help? 4 primary action buttons)        */}
      {/* ========================================================================= */}
      {activeNav === 'home' && (
        <div className="space-y-6">
          
          {/* Greeting */}
          <div className="pt-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}, {currentUser.name.split(' ')[0]}.
            </h1>
            <p className={`text-sm mt-1 font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              How can we help?
            </p>
          </div>

          {/* 4 Main Action Buttons (Design Philosophy: Minimal, Blue accent, Red ONLY for Emergency) */}
          <div className="grid grid-cols-2 gap-3.5">
            
            {/* Action 1: Report Incident */}
            <button
              onClick={() => {
                setIncStep('category');
                setActiveModal('incident');
              }}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between group ${
                darkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 shadow-sm'
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 mb-4 transition-transform group-hover:scale-105">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Report Incident</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Theft, medical, harassment
                </p>
              </div>
            </button>

            {/* Action 2: Report Missing Person */}
            <button
              onClick={() => {
                setMspStep(1);
                setMspSubmittedId(null);
                setActiveModal('missing');
              }}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between group ${
                darkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 shadow-sm'
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 mb-4 transition-transform group-hover:scale-105">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Report Missing Person</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Child or elderly assistance
                </p>
              </div>
            </button>

            {/* Action 3: Emergency (Red ONLY for genuine emergencies) */}
            <button
              onClick={() => setActiveModal('emergency_confirm')}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between group border-rose-500/40 ${
                darkMode 
                  ? 'bg-rose-950/20 hover:bg-rose-950/40 text-white' 
                  : 'bg-rose-50/60 hover:bg-rose-100/60 text-rose-950 shadow-sm'
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-600 text-white mb-4 shadow-sm transition-transform group-hover:scale-105">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">Emergency</h3>
                <p className="text-xs text-rose-600/80 dark:text-rose-300/70 mt-0.5">
                  Immediate 1-tap SOS dispatch
                </p>
              </div>
            </button>

            {/* Action 4: Safety Journey */}
            <button
              onClick={() => setActiveModal('journey')}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between group ${
                darkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 shadow-sm'
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 mb-4 transition-transform group-hover:scale-105">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Safety Journey</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Route deviation protection
                </p>
              </div>
            </button>

          </div>

          {/* ACTIVE SAFETY JOURNEY BANNER (Section 17) */}
          {activeJourney && (
            <div className={`p-4 rounded-2xl border transition ${
              activeJourney.routeStatus === 'DEVIATION_DETECTED'
                ? 'border-rose-500/60 bg-rose-950/40 text-white animate-pulse'
                : darkMode ? 'border-blue-500/30 bg-blue-950/20' : 'border-blue-200 bg-blue-50/50'
            }`}>
              {activeJourney.routeStatus === 'DEVIATION_DETECTED' ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>⚠️ ROUTE DEVIATION DETECTED</span>
                  </div>
                  <p className="text-slate-200">
                    Your current route differs significantly from your planned path to <strong>{activeJourney.destination}</strong>.
                  </p>
                  <div className="p-2 rounded-lg bg-rose-900/40 border border-rose-500/30 flex items-center justify-between">
                    <span className="text-[11px] font-mono">
                      Auto-alerting {activeJourney.trustedContacts[0]?.name} in <strong>{deviationTimer}s</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondToDeviation(true)}
                        className="px-3 py-1 rounded bg-white text-slate-900 font-bold text-xs"
                      >
                        [ I'M SAFE ]
                      </button>
                      <button
                        onClick={() => respondToDeviation(false)}
                        className="px-3 py-1 rounded bg-rose-600 text-white font-bold text-xs"
                      >
                        [ SEND ALERT ]
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-blue-500 block">Active Safety Journey</span>
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                      Heading to: <strong>{activeJourney.destination}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={simulateRouteDeviationDemo}
                      className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 font-medium text-[11px]"
                    >
                      Simulate Deviation
                    </button>
                    <button
                      onClick={endSafetyJourney}
                      className="px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-[11px]"
                    >
                      End Journey
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NEARBY SAFETY ALERT (Section 7) */}
          <div className="space-y-3 pt-1">
            <h3 className={`text-xs uppercase font-mono tracking-wider font-semibold ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Nearby Safety Alert
            </h3>

            {relevantAlert ? (
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                relevantAlert.type === 'CRITICAL'
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm'
              }`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  relevantAlert.type === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold">{relevantAlert.title}</h4>
                    <span className={`text-[10px] font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {relevantAlert.createdAt}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {relevantAlert.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border text-xs ${
                darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
              }`}>
                No active critical alerts in your vicinity. Area status normal.
              </div>
            )}

            {/* SMALL NEARBY MAP (Section 7) */}
            <div className={`relative h-44 rounded-2xl border overflow-hidden ${
              darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-900 shadow-sm'
            }`}>
              <div 
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%),
                    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '100% 100%, 30px 30px, 30px 30px'
                }}
              />
              
              {/* User Location Pulse */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="relative">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 block shadow-lg shadow-blue-500/50" />
                  <span className="w-7 h-7 rounded-full bg-blue-400/30 -inset-1.5 absolute animate-ping" />
                </div>
                <span className="text-[10px] font-medium mt-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-white border border-slate-700 shadow-lg">
                  You are here (Near Main Gate)
                </span>
              </div>

              {/* Nearby landmark indicators */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                Exit B: 120m • Help Desk #2: 45m
              </div>

              <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Police Post #1: 85m
              </div>
            </div>

            {/* RECENT REPORT STATUS (Section 7) */}
            {myReports.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className={`text-xs uppercase font-mono tracking-wider font-semibold ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Your Recent Report Status
                  </h3>
                  <button 
                    onClick={() => setActiveNav('reports')}
                    className="text-xs text-blue-500 hover:text-blue-400 font-medium"
                  >
                    View all
                  </button>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">{myReports[0].category} ({myReports[0].id})</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">
                      {myReports[0].status}
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {myReports[0].description}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Updated: {myReports[0].updatedAt} • Location: {myReports[0].location}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REPORTS TAB                                                            */}
      {/* ========================================================================= */}
      {activeNav === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <div>
              <h2 className="text-lg font-semibold">Your Submitted Reports</h2>
              <p className="text-xs text-slate-400">Track real-time response from dispatch to resolution</p>
            </div>
            <button
              onClick={() => {
                setIncStep('category');
                setActiveModal('incident');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
            >
              + New Report
            </button>
          </div>

          {myReports.length === 0 ? (
            <div className={`p-10 rounded-2xl border text-center text-xs space-y-2 ${
              darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-500" />
              <p className="font-medium">No reports filed yet.</p>
              <p>When you report an incident, you can monitor the live response lifecycle here.</p>
            </div>
          ) : (
            myReports.map(report => (
              <div 
                key={report.id} 
                className={`p-5 rounded-2xl border space-y-3 ${
                  darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{report.category}</span>
                    <span className="text-xs font-mono text-blue-500 font-bold">{report.id}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    report.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                    report.status === 'RESPONDING' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {report.status}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {report.description}
                </p>

                {/* Status Pipeline Timeline */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Response Lifecycle
                  </span>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {(['REPORTED', 'ACKNOWLEDGED', 'ASSIGNED', 'RESPONDING', 'RESOLVED'] as const).map((step, idx) => {
                      const stepOrder = ['REPORTED', 'ACKNOWLEDGED', 'ASSIGNED', 'RESPONDING', 'RESOLVED'];
                      const currentIdx = stepOrder.indexOf(report.status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={step} className="space-y-1">
                          <div className={`h-1.5 rounded-full ${
                            isComplete ? 'bg-blue-500' : darkMode ? 'bg-slate-800' : 'bg-slate-200'
                          }`} />
                          <span className={`text-[9px] font-mono truncate block ${
                            isCurrent ? 'text-blue-400 font-bold' : isComplete ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                  <span>Location: {report.location}</span>
                  <span>{report.assignedResponderName ? `Assigned: ${report.assignedResponderName}` : 'Triage in progress'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SAFETY TAB (Safety Journey with Route Tracking & Simulation)            */}
      {/* ========================================================================= */}
      {activeNav === 'safety' && (
        <div className="space-y-5">
          <div className="border-b pb-3 border-slate-800">
            <h2 className="text-lg font-semibold">Personal Safety Tools</h2>
            <p className="text-xs text-slate-400">Protective tracking during pedestrian travel at large events</p>
          </div>

          <div className={`p-5 rounded-2xl border space-y-4 ${
            darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold">Safety Journey Tracking</h3>
                <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Continuously compares your GPS coordinates against the safest lit route to your destination.
                  If an unexpected route deviation occurs, an emergency verification is triggered with a 45-second countdown.
                </p>
              </div>
            </div>

            {activeJourney ? (
              <div className="space-y-3 pt-2">
                <div className={`p-4 rounded-xl border ${
                  activeJourney.routeStatus === 'DEVIATION_DETECTED'
                    ? 'border-rose-500/50 bg-rose-950/30 text-rose-300'
                    : 'border-blue-500/30 bg-blue-500/5'
                }`}>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-blue-400 font-bold">Journey in Progress</span>
                    <span className="font-mono text-[10px] text-slate-400">Started: {activeJourney.startedAt}</span>
                  </div>
                  <p className="text-sm font-bold text-white mt-1">To: {activeJourney.destination}</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Trusted Contact: {activeJourney.trustedContacts[0]?.name} ({activeJourney.trustedContacts[0]?.phone})
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={simulateRouteDeviationDemo}
                    className="flex-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                  >
                    ⚡ Simulate Route Deviation
                  </button>
                  <button
                    onClick={endSafetyJourney}
                    className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium transition"
                  >
                    End Journey
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveModal('journey')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
              >
                Start Safety Journey
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ALERTS TAB                                                             */}
      {/* ========================================================================= */}
      {activeNav === 'alerts' && (
        <div className="space-y-4">
          <div className="border-b pb-3 border-slate-800">
            <h2 className="text-lg font-semibold">Event Safety Broadcasts</h2>
            <p className="text-xs text-slate-400">Direct notifications sent by Central Security Operations</p>
          </div>

          <div className="space-y-3">
            {alerts.map(a => (
              <div 
                key={a.id} 
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  a.type === 'CRITICAL' ? 'border-rose-500/40 bg-rose-500/5' :
                  darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-blue-500">{a.targetZone}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{a.createdAt}</span>
                </div>
                <h4 className="text-sm font-semibold">{a.title}</h4>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROFILE TAB                                                            */}
      {/* ========================================================================= */}
      {activeNav === 'profile' && (
        <div className="space-y-4">
          <div className="border-b pb-3 border-slate-800">
            <h2 className="text-lg font-semibold">Citizen Profile & Safety Settings</h2>
            <p className="text-xs text-slate-400">Permissions, emergency contacts, and privacy guards</p>
          </div>

          <div className={`p-5 rounded-2xl border space-y-4 text-xs ${
            darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-base">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{currentUser.name}</h3>
                <p className="text-slate-400">{currentUser.phone} • {currentUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <span>Location Sharing Permission:</span>
                <span className="font-mono text-emerald-400 font-semibold">Granted (Accurate to 5m)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Current Event Sector:</span>
                <span className="font-semibold">Deekshabhoomi Ground (Main Gate)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Emergency Broadcast Audio Siren:</span>
                <span className="text-blue-400 font-semibold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT INCIDENT (Section 10: Category first, then details)         */}
      {/* ========================================================================= */}
      {activeModal === 'incident' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-sm">Report an Incident</h3>
                <p className="text-[11px] text-slate-400">Step {incStep === 'category' ? '1: Select Category' : '2: Incident Details'}</p>
              </div>
              <button 
                onClick={() => {
                  setActiveModal('none');
                  setIncStep('category');
                }} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {incStep === 'category' && (
              <div className="space-y-3">
                <span className="text-xs text-slate-400 block">Select the category that best describes the event:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setIncCategory(cat.name);
                        setIncStep('details');
                      }}
                      className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                        darkMode 
                          ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500 hover:bg-slate-800' 
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <div>
                        <h4 className="font-medium text-xs">{cat.name}</h4>
                        <p className={`text-[10px] mt-0.5 line-clamp-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{cat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {incStep === 'details' && (
              <form onSubmit={handleIncidentSubmit} className="space-y-4 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                  <span className="font-semibold text-blue-400">Category: {incCategory}</span>
                  <button
                    type="button"
                    onClick={() => setIncStep('category')}
                    className="text-[11px] text-blue-300 underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="font-medium block mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a short description of the incident..."
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-medium block mb-1">Current Location (Auto-detected)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={incLocation}
                      onChange={(e) => setIncLocation(e.target.value)}
                      required
                      className={`flex-1 p-2.5 rounded-xl border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setIncLocation('Near Main Gate (GPS: 21.1290° N, 79.0660° E)')}
                      title="Refresh GPS"
                      className="px-3 rounded-xl border border-blue-500/30 text-blue-400 text-xs font-mono"
                    >
                      📍 GPS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-medium block mb-1">Optional Photo/Video Evidence</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={() => setIncPhoto('https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=300')}
                    className={`w-full p-2 rounded-xl border file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIncStep('category')}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}

            {incStep === 'success' && (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold">Incident Transmitted to Control Room</h4>
                <p className="text-xs text-slate-400">Case ID: <strong className="font-mono text-blue-400">{incSubmittedId}</strong></p>
                <p className="text-xs text-slate-400">Nearest available security marshal is being notified.</p>
                <button
                  onClick={() => {
                    setActiveModal('none');
                    setIncStep('category');
                    setIncDesc('');
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium mt-2"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT MISSING PERSON (Section 8: 4-Step Wizard)                   */}
      {/* ========================================================================= */}
      {activeModal === 'missing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-sm">Report Missing Person</h3>
                <p className="text-[11px] text-slate-400">Step {mspStep} of 4: {
                  mspStep === 1 ? 'Basic Details' :
                  mspStep === 2 ? 'Appearance & Identifying Features' :
                  mspStep === 3 ? 'Last Seen Location & Time' : 'Review & Submit'
                }</p>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Stepper Progress Indicator */}
            {!mspSubmittedId && (
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className={`h-1.5 rounded-full ${
                    mspStep >= step ? 'bg-blue-500' : darkMode ? 'bg-slate-800' : 'bg-slate-200'
                  }`} />
                ))}
              </div>
            )}

            {mspSubmittedId ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold">Missing Person Case Registered</h4>
                <p className="text-xs text-slate-400">
                  Case ID: <strong className="font-mono text-blue-400 text-sm">{mspSubmittedId}</strong>
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Alert pushed instantly to Control Room, exit marshals, and volunteer search parties.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setActiveModal('none');
                      switchRole('family');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                  >
                    Track in Family Portal
                  </button>
                  <button
                    onClick={() => setActiveModal('none')}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMissingSubmit} className="space-y-4 text-xs">
                
                {/* STEP 1: Basic Details */}
                {mspStep === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={mspName}
                        onChange={(e) => setMspName(e.target.value)}
                        required
                        className={`w-full p-2.5 rounded-xl border outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium block mb-1">Age (Years)</label>
                        <input
                          type="number"
                          value={mspAge}
                          onChange={(e) => setMspAge(Number(e.target.value))}
                          min={1}
                          max={110}
                          required
                          className={`w-full p-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="font-medium block mb-1">Gender</label>
                        <select
                          value={mspGender}
                          onChange={(e) => setMspGender(e.target.value as 'Female' | 'Male' | 'Other')}
                          className={`w-full p-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-medium block mb-1">Recent Photo</label>
                      <div className="flex items-center gap-3">
                        <img 
                          src={mspPhoto} 
                          alt="Preview" 
                          className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setMspPhoto(URL.createObjectURL(file));
                            }}
                            className={`w-full p-2 rounded-xl border file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-blue-600 file:text-white ${
                              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMspStep(2)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                      >
                        Next: Appearance →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Appearance & Identifying Features */}
                {mspStep === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium block mb-1">Clothing Worn</label>
                      <input
                        type="text"
                        placeholder="e.g. Yellow floral dress, red hairband"
                        value={mspClothing}
                        onChange={(e) => setMspClothing(e.target.value)}
                        required
                        className={`w-full p-2.5 rounded-xl border outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="font-medium block mb-1">Identifying Features</label>
                      <textarea
                        rows={2}
                        placeholder="Birthmark, scars, eyeglasses, height, hair color..."
                        value={mspFeatures}
                        onChange={(e) => setMspFeatures(e.target.value)}
                        required
                        className={`w-full p-2.5 rounded-xl border outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="font-medium block mb-1">Medical or Special Care Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="Medication, allergies, speech needs..."
                        value={mspMedical}
                        onChange={(e) => setMspMedical(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setMspStep(1)}
                        className="px-4 py-2 text-slate-400 hover:text-white"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setMspStep(3)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                      >
                        Next: Last Seen →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Last Seen Location & Time */}
                {mspStep === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium block mb-1">Last Seen Zone / Location</label>
                      <select
                        value={mspLocation}
                        onChange={(e) => setMspLocation(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <option value="Exit B (East Gate Corridor)">Exit B (East Gate Corridor)</option>
                        <option value="Main Gate (Security Arch)">Main Gate (Security Arch)</option>
                        <option value="Stage / Stupa Memorial Plaza">Stage / Stupa Memorial Plaza</option>
                        <option value="Exit A (North Promenade)">Exit A (North Promenade)</option>
                        <option value="Parking Area West">Parking Area West</option>
                        <option value="Medical Zone">Medical Zone</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium block mb-1">Last Seen Time</label>
                        <input
                          type="text"
                          value={mspTime}
                          onChange={(e) => setMspTime(e.target.value)}
                          required
                          className={`w-full p-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="font-medium block mb-1">Emergency Phone</label>
                        <input
                          type="tel"
                          value={mspContact}
                          onChange={(e) => setMspContact(e.target.value)}
                          required
                          className={`w-full p-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setMspStep(2)}
                        className="px-4 py-2 text-slate-400 hover:text-white"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setMspStep(4)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                      >
                        Review & Confirm →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review and Submit */}
                {mspStep === 4 && (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-700/60">
                        <img src={mspPhoto} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-600" />
                        <div>
                          <h4 className="font-bold text-sm">{mspName}</h4>
                          <p className="text-slate-400">{mspAge} years old • {mspGender}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="text-slate-400">Clothing:</span> {mspClothing}</div>
                        <div><span className="text-slate-400">Location:</span> {mspLocation}</div>
                        <div><span className="text-slate-400">Last Seen:</span> {mspTime}</div>
                        <div><span className="text-slate-400">Phone:</span> {mspContact}</div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      🔒 Sensitive details will only be accessible to authorized law enforcement and field marshals.
                    </p>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setMspStep(3)}
                        className="px-4 py-2 text-slate-400 hover:text-white"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        Confirm & Transmit Report
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURE SAFETY JOURNEY (Section 17)                              */}
      {/* ========================================================================= */}
      {activeModal === 'journey' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-sm">Start Personal Safety Journey</h3>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!destInput.trim()) return;
              startSafetyJourney(destInput, [{ name: contactName, phone: contactPhone }]);
              setActiveModal('none');
            }} className="space-y-4 text-xs">
              <div>
                <label className="font-medium block mb-1">Destination</label>
                <input
                  type="text"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  placeholder="e.g. Metro Station, Parking Area, Hotel..."
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-medium block mb-1">Trusted Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-medium block mb-1">Trusted Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  Begin Journey Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EMERGENCY SOS CONFIRMATION                                         */}
      {/* ========================================================================= */}
      {activeModal === 'emergency_confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/50 bg-slate-900 text-white p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-600/30 text-rose-500 border border-rose-500/50 flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>

            <h3 className="text-base font-bold text-rose-400">Trigger Emergency 1-Tap SOS</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This triggers a high-priority alarm at Nagpur Police Control and dispatches the nearest field marshal to your exact GPS coordinates.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  triggerEmergencySOS();
                  setActiveModal('none');
                }}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30"
              >
                CONFIRM EMERGENCY DISPATCH
              </button>
              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
