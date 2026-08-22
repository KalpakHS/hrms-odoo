import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { User, Shield, Check, X } from 'lucide-react';

export const RoleBasedSection: React.FC = () => {
  const [leftHover, setLeftHover] = useState(false);
  const [rightHover, setRightHover] = useState(false);

  const [leftMouse, setLeftMouse] = useState({ x: 0, y: 0 });
  const [rightMouse, setRightMouse] = useState({ x: 0, y: 0 });

  const [leftRect, setLeftRect] = useState<DOMRect | null>(null);
  const [rightRect, setRightRect] = useState<DOMRect | null>(null);

  const handleLeftMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLeftRect(rect);
    setLeftMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleRightMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRightRect(rect);
    setRightMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Stagger variants for entry
  const blockVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        delay,
        ease: [0.16, 1, 0.3, 1] as const
      }
    })
  };

  // Rotate formulas
  const leftRotateX = leftHover && leftRect ? ((leftMouse.y - leftRect.height / 2) / (leftRect.height / 2)) * -2.5 : 0;
  const leftRotateY = leftHover && leftRect ? ((leftMouse.x - leftRect.width / 2) / (leftRect.width / 2)) * 2.5 : 0;

  const rightRotateX = rightHover && rightRect ? ((rightMouse.y - rightRect.height / 2) / (rightRect.height / 2)) * -2.5 : 0;
  const rightRotateY = rightHover && rightRect ? ((rightMouse.x - rightRect.width / 2) / (rightRect.width / 2)) * 2.5 : 0;

  return (
    <section id="about" className="py-24 bg-[#FFFDF2] relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-slate-200/50" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[13px] font-bold uppercase tracking-[0.25em] text-[#63B64F] block mb-3 font-mono">
            Role-Based Experiences
          </span>
          <h2 className="text-3.5xl sm:text-5xl font-black text-[#182018] tracking-tight leading-tight">
            One platform for employees and HR.
          </h2>
          <p className="mt-4 text-[18px] text-[#687067] font-semibold leading-relaxed">
            Different permissions, same workspace. Dayflow aligns employees and administrators.
          </p>
        </div>

        {/* Side-by-Side Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Side: Employee Workspace (Light Panel) */}
          <motion.div
            custom={0}
            variants={blockVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            onMouseMove={handleLeftMove}
            onMouseEnter={() => setLeftHover(true)}
            onMouseLeave={() => setLeftHover(false)}
            style={{
              transform: leftHover 
                ? `perspective(1000px) rotateX(${leftRotateX}deg) rotateY(${leftRotateY}deg) translateY(-6px)` 
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
              transition: leftHover ? 'none' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className={`bg-[#F8F6E8]/40 border rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm transition-shadow duration-300 relative ${
              leftHover ? 'shadow-lg border-[#63B64F]/30' : 'border-slate-200/80'
            }`}
          >
            {/* Green gradient glow on hover */}
            {leftHover && (
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(250px circle at ${leftMouse.x}px ${leftMouse.y}px, rgba(99, 182, 79, 0.07), transparent 80%)`
                }}
              />
            )}

            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  leftHover ? 'bg-[#63B64F] text-white shadow-md' : 'bg-[#DCEFD5] text-[#63B64F]'
                }`}>
                  <User className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#182018] tracking-tight">Employee Workspace</h3>
                  <span className="text-[9px] text-[#63B64F] font-extrabold uppercase tracking-widest block mt-0.5 font-mono">Self-Service Portal</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#687067] font-semibold mb-8 leading-relaxed">
                Empower your workforce with intuitive tools to manage their schedule, profiles, leave forms, and pay logs directly.
              </p>

              {/* 2D Employee UI Preview Mockup */}
              <div className="bg-white/80 border border-slate-200/60 rounded-xl p-5 text-left font-sans flex flex-col gap-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7.5 h-7.5 rounded-full bg-[#DCEFD5] flex items-center justify-center font-bold text-[9px] text-[#63B64F]">
                      SV
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#182018] block leading-none">Sarah Vance</span>
                      <span className="text-[8px] text-[#687067] mt-1 block font-semibold leading-none font-sans">UX Designer</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#DCEFD5] text-[#63B64F] border border-[#63B64F]/20 rounded">
                    Employee Account
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 border border-slate-200/40 p-3 rounded shadow-3xs">
                    <span className="text-[8px] font-bold text-[#687067] uppercase block font-mono">Leave Balance</span>
                    <span className="text-xs font-black text-[#182018] mt-1 block font-mono">12 Days Left</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/40 p-3 rounded shadow-3xs">
                    <span className="text-[8px] font-bold text-[#687067] uppercase block font-mono">Net Salary (Aug)</span>
                    <span className="text-xs font-black text-[#63B64F] mt-1 block font-mono">$6,345.00</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded flex items-center justify-between shadow-3xs transition-transform duration-300" style={{
                    transform: leftHover ? 'translateY(-2px)' : 'none'
                  }}>
                    <span className="text-[10px] font-bold text-[#182018]">Attendance Clock-In</span>
                    <span className="text-[9px] font-mono text-[#63B64F]">Today at 09:02 AM</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded flex items-center justify-between shadow-3xs transition-transform duration-300" style={{
                    transform: leftHover ? 'translateY(-2px)' : 'none'
                  }}>
                    <span className="text-[10px] font-bold text-[#182018]">Time-Off Request Status</span>
                    <span className="text-[8px] font-extrabold uppercase bg-amber-50 text-amber-600 border border-amber-100/60 px-2 py-0.5 rounded">Pending HR</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/60 text-[10px] font-extrabold text-[#687067] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63B64F] animate-pulse" />
              Designed for simple, mobile self-service
            </div>
          </motion.div>

          {/* Right Side: HR & Admin Control (Dark Charcoal/Green Gradient Panel) */}
          <motion.div
            custom={0.12}
            variants={blockVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            onMouseMove={handleRightMove}
            onMouseEnter={() => setRightHover(true)}
            onMouseLeave={() => setRightHover(false)}
            style={{
              transform: rightHover 
                ? `perspective(1000px) rotateX(${rightRotateX}deg) rotateY(${rightRotateY}deg) translateY(-6px)` 
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
              transition: rightHover ? 'none' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="bg-gradient-to-br from-[#182018] to-[#0A0D0A] border border-emerald-950 rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-md relative text-white"
          >
            {/* Green gradient glow on hover */}
            {rightHover && (
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(250px circle at ${rightMouse.x}px ${rightMouse.y}px, rgba(99, 182, 79, 0.12), transparent 80%)`
                }}
              />
            )}

            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors duration-300 ${
                  rightHover ? 'bg-[#63B64F] text-white border-[#63B64F] shadow-md' : 'bg-[#63B64F]/10 text-[#A8DFA0] border-[#63B64F]/20'
                }`}>
                  <Shield className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">HR & Admin Control</h3>
                  <span className="text-[9px] text-[#A8DFA0] font-extrabold uppercase tracking-widest block mt-0.5 font-mono">Management Console</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-350 font-semibold mb-8 leading-relaxed">
                Maintain comprehensive control over employee profiles, daily timesheets, leave workflow rules, and payroll structures.
              </p>

              {/* 2D HR Admin UI Preview Mockup */}
              <div className="bg-[#0A0D0A]/70 border border-emerald-950/80 p-5 text-left font-sans flex flex-col gap-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-emerald-950/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7.5 h-7.5 rounded-full bg-[#63B64F]/20 border border-[#63B64F]/30 flex items-center justify-center font-bold text-[9px] text-[#A8DFA0]">
                      HR
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white block leading-none">Admin Control</span>
                      <span className="text-[8px] text-slate-400 mt-1 block font-semibold leading-none">Odoo Synchronizer</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-950 text-[#A8DFA0] border border-emerald-900/50 rounded">
                    Admin Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-slate-200">
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block font-mono">Registry Size</span>
                    <span className="text-xs font-black text-white mt-1 block font-mono">248 Active</span>
                  </div>
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block font-mono">Approvals Stack</span>
                    <span className="text-xs font-black text-[#A8DFA0] mt-1 block font-mono">8 Pending</span>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded flex items-center justify-between text-[10px] transition-transform duration-300" style={{
                  transform: rightHover ? 'translateX(4px)' : 'none'
                }}>
                  <div>
                    <span className="font-bold text-white block">Sarah Vance · Paid Leave</span>
                    <span className="text-[8px] text-slate-400 mt-1 block font-mono font-sans">Aug 25 - Aug 27 (3 Days)</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-4 h-4 rounded bg-[#63B64F] flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></span>
                    <span className="w-4 h-4 rounded bg-slate-800 border border-slate-900 flex items-center justify-center text-slate-400"><X className="w-2.5 h-2.5" /></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63B64F] animate-pulse" />
              Comprehensive multi-tier auditing features
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
