import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const ProductCTA: React.FC = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Main Navy Box Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-br from-[#0F1F4B] via-[#081230] to-[#2563EB]/25 border border-blue-900/10 rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl"
        >
          {/* Inner Grid Pattern overlay */}
          <div className="absolute inset-0 dark-grid-pattern opacity-10 pointer-events-none" />

          {/* Decorative radial glows */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            
            {/* Tag label */}
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#3B82F6] block mb-1">
              Aligned HR Operations
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-tight">
              Bring every workday into one connected HR workspace.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-305 leading-relaxed font-semibold opacity-85">
              Manage employees, attendance, leave and payroll through one streamlined platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider px-6.5 py-4 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 group cursor-pointer">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="bg-transparent hover:bg-white/5 text-white border border-white/20 font-bold text-xs uppercase tracking-wider px-6.5 py-4 rounded-lg transition-all duration-200 cursor-pointer">
                Sign In
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
