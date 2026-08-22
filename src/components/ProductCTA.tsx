import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ProductCTAProps {
  onGetStarted: () => void;
}

export const ProductCTA: React.FC<ProductCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-24 bg-[#FFFDF2] relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Main Navy Box Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-br from-[#182018] to-[#0A0D0A] border border-emerald-950 rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl"
        >
          {/* Inner Grid Pattern overlay */}
          <div className="absolute inset-0 dark-grid-pattern opacity-10 pointer-events-none" />

          {/* Decorative radial glows */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#63B64F]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#A8DFA0]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
            
            {/* Tag label */}
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#63B64F] block mb-1 font-mono">
              Aligned HR Operations
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Bring every workday into one connected HR workspace.
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-semibold max-w-2xl">
              Manage employees, attendance, leave and payroll through one streamlined platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <button 
                onClick={onGetStarted}
                className="bg-[#63B64F] hover:bg-[#52a13e] text-white text-xs font-bold uppercase tracking-wider px-7 py-4.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 group cursor-pointer border border-[#63B64F]"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold text-xs uppercase tracking-wider px-7 py-4.5 rounded-lg transition-all duration-200 cursor-pointer backdrop-blur-md"
              >
                Sign In
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
