import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-[#FFFFFF] pt-24 pb-12 relative overflow-hidden">
      
      {/* Decorative radial gradient blob in black space */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid line overlay */}
      <div className="absolute inset-0 dark-grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Top Minimal Info & Links */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 pb-16 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-2 group">
              <div className="flex items-end gap-0.5 h-4.5">
                <div className="w-1 h-3.5 bg-white rounded-full" />
                <div className="w-1 h-4.5 bg-zinc-700 rounded-full" />
                <div className="w-1 h-2.5 bg-zinc-400 rounded-full" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                Dayflow
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400 max-w-xs font-semibold leading-relaxed">
              A professional Odoo-connected HRMS designed to align workdays, attendance, leave, and payroll.
            </p>
          </div>

          {/* Minimal Link Set */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Explore</span>
              <a href="#home" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Home</a>
              <a href="#features" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Features</a>
            </div>
            <div className="flex flex-col gap-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Platform</span>
              <a href="#workflow" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Workflow</a>
              <a href="#about" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">About</a>
            </div>
            <div className="flex flex-col gap-3.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Portal</span>
              <a href="#signin" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Sign In</a>
            </div>
          </div>
        </div>

        {/* Oversized Brand Typography Section (Editorial Statement) */}
        <div className="py-20 relative select-none pointer-events-none flex flex-col items-center justify-center overflow-hidden">
          <h2 className="text-[14vw] md:text-[13vw] font-black tracking-tighter text-white/[0.02] uppercase leading-none text-center w-full font-sans">
            Dayflow
          </h2>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm font-bold uppercase tracking-[0.45em] text-white/80 whitespace-nowrap block pt-2.5 font-mono">
            Human Resource Management System
          </span>
        </div>

        {/* Bottom copyright/legal segment */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-slate-500">
          <div>
            © 2026 Dayflow. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
