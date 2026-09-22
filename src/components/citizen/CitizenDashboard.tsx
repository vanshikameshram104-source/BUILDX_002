import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentCategory, IncidentPriority } from '../../types';
import { 
  AlertTriangle, ShieldAlert, HeartPulse, Search, MapPin, 
  PhoneCall, Users, Navigation, Radio, CheckCircle2, Clock, 
  Send, Compass, AlertCircle, Sparkles, X, ChevronRight, Bell
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { 
    currentUser, 
    incidents, 
    reportIncident, 
    alerts, 
    activeJourney, 
    startSafetyJourney, 
    endSafetyJourney, 
    respondToDeviation, 
    triggerEmergencySOS,
    simulateRouteDeviationDemo,
    darkMode 
  } = useApp();

  const [activeModal, setActiveModal] = useState<'none' | 'sos' | 'incident' | 'journey' | 'alerts' | 'my_reports'>('none');

  // Incident Form state
  const [incCategory, setIncCategory] = useState<IncidentCategory>('Chain Snatching');
  const [incDesc, setIncDesc] = useState('');
  const [incLocation, setIncLocation] = useState('Gate 2 Perimeter / Main Gate');
  const [incMediaName, setIncMediaName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  // Safety Journey state
  const [destInput, setDestInput] = useState('Metro Station Pillar #124');
  const [contactName, setContactName] = useState('Rajesh Sharma (Father)');
  const [contactPhone, setContactPhone] = useState('+91 98230 11223');
  const [deviationTimer, setDeviationTimer] = useState<number>(45);

  // Countdown for route deviation auto-alert
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (activeJourney && activeJourney.routeStatus === 'DEVIATION_DETECTED') {
      timer = setInterval(() => {
        setDeviationTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            respondToDeviation(false); // auto-trigger alert
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeJourney, respondToDeviation]);

  // Compute smart priority based on category
  const getAutoPriority = (cat: IncidentCategory): IncidentPriority => {
    if (cat === 'Medical Emergency' || cat === 'Fire' || cat === 'Crowd Emergency' || cat === 'Missing Person') {
      return 'CRITICAL';
    }
    if (cat === 'Chain Snatching' || cat === 'Harassment') {
      return 'HIGH';
    }
    if (cat === 'Suspicious Activity' || cat === 'Accident') {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDesc.trim()) return;

    setIsSubmitting(true);
    const priority = getAutoPriority(incCategory);

    const created = reportIncident({
      category: incCategory,
      description: incDesc,
      location: incLocation,
      latitude: currentUser.currentLocation?.lat || 21.1290,
      longitude: currentUser.currentLocation?.lng || 79.0660,
      priority,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone,
      photo: incMediaName ? 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=300' : undefined
    });

    setIsSubmitting(false);
    setLastSubmittedId(created.id);
    setIncDesc('');
    setIncMediaName(null);
  };

  const handleStartJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destInput.trim()) return;

    startSafetyJourney(destInput, [
      { name: contactName, phone: contactPhone }
    ]);
    setActiveModal('none');
  };

  // Filter citizen's own submitted reports
  const myReports = incidents.filter(i => i.reporterId === currentUser.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      
      {/* Citizen Welcome Card */}
      <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
        darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'} 
              alt={currentUser.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50"
            />
            <div>
              <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                SafeNet Citizen Portal
              </span>
              <h2 className="text-lg font-bold text-white">Welcome, {currentUser.name}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Current Zone: <strong className="text-slate-300">{currentUser.currentLocation?.zoneName || 'Deekshabhoomi Ground'}</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Live Network Active
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE EMERGENCY BROADCAST NOTIFICATION BANNER */}
      {alerts.length > 0 && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-md ${
          alerts[0].type === 'CRITICAL' ? 'bg-rose-950/40 border-rose-500/50' : 'bg-amber-950/40 border-amber-500/50'
        }`}>
          <div className="p-2 rounded-lg bg-rose-600/30 text-rose-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px]">
                {alerts[0].type} BROADCAST ({alerts[0].targetZone})
              </span>
              <span className="text-slate-400 font-mono text-[10px]">{alerts[0].createdAt}</span>
            </div>
            <h4 className="font-bold text-sm text-white mt-0.5">{alerts[0].title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{alerts[0].message}</p>
          </div>
        </div>
      )}

      {/* ACTIVE SAFETY JOURNEY STATUS CARD */}
      {activeJourney && (
        <div className={`p-5 rounded-2xl border shadow-xl relative overflow-hidden transition-all ${
          activeJourney.routeStatus === 'DEVIATION_DETECTED' 
            ? 'bg-gradient-to-br from-rose-950/90 to-slate-900 border-rose-500 animate-pulse-slow' 
            : 'bg-slate-900/90 border-blue-500/40'
        }`}>
          {activeJourney.routeStatus === 'DEVIATION_DETECTED' ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white animate-bounce shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                      ⚠️ ROUTE DEVIATION DETECTED
                    </span>
                    <span className="text-xs text-rose-300 font-mono font-bold">Auto-Alert in {deviationTimer}s</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Your current route differs significantly from your planned route.
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Location: <span className="font-semibold text-white">{activeJourney.currentLocation.address}</span>
                  </p>
                </div>
              </div>

              {/* Citizen Response Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => respondToDeviation(true)}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>I'M SAFE</span>
                </button>

                <button
                  onClick={() => respondToDeviation(false)}
                  className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>SEND ALERT</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                    Safety Journey Active
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">Heading to: {activeJourney.destination}</h4>
                <p className="text-xs text-slate-400">
                  Sharing live coordinates with {activeJourney.trustedContacts.length} trusted contacts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={simulateRouteDeviationDemo}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold border border-amber-500/40 transition"
                  title="Simulate route deviation for demo"
                >
                  Simulate Deviation
                </button>
                <button
                  onClick={endSafetyJourney}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  End Journey
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. HERO EMERGENCY SOS BUTTON (1-TAP ACTION) */}
      <div className="text-center pt-2">
        <button
          onClick={() => triggerEmergencySOS()}
          className="group relative inline-flex items-center justify-center w-full max-w-md py-6 px-8 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xl tracking-wider shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all pulse-critical border-2 border-red-400/40"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="text-left">
              <span className="block text-2xl font-black leading-tight">EMERGENCY SOS</span>
              <span className="block text-xs font-medium opacity-90 tracking-normal">
                Instant 1-Tap Police & Medical Dispatch
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 2. PRIMARY ACTION CARDS (Section 5 Requirements) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Report Incident */}
        <button
          onClick={() => setActiveModal('incident')}
          className={`p-5 rounded-2xl border text-left transition hover:scale-[1.02] group shadow-sm flex flex-col justify-between ${
            darkMode ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-3 group-hover:bg-blue-500/20 transition">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Report Incident</h3>
            <p className="text-xs text-slate-400 mt-1">Theft, medical, fire, crowding, or harassment</p>
          </div>
        </button>

        {/* Safety Journey */}
        <button
          onClick={() => setActiveModal('journey')}
          className={`p-5 rounded-2xl border text-left transition hover:scale-[1.02] group shadow-sm flex flex-col justify-between ${
            darkMode ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3 group-hover:bg-emerald-500/20 transition">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Safety Journey</h3>
            <p className="text-xs text-slate-400 mt-1">Live tracking with route deviation alerts</p>
          </div>
        </button>

        {/* View Alerts */}
        <button
          onClick={() => setActiveModal('alerts')}
          className={`p-5 rounded-2xl border text-left transition hover:scale-[1.02] group shadow-sm flex flex-col justify-between ${
            darkMode ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3 group-hover:bg-purple-500/20 transition">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">View Alerts</h3>
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                  {alerts.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Official crowd warnings & safety guidance</p>
          </div>
        </button>

        {/* My Reports */}
        <button
          onClick={() => setActiveModal('my_reports')}
          className={`p-5 rounded-2xl border text-left transition hover:scale-[1.02] group shadow-sm flex flex-col justify-between ${
            darkMode ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3 group-hover:bg-amber-500/20 transition">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">My Reports</h3>
              <span className="text-xs font-mono text-slate-400">{myReports.length}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Live status tracking: Reported to Resolved</p>
          </div>
        </button>
      </div>

      {/* 3. SUBMITTED REPORT LIVE STATUS TRACKER */}
      {myReports.length > 0 && (
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Recent Report Status
            </h3>
            <span className="text-xs text-blue-400 font-mono font-bold">
              {myReports[0].id}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{myReports[0].category}</h4>
                <p className="text-xs text-slate-400">{myReports[0].location} • {myReports[0].createdAt}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                myReports[0].status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                myReports[0].status === 'RESPONDING' ? 'bg-blue-500/20 text-blue-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {myReports[0].status}
              </span>
            </div>

            {/* Stepper Progression: REPORTED -> ACKNOWLEDGED -> ASSIGNED -> RESPONDING -> RESOLVED */}
            <div className="grid grid-cols-5 gap-1 pt-2">
              {['REPORTED', 'ACKNOWLEDGED', 'ASSIGNED', 'RESPONDING', 'RESOLVED'].map((step, idx) => {
                const statuses = ['REPORTED', 'ACKNOWLEDGED', 'ASSIGNED', 'RESPONDING', 'RESOLVED'];
                const currentIdx = statuses.indexOf(myReports[0].status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step} className="text-center">
                    <div className={`h-1.5 rounded-full mb-1 transition-all ${
                      isPassed ? 'bg-blue-500' : 'bg-slate-800'
                    } ${isCurrent ? 'ring-2 ring-blue-400/50' : ''}`} />
                    <span className={`text-[9px] block truncate font-mono ${
                      isPassed ? 'text-blue-300 font-bold' : 'text-slate-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {myReports[0].assignedResponderName && (
              <p className="text-xs text-slate-300 pt-1">
                Assigned Responder: <strong className="text-emerald-400">{myReports[0].assignedResponderName}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. EVENT SAFETY & MEDICAL DESK DIRECTORY */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">
          Deekshabhoomi Emergency Helplines & First Aid
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Police Control Booth:</span>
            <span className="font-bold text-white">Main Gate Post #01</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Medical Emergency Post:</span>
            <span className="font-bold text-white">Medical Zone (Ambulance 108)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REPORT INCIDENT */}
      {/* ========================================================================= */}
      {activeModal === 'incident' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-5 ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Report Security Incident</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {lastSubmittedId ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-white">Incident Successfully Transmitted!</h4>
                <p className="text-xs text-slate-300">
                  Assigned Case ID: <strong className="font-mono text-blue-400">{lastSubmittedId}</strong>.
                  The Central Control Room and nearest responders have been notified.
                </p>
                <button
                  onClick={() => { setLastSubmittedId(null); setActiveModal('none'); }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleIncidentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Incident Category</label>
                  <select
                    value={incCategory}
                    onChange={(e) => setIncCategory(e.target.value as IncidentCategory)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-medium ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    <option value="Chain Snatching">Chain Snatching / Theft</option>
                    <option value="Medical Emergency">Medical Emergency / Collapse</option>
                    <option value="Crowd Emergency">Crowd Emergency / Stampede Risk</option>
                    <option value="Suspicious Activity">Suspicious Activity / Unattended Bag</option>
                    <option value="Fire">Fire / Smoke</option>
                    <option value="Harassment">Harassment / Misbehavior</option>
                    <option value="Accident">Accident / Fall</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Incident Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific details (suspect description, direction fled, injuries, etc.)..."
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-lg border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Location (Auto-Captured GPS)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={incLocation}
                      onChange={(e) => setIncLocation(e.target.value)}
                      required
                      className={`flex-1 p-2.5 rounded-lg border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                      }`}
                    />
                    <span className="px-3 py-2.5 bg-blue-500/20 text-blue-400 rounded-lg font-mono text-[11px] whitespace-nowrap">
                      📍 GPS Lock
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Attach Photo Evidence (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIncMediaName(e.target.files?.[0]?.name || null)}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700"
                  />
                  {incMediaName && <span className="text-[11px] text-emerald-400 mt-1 block">Attached: {incMediaName}</span>}
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal('none')}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-2 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Incident Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SAFETY JOURNEY SETUP */}
      {/* ========================================================================= */}
      {activeModal === 'journey' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-5 ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Start Personal Safety Journey</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleStartJourney} className="space-y-4 text-xs">
              <p className="text-slate-300">
                SafeNet tracks your coordinates within the venue perimeter. If you stop moving or unexpectedly deviate from your destination corridor, an alert will be dispatched to your trusted contacts.
              </p>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Destination</label>
                <input
                  type="text"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  placeholder="e.g. Metro Station Pillar #124 or West Car Parking"
                  required
                  className={`w-full p-2.5 rounded-lg border outline-none font-semibold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Trusted Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-lg border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Emergency Phone #</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-lg border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-2 shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Activate Journey Tracking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW ALERTS */}
      {/* ========================================================================= */}
      {activeModal === 'alerts' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-5 ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Active Venue Broadcasts</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {alerts.map(a => (
                <div key={a.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-purple-400">{a.targetZone}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{a.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{a.title}</h4>
                  <p className="text-xs text-slate-300">{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MY REPORTS */}
      {/* ========================================================================= */}
      {activeModal === 'my_reports' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-5 ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">My Submitted Reports</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {myReports.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-xs">You have not submitted any incidents yet.</p>
              ) : (
                myReports.map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-blue-400">{r.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 font-mono">
                        {r.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{r.category}</h4>
                    <p className="text-xs text-slate-300">{r.description}</p>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>{r.location}</span>
                      <span>{r.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
