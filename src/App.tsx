import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IntroAnimation } from './components/IntroAnimation';
import { Home } from './pages/Home';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { OrganizationSignupForm } from './components/auth/OrganizationSignupForm';
import { FirstLoginPasswordChange } from './components/auth/FirstLoginPasswordChange';
import { RoleRedirect } from './components/auth/RoleRedirect';

interface UserSession {
  loginId: string;
  name: string;
  role: 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  email: string;
  empCode: string;
}

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'first-login' | 'dashboard'>('landing');
  const [user, setUser] = useState<UserSession | null>(null);

  const handleLoginSuccess = (loggedInUser: UserSession, mustChange: boolean) => {
    setUser(loggedInUser);
    if (mustChange) {
      setCurrentView('first-login');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleSignupSuccess = (orgData: any) => {
    alert(`Organization "${orgData.companyName}" registered successfully!\nAdmin Login ID: OIJODO20230001 (generated)\nTemporary Password: Admin@12345\n\nYou can now sign in using these credentials.`);
    setCurrentView('login');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />
        ) : currentView === 'landing' ? (
          <Home 
            key="home" 
            onSignIn={() => setCurrentView('login')}
            onGetStarted={() => setCurrentView('signup')}
          />
        ) : currentView === 'login' ? (
          <AuthLayout 
            key="auth-login" 
            currentView="login"
            onBackToHome={() => setCurrentView('landing')}
            onSwitchView={setCurrentView}
          >
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </AuthLayout>
        ) : currentView === 'signup' ? (
          <AuthLayout 
            key="auth-signup" 
            currentView="signup"
            onBackToHome={() => setCurrentView('landing')}
            onSwitchView={setCurrentView}
          >
            <OrganizationSignupForm 
              onSignupSuccess={handleSignupSuccess}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          </AuthLayout>
        ) : currentView === 'first-login' ? (
          <AuthLayout 
            key="auth-first-login" 
            currentView="first-login"
            onBackToHome={() => setCurrentView('landing')}
            onSwitchView={setCurrentView}
          >
            <FirstLoginPasswordChange 
              user={user!}
              onPasswordChangeSuccess={() => setCurrentView('dashboard')}
            />
          </AuthLayout>
        ) : (
          <RoleRedirect 
            key="dashboard"
            user={user!}
            onLogout={() => {
              setUser(null);
              setCurrentView('landing');
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
