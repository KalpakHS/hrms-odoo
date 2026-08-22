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

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const { activeView } = useProjectContext();

  if (showIntro) {
    return (
      <AnimatePresence mode="wait">
        <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />
      </AnimatePresence>
    );
  }

  // Preserve team member's landing page when activeView is 'home'
  if (activeView === 'home') {
    return <Home key="home" />;
  }

  // Auth pages view
  if (activeView === 'auth') {
    return (
      <div className="min-h-screen bg-[#090D16] text-white">
        <Header />
        <AuthPages />
      </div>
    );
  }

  // HRMS Application Workspace views (Employees, Attendance, Time Off)
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
