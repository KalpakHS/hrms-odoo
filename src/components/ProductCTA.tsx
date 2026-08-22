import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const ProductCTA: React.FC = () => {
  return (
    <section className="py-24 bg-[#FAF8F5] relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Main Navy Box Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-br from-[#0F1F4B] to-[#0A071E] border border-blue-950 rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl"
        >
          {/* Inner Grid Pattern overlay */}
          <div className="absolute inset-0 dark-grid-pattern opacity-10 pointer-events-none" />

          {/* Decorative radial glows */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#3B82F6]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-violet-650/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
            
            {/* Tag label */}
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#3B82F6] block mb-1 font-mono">
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
              <button className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white text-xs font-bold uppercase tracking-wider px-7 py-4.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 group cursor-pointer border border-[#3B82F6]/50">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold text-xs uppercase tracking-wider px-7 py-4.5 rounded-lg transition-all duration-200 cursor-pointer backdrop-blur-md">
                Sign In
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
