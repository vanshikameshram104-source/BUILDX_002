import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MissingPerson } from '../../types';
import { 
  ScanFace, CheckCircle2, XCircle, AlertCircle, 
  Camera, Upload, Sparkles, UserCheck, ShieldAlert, Clock, MapPin
} from 'lucide-react';

export const AIMissingPersonMatcher: React.FC = () => {
  const { missingPersons, verifyAIMatch, simulateAIMatchDemo, darkMode } = useApp();

  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    missingPersons.find(m => m.aiMatchConfidence)?.id || missingPersons[0]?.id || ''
  );
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const selectedPerson = missingPersons.find(m => m.id === selectedPersonId) || missingPersons[0];

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      simulateAIMatchDemo();
    }, 1200);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        simulateAIMatchDemo();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer / Human-in-the-loop Guardrail */}
      <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/40 backdrop-blur-sm flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-200">
            Mandatory Protocol: Human-in-the-Loop AI Verification
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            AI facial biometric matching is an investigative assistance prototype. In compliance with public safety protocols, 
            the system <strong className="text-white">never automatically detains or declares a match</strong>. 
            All algorithmic correlations require physical verification by authorized field security personnel.
          </p>
        </div>
      </div>

      {/* Main Grid: Registered Cases vs Camera Match Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered Missing Persons Roster */}
        <div className={`lg:col-span-4 rounded-xl border p-4 shadow-sm flex flex-col ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ScanFace className="w-4 h-4 text-blue-400" /> Active Missing Persons
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              {missingPersons.filter(m => m.status !== 'CLOSED').length} Registered
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {missingPersons.map(person => {
              const isSelected = person.id === selectedPerson?.id;
              const hasMatch = Boolean(person.aiMatchConfidence && !person.aiMatchVerified);

              return (
                <div
                  key={person.id}
                  onClick={() => setSelectedPersonId(person.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                    isSelected 
                      ? 'border-blue-500 ring-1 ring-blue-500/50 bg-slate-800/90' 
                      : darkMode ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                    <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                    {hasMatch && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 animate-ping" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{person.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{person.age}y</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">Last: {person.lastSeenLocation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        person.status === 'FOUND' ? 'bg-emerald-500/20 text-emerald-400' :
                        person.status === 'POSSIBLE MATCH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {person.status}
                      </span>
                      {person.aiMatchConfidence && (
                        <span className="text-[9px] font-mono text-amber-300 font-bold">
                          AI: {person.aiMatchConfidence}% Match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Simulation Trigger */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isScanning ? 'Analyzing Surveillance Stream...' : 'Simulate Camera CCTV Match (Step 10)'}
            </button>
          </div>
        </div>

        {/* Right Column: Side-by-Side Biometric Comparison */}
        <div className={`lg:col-span-8 rounded-xl border p-5 shadow-sm flex flex-col ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {selectedPerson ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedPerson.name}</h3>
                    <span className="text-xs font-mono text-blue-400">Case ID: {selectedPerson.id}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: <span className="capitalize font-semibold text-slate-300">{selectedPerson.personType}</span> • 
                    Reported by: <span className="text-slate-300">{selectedPerson.reporterName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Upload Query Frame</span>
                    <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Side by Side Image Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Registered Photo */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80 mb-2">
                    <span className="font-semibold text-white">Registered Family Photo</span>
                    <span className="text-[10px] font-mono">ENROLLED</span>
                  </div>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-800">
                    <img 
                      src={selectedPerson.photo} 
                      alt="Registered" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white backdrop-blur-sm">
                      {selectedPerson.clothing.slice(0, 30)}...
                    </div>
                  </div>
                </div>

                {/* CCTV Frame Match */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80 mb-2">
                    <span className="font-semibold text-white">Surveillance Feed Match</span>
                    <span className="text-[10px] font-mono text-amber-400">
                      {selectedPerson.aiMatchLocation || 'CCTV #04 - Exit B'}
                    </span>
                  </div>

                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-amber-500/50">
                    {isScanning ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-blue-400 space-y-2">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-mono animate-pulse">Running DeepFace Embeddings...</span>
                      </div>
                    ) : selectedPerson.aiMatchPhoto || uploadedImage ? (
                      <>
                        <img 
                          src={uploadedImage || selectedPerson.aiMatchPhoto || selectedPerson.photo} 
                          alt="CCTV Frame" 
                          className="w-full h-full object-cover"
                        />
                        {/* Biometric Target Mesh Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/70 m-4 rounded flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border border-amber-400/80 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          </div>
                        </div>

                        {/* Match Confidence Badge */}
                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-black shadow-lg">
                          {selectedPerson.aiMatchConfidence || 91}% CONFIDENCE
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/80 text-[10px] text-slate-200 backdrop-blur-sm flex justify-between">
                          <span>Detected: {selectedPerson.aiMatchTime || '5:42 PM'}</span>
                          <span>Euclidean Dist: 0.12</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                        <Camera className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs">No candidate detection logged yet.</p>
                        <button
                          onClick={handleSimulateScan}
                          className="mt-2 text-xs text-blue-400 underline hover:text-blue-300"
                        >
                          Simulate detection now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Human Verification Action Bar */}
              {selectedPerson.aiMatchConfidence && !selectedPerson.aiMatchVerified && (
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 backdrop-blur-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Operator Action Required: Verify Physical Match
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Candidate matches physical description (yellow floral dress, 6-year-old female) detected near Exit B corridor.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => verifyAIMatch(selectedPerson.id, true)}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" /> 
                      Human Verified: Confirm Child Located & Alert Exit B Officers
                    </button>

                    <button
                      onClick={() => verifyAIMatch(selectedPerson.id, false)}
                      className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject False Positive
                    </button>
                  </div>
                </div>
              )}

              {selectedPerson.aiMatchVerified && (
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Case verified by Control Room! Field marshals dispatched to unite family. Status: FOUND.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              Select a missing person case from the roster to inspect AI biometric correlations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
