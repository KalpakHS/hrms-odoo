import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

export const Hero: React.FC = () => {
  // Typewriter text state variables
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [isDone1, setIsDone1] = useState(false);
  const [isDone2, setIsDone2] = useState(false);

  useEffect(() => {
    const fullText1 = "HUMAN RESOURCE";
    let i = 0;
    
    // Type Line 1 character-by-character
    const timer1 = setInterval(() => {
      if (i < fullText1.length) {
        setText1(fullText1.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer1);
        setIsDone1(true);
      }
    }, 70); // 70ms step speed

    return () => clearInterval(timer1);
  }, []);

  useEffect(() => {
    if (!isDone1) return;
    const fullText2 = "MANAGEMENT SYSTEM";
    let i = 0;
    
    // Pause before typing Line 2
    const delay = setTimeout(() => {
      const timer2 = setInterval(() => {
        if (i < fullText2.length) {
          setText2(fullText2.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer2);
          setIsDone2(true);
        }
      }, 65); // 65ms step speed
      
      return () => clearInterval(timer2);
    }, 200);

    return () => clearTimeout(delay);
  }, [isDone1]);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center pt-40 pb-32 bg-white text-center select-none overflow-hidden border-b border-slate-100/60">
      
      {/* 
        Premium Animated Mesh-Gradient Background
        Slow-moving blobs: Deep purple, warm orange, magenta, coral/red, and electric blue.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* White base */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Very subtle light-blue base radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,246,255,0.8)_0%,rgba(255,255,255,0)_100%)]" />

        {/* Blob 1: Deep Purple */}
        <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] bg-[#6D28D9] rounded-full filter blur-[120px] opacity-[0.14] animate-mesh-1" />
        {/* Blob 2: Warm Orange */}
        <div className="absolute bottom-[-15%] right-[-10%] w-[65vw] h-[65vw] bg-[#F97316] rounded-full filter blur-[140px] opacity-[0.12] animate-mesh-2" />
        {/* Blob 3: Magenta */}
        <div className="absolute top-[20%] right-[-15%] w-[50vw] h-[50vw] bg-[#D946EF] rounded-full filter blur-[120px] opacity-[0.13] animate-mesh-3" />
        {/* Blob 4: Coral / Red */}
        <div className="absolute bottom-[10%] left-[-15%] w-[55vw] h-[55vw] bg-[#EF4444] rounded-full filter blur-[130px] opacity-[0.12] animate-mesh-4" />
        {/* Blob 5: Electric Blue Hint */}
        <div className="absolute top-[35%] left-[20%] w-[40vw] h-[40vw] bg-[#3B82F6] rounded-full filter blur-[110px] opacity-[0.1] animate-mesh-1" />

        {/* Extremely subtle blue radial glow overlay behind centered typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-square bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,rgba(255,255,255,0)_70%)] pointer-events-none z-0" />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center gap-9">
        
        {/* 
          HRMS-ODOO Eyebrow Badge.
          Fade-in + slight scale.
        */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-xs border border-blue-100/70 rounded-full shadow-2xs text-[10px] font-extrabold uppercase tracking-widest text-[#2563EB]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
          HRMS-ODOO Platform
        </motion.div>

        {/* 
          Main HRMS Heading - significantly larger and bolder.
          Types character-by-character with a blinking cursor at the typing edge.
        */}
        <div className="flex flex-col items-center leading-[0.96] font-sans font-black tracking-tighter uppercase w-full">
          {/* Line 1: HUMAN RESOURCE (Deep Navy) */}
          <h2 className="text-[#0F1F4B] text-5xl sm:text-7xl md:text-8.5xl lg:text-[10xl] min-h-[1.1em] flex items-center justify-center">
            {text1}
            {!isDone1 && (
              <span className="text-[#2563EB] animate-pulse ml-1 inline-block select-none font-light">|</span>
            )}
          </h2>
          
          {/* Line 2: MANAGEMENT SYSTEM (Refined Blue Gradient) */}
          <h2 className="text-5xl sm:text-7xl md:text-8.5xl lg:text-[10xl] min-h-[1.1em] mt-2.5 sm:mt-4 flex items-center justify-center">
            <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
              {text2}
            </span>
            {isDone1 && (
              <span className="text-[#2563EB] animate-pulse ml-1 inline-block select-none font-light">|</span>
            )}
          </h2>
        </div>

        {/* Tagline message centered directly below heading, animated after typing finishes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isDone2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-2xl sm:text-3.5xl md:text-4.5xl font-extrabold tracking-tight text-[#0F1F4B] leading-tight font-sans mt-1"
        >
          Every workday, <span className="text-[#2563EB]">perfectly aligned.</span>
        </motion.div>

        {/* Clean supporting description, animated after typing finishes */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isDone2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm sm:text-base md:text-lg text-[#64748B] leading-relaxed max-w-2xl mt-1 font-semibold"
        >
          A unified HRMS for managing employees, profiles, attendance, leave, payroll visibility, and HR workflows from one connected platform.
        </motion.p>

        {/* Action buttons, animated after typing finishes */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={isDone2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-4 mt-1"
        >
          <button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider px-7 py-4.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 group cursor-pointer border border-[#2563EB]">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="bg-transparent hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] font-bold text-xs uppercase tracking-wider px-7 py-4.5 rounded-lg transition-all duration-200 cursor-pointer">
            Explore Platform
          </button>
        </motion.div>

        {/* Static Trust badge indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] font-mono mt-10">
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#2563EB]" /> Role-Based Access</span>
          <span className="text-slate-300">•</span>
          <span>Employee Management</span>
          <span className="text-slate-300">•</span>
          <span>Attendance</span>
          <span className="text-slate-300">•</span>
          <span>Leave & Payroll</span>
        </div>

      </div>
    </section>
  );
};
