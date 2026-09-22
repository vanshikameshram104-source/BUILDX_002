import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { Navbar } from './components/layout/Navbar';
import { CitizenView } from './components/citizen/CitizenView';
import { ControlRoomView } from './components/controlRoom/ControlRoomView';
import { FamilyDashboard } from './components/family/FamilyDashboard';
import { VolunteerDashboard } from './components/volunteer/VolunteerDashboard';
import { PoliceDashboard } from './components/police/PoliceDashboard';
import { SecurityChallengesView } from './components/challenges/SecurityChallengesView';
import { GuidedTourModal } from './components/demo/GuidedTourModal';
import { DemoBar } from './components/demo/DemoBar';
import { Shield } from 'lucide-react';
import { AppView } from './types';

const MainLayout: React.FC = () => {
  const { currentView, navigateTo, darkMode, isTourActive, setIsTourActive } = useApp();
  const [showDemoBar, setShowDemoBar] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      darkMode ? 'bg-[#0f1117] text-slate-100' : 'bg-[#fafafa] text-slate-900'
    }`}>
      
      {/* If Landing Page view, render the LandingPage */}
      {currentView === 'landing' ? (
        <>
          <LandingPage 
            onEnterApp={(targetRole = 'citizen') => {
              const viewMap: Record<string, AppView> = {
                citizen: 'citizen',
                family: 'family',
                volunteer: 'volunteer',
                police: 'police',
                admin: 'control_room',
              };
              navigateTo(viewMap[targetRole] || 'citizen', targetRole);
            }}
            onOpenReport={() => {
              navigateTo('citizen', 'citizen');
            }}
            onOpenChallenges={() => {
              navigateTo('challenges');
            }}
          />
          {/* Subtle Demo Tour Trigger on Landing */}
          <div className="fixed bottom-4 right-4 z-40">
            <button
              onClick={() => setIsTourActive(true)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border shadow-lg backdrop-blur-md transition flex items-center gap-2 ${
                darkMode 
                  ? 'bg-slate-900/90 border-blue-500/30 text-blue-400 hover:bg-slate-800' 
                  : 'bg-white/95 border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Evaluator Demo Flow</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Main App Navbar */}
          <Navbar 
            currentView={currentView}
            onNavigate={(v) => navigateTo(v)}
            onOpenTour={() => setIsTourActive(true)}
          />

          {/* Core Content Area */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
            {currentView === 'citizen' && <CitizenView />}
            {currentView === 'family' && <FamilyDashboard />}
            {currentView === 'volunteer' && <VolunteerDashboard />}
            {currentView === 'police' && <PoliceDashboard />}
            {currentView === 'control_room' && <ControlRoomView />}
            {currentView === 'challenges' && <SecurityChallengesView />}
          </main>

          {/* Minimal Floating Demo Bar Toggle */}
          <div className="fixed bottom-3 right-4 z-30 flex items-center gap-2">
            <button
              onClick={() => setShowDemoBar(!showDemoBar)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono shadow-md backdrop-blur-md transition flex items-center gap-1.5 ${
                showDemoBar 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20' 
                  : darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span>⚡</span>
              <span>{showDemoBar ? 'Hide Sim Bar' : 'Quick Sim Controls'}</span>
            </button>
          </div>

          {showDemoBar && (
            <DemoBar onOpenTour={() => setIsTourActive(true)} />
          )}

          {/* Minimal, Calm Footer */}
          <footer className={`border-t py-6 text-xs text-center transition-colors ${
            darkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-400'
          }`}>
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>SafeNet • Real-Time Public Safety & Emergency Coordination Platform</p>
              <p className="font-mono text-[11px]">Deekshabhoomi, Nagpur • Deployment v1.0-MVP</p>
            </div>
          </footer>
        </>
      )}

      {/* Guided Tour Modal */}
      <GuidedTourModal 
        isOpen={isTourActive} 
        onClose={() => setIsTourActive(false)} 
      />

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
