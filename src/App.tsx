import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IntroAnimation } from './components/IntroAnimation';
import { Home } from './pages/Home';
import { ProjectProvider } from './context/ProjectContext';
import { useProjectContext } from './context/useProjectContext';
import { Header } from './components/layout/Header';
import { AuthPages } from './components/auth/AuthPages';
import { EmployeeCardsGrid } from './components/employees/EmployeeCardsGrid';
import { AttendanceView } from './components/attendance/AttendanceView';
import { TimeOffView } from './components/timeoff/TimeOffView';
import { EmployeeProfileModal } from './components/profile/EmployeeProfileModal';
import { Users, Calendar, Plane } from 'lucide-react';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const { activeView, setActiveView, setAuthMode, currentUser } = useProjectContext();

  if (showIntro) {
    return (
      <AnimatePresence mode="wait">
        <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />
      </AnimatePresence>
    );
  }

  // Preserve team member's landing page when activeView is 'home'
  if (activeView === 'home') {
    return (
      <Home
        key="home"
        onSignIn={() => {
          setActiveView('auth');
          setAuthMode('signin');
        }}
        onGetStarted={() => {
          setActiveView('auth');
          setAuthMode('signup');
        }}
      />
    );
  }

  // Auth pages view
  if (activeView === 'auth') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
        <Header />
        <AuthPages />
      </div>
    );
  }

  // HRMS Application Workspace views (Employees, Attendance, Time Off)
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Workspace Module Bar */}
        <div className="bg-white p-3 rounded-full border border-slate-200/80 shadow-floating flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
              Module:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveView('employees')}
                className={`px-4 py-2 text-xs font-bold rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeView === 'employees'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Employees
              </button>
              <button
                onClick={() => setActiveView('attendance')}
                className={`px-4 py-2 text-xs font-bold rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeView === 'attendance'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Attendance
              </button>
              <button
                onClick={() => setActiveView('timeoff')}
                className={`px-4 py-2 text-xs font-bold rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeView === 'timeoff'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                Time Off
              </button>
            </div>
          </div>

          {currentUser && (
            <div className="text-xs text-slate-500 font-medium hidden md:flex items-center gap-2">
              <span>Logged in as:</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {currentUser.name} ({currentUser.loginId})
              </span>
            </div>
          )}
        </div>

        {activeView === 'employees' && <EmployeeCardsGrid />}
        {activeView === 'attendance' && <AttendanceView />}
        {activeView === 'timeoff' && <TimeOffView />}
      </main>
      <EmployeeProfileModal />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
