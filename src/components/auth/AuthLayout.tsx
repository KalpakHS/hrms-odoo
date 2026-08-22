import React from 'react';
import { Globe, HelpCircle } from 'lucide-react';

interface AuthLayoutProps {
  onBackToHome: () => void;
  onSwitchView: (view: 'login' | 'signup') => void;
  currentView: 'login' | 'signup' | 'first-login';
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  onBackToHome,
  onSwitchView,
  currentView,
  children
}) => {
  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between relative overflow-hidden select-none font-sans text-[#182018]">
      
      {/* Background illustration assets */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large mustard/orange sun backdrop */}
        <div className="absolute right-[2%] md:right-[5%] bottom-[12%] w-60 h-60 md:w-80 md:h-80 rounded-full bg-[#EAA85D]/25 filter blur-xs z-0" />

        {/* Plant Leaf SVG */}
        <svg 
          className="absolute right-[-4%] md:right-[2%] bottom-[-5%] w-[280px] h-[320px] md:w-[420px] md:h-[460px] z-10 opacity-[0.75]" 
          viewBox="0 0 240 240" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M220,240 Q185,150 145,55" stroke="#3E543C" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M192,168 C162,188 132,183 122,218 C152,213 182,198 192,168 Z" fill="#5F7D5E" stroke="#3E543C" strokeWidth="0.8" />
          <path d="M172,118 C132,128 107,123 92,158 C122,153 157,138 172,118 Z" fill="#7A9A78" stroke="#3E543C" strokeWidth="0.8" />
          <path d="M152,68 C112,78 87,73 72,108 C102,103 137,88 152,68 Z" fill="#9FBFA0" stroke="#3E543C" strokeWidth="0.8" />
          <path d="M202,192 C227,217 257,212 272,187 C242,182 217,187 202,192 Z" fill="#4B634A" stroke="#3E543C" strokeWidth="0.8" />
          <path d="M182,142 C207,162 237,157 252,132 C222,127 197,132 182,142 Z" fill="#5F7D5E" stroke="#3E543C" strokeWidth="0.8" />
          <path d="M162,92 C187,107 217,102 232,77 C202,72 177,77 162,92 Z" fill="#7A9A78" stroke="#3E543C" strokeWidth="0.8" />
          <path d="M145,55 C135,25 115,15 100,35 C115,50 135,55 145,55 Z" fill="#9FBFA0" stroke="#3E543C" strokeWidth="0.8" />
        </svg>

        {/* Double Wave Layer at bottom left */}
        <div className="absolute bottom-0 inset-x-0 w-full z-0 h-36 overflow-hidden">
          <svg className="w-full h-full text-[#E3E8DE]" viewBox="0 0 1440 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50,150 C220,110 420,195 720,175 C1020,155 1220,205 1520,195 L1520,250 L-50,250 Z" fill="#E3E8DE" opacity="0.45" />
            <path d="M-50,175 C170,145 370,205 620,185 C870,165 1170,215 1520,205 L1520,250 L-50,250 Z" fill="#D2D9CE" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 md:px-8 py-6 relative z-10 flex items-center justify-between">
        {/* Brand Logo */}
        <button onClick={onBackToHome} className="flex items-center gap-2 group cursor-pointer border-none bg-transparent">
          <div className="flex items-end gap-1 h-5.5">
            <div className="w-1.5 h-3.5 rounded-full bg-[#A8DFA0] group-hover:h-4.5 transition-all duration-300" />
            <div className="w-1.5 h-5.5 rounded-full bg-[#163A2B]" />
            <div className="w-1.5 h-2.5 rounded-full bg-[#182018] group-hover:h-3.5 transition-all duration-300" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#182018] font-sans">
            Dayflow<span className="text-[#D9A036]">.</span>
          </span>
        </button>

        {/* Navigation Utilities */}
        <div className="flex items-center gap-6 text-sm font-semibold text-[#687067]">
          <button className="flex items-center gap-1.5 hover:text-[#163A2B] transition-colors cursor-pointer border-none bg-transparent">
            <Globe className="w-4 h-4" />
            <span>EN</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-[#163A2B] transition-colors cursor-pointer border-none bg-transparent">
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
          
          {currentView === 'login' && (
            <button 
              onClick={() => onSwitchView('signup')} 
              className="text-xs font-bold uppercase tracking-wider px-4.5 py-2.5 border border-[#163A2B]/20 rounded-full hover:bg-[#163A2B]/5 text-[#163A2B] cursor-pointer transition-all duration-200"
            >
              Register Org
            </button>
          )}

          {currentView === 'signup' && (
            <button 
              onClick={() => onSwitchView('login')} 
              className="text-xs font-bold uppercase tracking-wider px-4.5 py-2.5 border border-[#163A2B]/20 rounded-full hover:bg-[#163A2B]/5 text-[#163A2B] cursor-pointer transition-all duration-200"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-6 md:px-8 py-10 flex-grow relative z-10 flex flex-col justify-center">
        {children}
      </main>

      {/* Mini Copyright Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 md:px-8 py-6 relative z-10 text-center text-xs text-[#687067]/70 font-medium">
        © 2026 Dayflow. Professional Odoo Sync System.
      </footer>

    </div>
  );
};
