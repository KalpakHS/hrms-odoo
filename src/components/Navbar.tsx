import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectContext } from '../context/useProjectContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const context = useProjectContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'About', href: '#about' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800 py-3.5 shadow-md text-white'
            : 'bg-transparent py-5 border-b border-transparent text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          {/* Logo Mark & Name */}
          <button
            onClick={() => context.setActiveView('home')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="flex items-end gap-1 h-5.5">
              <div className="w-1.5 h-3.5 bg-[#3B82F6] rounded-full group-hover:h-4.5 transition-all duration-300" />
              <div className="w-1.5 h-5.5 bg-[#2563EB] rounded-full" />
              <div className="w-1.5 h-2.5 bg-purple-500 rounded-full group-hover:h-3.5 transition-all duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Dayflow
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-slate-300 hover:text-blue-400 transition-colors relative group py-1.5"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            <button
              onClick={() => context.setActiveView('employees')}
              className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Workspace App →
            </button>
          </div>

          {/* Right Call-To-Action Button Suite */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => {
                context.setActiveView('auth');
                context.setAuthMode('signin');
              }}
              className="text-sm font-bold text-slate-200 hover:text-blue-400 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => context.setActiveView('employees')}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              Launch HRMS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-white hover:text-blue-400 md:hidden cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] z-30 md:hidden bg-slate-900 border-b border-slate-800 shadow-xl px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-bold text-white hover:text-blue-400 py-2"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-slate-800 my-2" />
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    context.setActiveView('auth');
                    context.setAuthMode('signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-center font-bold text-white hover:text-blue-400 py-2.5 border border-slate-800 rounded-xl cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    context.setActiveView('employees');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-xl shadow-sm text-center cursor-pointer"
                >
                  Launch HRMS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};