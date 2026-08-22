import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSignIn, onGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/60 py-3.5 shadow-sm'
            : 'bg-[#FFFDF2]/30 backdrop-blur-xs py-5.5 border-b border-[#63B64F]/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          
          {/* Logo Mark & Name */}
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="flex items-end gap-1 h-5.5">
              <div className="w-1.5 h-3.5 rounded-full bg-[#A8DFA0] group-hover:h-4.5 transition-all duration-300" />
              <div className="w-1.5 h-5.5 rounded-full bg-[#63B64F]" />
              <div className="w-1.5 h-2.5 rounded-full bg-[#182018] group-hover:h-3.5 transition-all duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight font-sans text-[#182018]">
              Dayflow
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors relative group py-1.5 ${
                  isScrolled ? 'text-[#687067] hover:text-[#63B64F]' : 'text-[#182018]/80 hover:text-[#63B64F]'
                }`}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-[#63B64F]" />
              </a>
            ))}
          </div>

          {/* Right Call-To-Action Button Suite */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={onSignIn}
              className={`text-sm font-bold transition-colors cursor-pointer border-none bg-transparent ${
                isScrolled ? 'text-[#182018] hover:text-[#63B64F]' : 'text-[#182018]/90 hover:text-[#63B64F]'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-[#63B64F] hover:bg-[#52a13e] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer border border-[#63B64F]"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1 md:hidden cursor-pointer transition-colors ${
              isScrolled || isMobileMenuOpen ? 'text-[#182018]' : 'text-[#182018] hover:text-[#63B64F]'
            }`}
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
            className="fixed inset-x-0 top-[60px] z-30 md:hidden bg-white border-b border-slate-200 shadow-xl px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-bold text-[#0F172A] hover:text-[#2563EB] py-2"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-slate-200/80 my-2" />
              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onSignIn(); }}
                  className="text-center font-bold text-[#182018] hover:text-[#163A2B] py-2.5 border border-slate-200 rounded-lg cursor-pointer bg-transparent"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onGetStarted(); }}
                  className="bg-[#163A2B] hover:bg-[#0f2a1f] text-white font-bold py-3 rounded-lg shadow-sm text-center cursor-pointer border-none"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
