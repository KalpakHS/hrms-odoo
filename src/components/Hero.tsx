import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

export const Hero: React.FC = () => {
  // Heading & Tagline words arrays for staggered word animation
  const mainWords = "HUMAN RESOURCE MANAGEMENT SYSTEM".split(" ");
  const taglineWords = "Every workday, perfectly aligned.".split(" ");

  // Staggered text reveal variants (smooth fade-in and slight upward slide)
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      }
    }
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 12, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.45,
        ease: 'easeOut' as const,
      }
    }
  };

  return (
    <section id="home" className="relative min-h-[80vh] flex items-center justify-center pt-32 pb-24 bg-white text-center select-none">
      
      {/* 
        Pure white and completely static background.
        No canvas, no pulsing gradient spheres, no moving particle elements.
      */}

      <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center gap-7">
        
        {/* 
          Main prominently centered HRMS Heading.
          Uses outline-white (hollow style with a dark border) and solid Dayflow blue.
        */}
        <motion.h2
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-3xl sm:text-5xl md:text-6.5xl font-black uppercase tracking-tight leading-none font-sans"
        >
          {mainWords.map((word, idx) => {
            const isBlue = word === "MANAGEMENT" || word === "SYSTEM";
            return (
              <motion.span
                key={idx}
                variants={wordVariants}
                className={`inline-block mr-3 sm:mr-4 last:mr-0 ${
                  isBlue 
                    ? 'text-[#2563EB]' // Solid Dayflow Blue
                    : 'text-outline-navy' // Hollow White with Deep Navy outline
                }`}
              >
                {word}
              </motion.span>
            );
          })}
        </motion.h2>

        {/* Tagline centered directly below the main heading */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5.5xl md:text-6.5xl font-black tracking-tight text-[#0F172A] leading-tight font-sans"
        >
          {taglineWords.map((word, idx) => {
            // Emphasize "perfectly aligned." in Dayflow Blue, other words in Deep Navy
            const isBlue = word === "perfectly" || word === "aligned.";
            return (
              <motion.span
                key={idx}
                variants={wordVariants}
                className={`inline-block mr-2 sm:mr-3 last:mr-0 ${
                  isBlue ? 'text-[#2563EB]' : 'text-[#0F1F4B]'
                }`}
              >
                {word}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* 
          Clean, static supporting description.
          No motion animations are applied here to preserve visual simplicity.
        */}
        <p className="text-sm sm:text-base md:text-lg text-[#64748B] leading-relaxed max-w-2xl mt-1 font-semibold">
          A unified HRMS for managing employees, profiles, attendance, leave, payroll visibility, and HR workflows from one connected platform.
        </p>

        {/* 
          Clean, static CTA Button block.
        */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider px-7 py-4.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 group cursor-pointer border border-[#2563EB]">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="bg-transparent hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] font-bold text-xs uppercase tracking-wider px-7 py-4.5 rounded-lg transition-all duration-200 cursor-pointer">
            Explore Platform
          </button>
        </div>

        {/* 
          Static Trust badge indicators.
        */}
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
