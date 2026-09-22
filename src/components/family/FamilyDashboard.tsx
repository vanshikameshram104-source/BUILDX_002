import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MissingPerson, MissingPersonType, MissingPersonStatus } from '../../types';
import { SecurityMap } from '../common/SecurityMap';
import { 
  Users, UserPlus, HeartPulse, Search, ShieldAlert, 
  Clock, MapPin, CheckCircle2, AlertCircle, Camera, 
  Sparkles, Lock, Phone, ChevronRight, Eye
} from 'lucide-react';

export const FamilyDashboard: React.FC = () => {
  const { 
    currentUser, 
    missingPersons, 
    reportMissingPerson, 
    simulateMissingPersonDemo,
    darkMode 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'track' | 'report'>('track');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('MSP-2026-00124');

  // Form state
  const [personType, setPersonType] = useState<MissingPersonType>('child');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(6);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [clothing, setClothing] = useState('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('Exit B (East Gate)');
  const [lastSeenTime, setLastSeenTime] = useState('5:32 PM');
  const [emergencyContact, setEmergencyContact] = useState('+91 98230 11223');
  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1595454223600-91fbdd774780?w=300'
  );

  const selectedCase = missingPersons.find(m => m.id === selectedCaseId) || missingPersons[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = reportMissingPerson({
      name,
      age,
      gender,
      personType,
      photo: photoPreview,
      clothing,
      identifyingFeatures,
      medicalNotes: medicalNotes || undefined,
      lastSeenLocation,
      latitude: 21.1275,
      longitude: 79.0690,
      lastSeenTime,
      reporterId: currentUser.id,
      reporterName: `${currentUser.name} (Family)`,
      emergencyContact
    });

    setSelectedCaseId(created.id);
    setActiveTab('track');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const statusSteps: MissingPersonStatus[] = [
    'REPORTED',
    'SEARCHING',
    'POSSIBLE MATCH',
    'FOUND',
    'CLOSED'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              FAMILY SAFETY & MISSING PERSONS PORTAL
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Child & Elderly Assistance System
          </h1>
          <p className="text-xs text-slate-400">
            Immediate multi-channel broadcast to all on-duty security marshals, police posts, and exit gates
          </p>
        </div>

        {/* Tab switch / action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'track' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-400 hover:text-white bg-slate-800/80'
            }`}
          >
            <Search className="w-4 h-4" /> Track Case Status
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'report' 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'text-slate-400 hover:text-white bg-slate-800/80'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Report Missing Person
          </button>
        </div>
      </div>

      {/* TRACK TAB: Active Case Tracker & Privacy Guard */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          
          {/* Quick Case Switcher Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 shrink-0 font-medium">Select Case:</span>
            {missingPersons.map(person => (
              <button
                key={person.id}
                onClick={() => setSelectedCaseId(person.id)}
                className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap flex items-center gap-2 ${
                  selectedCase?.id === person.id
                    ? 'bg-blue-600 border-blue-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{person.name} ({person.id})</span>
                <span className={`text-[10px] px-1 rounded ${
                  person.status === 'FOUND' ? 'bg-emerald-500/30 text-emerald-300' :
                  person.status === 'POSSIBLE MATCH' ? 'bg-amber-500/30 text-amber-300' :
                  'bg-blue-500/30 text-blue-300'
                }`}>
                  {person.status}
                </span>
              </button>
            ))}
          </div>

          {selectedCase && (
            <div className={`p-6 rounded-2xl border shadow-xl ${
              darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              
              {/* Case Header with Status Stepper */}
              <div className="border-b border-slate-800 pb-5 mb-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedCase.photo} 
                      alt={selectedCase.name} 
                      className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500/50 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-white">{selectedCase.name}</h2>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                          {selectedCase.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedCase.age} Years Old • {selectedCase.gender} • <span className="capitalize font-semibold text-slate-300">{selectedCase.personType}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">Case Status</span>
                    <span className={`text-sm font-black font-mono px-3 py-1 rounded-lg inline-block mt-0.5 ${
                      selectedCase.status === 'FOUND' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      selectedCase.status === 'POSSIBLE MATCH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}>
                      {selectedCase.status}
                    </span>
                  </div>
                </div>

                {/* 5-Step Status Stepper: REPORTED -> SEARCHING -> POSSIBLE MATCH -> FOUND -> CLOSED */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="grid grid-cols-5 gap-2">
                    {statusSteps.map((step, idx) => {
                      const curIdx = statusSteps.indexOf(selectedCase.status);
                      const isPassed = curIdx >= idx;
                      const isCurrent = curIdx === idx;

                      return (
                        <div key={step} className="text-center">
                          <div className={`h-2 rounded-full mb-1.5 transition-all ${
                            isPassed ? 'bg-blue-500' : 'bg-slate-800'
                          } ${isCurrent ? 'ring-2 ring-blue-400/60 shadow-lg shadow-blue-500/30' : ''}`} />
                          <span className={`text-[10px] font-mono font-bold block truncate ${
                            isPassed ? 'text-blue-300' : 'text-slate-500'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Case Details & Last Known Location Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Descriptive Information */}
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Physical Description & Clothing
                    </span>
                    <p className="text-slate-200"><strong className="text-slate-400">Clothing:</strong> {selectedCase.clothing}</p>
                    <p className="text-slate-200"><strong className="text-slate-400">Identifying Features:</strong> {selectedCase.identifyingFeatures}</p>
                    {selectedCase.medicalNotes && (
                      <p className="text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                        <strong>Medical Information:</strong> {selectedCase.medicalNotes}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Last Known Location & Time
                    </span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-semibold text-white">{selectedCase.lastSeenLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Last seen at {selectedCase.lastSeenTime}</span>
                    </div>
                  </div>

                  {/* Privacy Guard Notice (Section 6 & 25) */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-300 text-[11px] block">Privacy & Child Protection Active</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Emergency contacts ({selectedCase.emergencyContact}) and medical notes are shielded from public viewers and encrypted for authorized security personnel only.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tactical Perimeter Search Map Preview */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Search Perimeter & Nearby Security Posts
                  </span>
                  <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 min-h-[220px]">
                    <SecurityMap 
                      height="240px" 
                      selectedMissingId={selectedCase.id} 
                    />
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* REPORT TAB: Register Missing Child or Elderly Person */}
      {activeTab === 'report' && (
        <div className={`p-6 rounded-2xl border shadow-xl ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-500" /> Report Missing Person Form
              </h2>
              <p className="text-xs text-slate-400">
                Immediately broadcasts to Control Room, nearby field volunteers, and exit gates
              </p>
            </div>

            {/* Quick Demo Pre-fill */}
            <button
              type="button"
              onClick={() => {
                setPersonType('child');
                setName('Ananya Verma');
                setAge(6);
                setGender('Female');
                setClothing('Bright yellow floral frock, red hairband, white sandals');
                setIdentifyingFeatures('Small scar near left eyebrow, pink water pouch');
                setLastSeenLocation('Exit B (East Gate)');
                setLastSeenTime('5:32 PM');
                setEmergencyContact('+91 98230 11223');
                setPhotoPreview('https://images.unsplash.com/photo-1595454223600-91fbdd774780?w=300');
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold border border-blue-500/40 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Pre-fill 6yo Ananya Demo
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            
            {/* Person Category: Child vs Elderly vs Adult */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Category</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPersonType('child')}
                  className={`p-3 rounded-xl border text-center font-bold transition ${
                    personType === 'child'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  👶 Child Assistance
                </button>

                <button
                  type="button"
                  onClick={() => setPersonType('elderly')}
                  className={`p-3 rounded-xl border text-center font-bold transition ${
                    personType === 'elderly'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  👴 Elderly Assistance
                </button>

                <button
                  type="button"
                  onClick={() => setPersonType('adult')}
                  className={`p-3 rounded-xl border text-center font-bold transition ${
                    personType === 'adult'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  👤 Adult
                </button>
              </div>
            </div>

            {/* Name, Age, Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-lg border outline-none font-semibold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Age</label>
                <input
                  type="number"
                  min="1"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  required
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Female' | 'Male' | 'Other')}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Photo & Clothing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Recent Photo</label>
                <div className="flex items-center gap-3">
                  <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Clothing When Last Seen</label>
                <input
                  type="text"
                  placeholder="e.g. Yellow floral dress, red hairband, sandals"
                  value={clothing}
                  onChange={(e) => setClothing(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                />
              </div>
            </div>

            {/* Identifying Features & Medical Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Identifying Features</label>
                <input
                  type="text"
                  placeholder="e.g. Mole on left cheek, birthmark, glasses"
                  value={identifyingFeatures}
                  onChange={(e) => setIdentifyingFeatures(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Optional Medical Info (Especially for Elderly)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diabetic, mild dementia, pacemaker"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                />
              </div>
            </div>

            {/* Last Seen Location, Time, Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Last Seen Location</label>
                <select
                  value={lastSeenLocation}
                  onChange={(e) => setLastSeenLocation(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                >
                  <option value="Exit B (East Gate)">Exit B (East Gate)</option>
                  <option value="Main Gate Entrance">Main Gate Entrance</option>
                  <option value="Stage Area / Stupa Plaza">Stage Area / Stupa Plaza</option>
                  <option value="Exit A (North Gate)">Exit A (North Gate)</option>
                  <option value="Parking Area (West)">Parking Area (West)</option>
                  <option value="Medical Zone">Medical Zone</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Last Seen Time</label>
                <input
                  type="text"
                  placeholder="e.g. 5:32 PM"
                  value={lastSeenTime}
                  onChange={(e) => setLastSeenTime(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-lg border outline-none font-semibold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                🔒 Protected under SafeNet Privacy Framework
              </span>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xl shadow-rose-600/30 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Submit Missing Person Report (Generate Case ID)</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
