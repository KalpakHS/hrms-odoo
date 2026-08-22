import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

// Custom Typewriter Text Animation Component
const TypingText: React.FC = () => {
  const words = ["perfectly aligned.", "automatically synced.", "simply managed."];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [reverse, setReverse] = useState(false);

  // Blinking cursor cycle
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  // Typing state machine logic
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      // Pause at the end of word before reversing
      const timeout = setTimeout(() => setReverse(true), 2200);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 60 : 120);

    return () => clearTimeout(timeout);
  }, [subIndex, reverse, index]);

  return (
    <span className="text-[#163A2B] font-bold">
      {words[index].substring(0, subIndex)}
      <span className={`inline-block w-[2.5px] h-[0.9em] ml-1 bg-[#D9A036] align-middle ${blink ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
};

export const Hero: React.FC = () => {
  // Staggered heading reveal setup
  const headingLine1 = "HUMAN RESOURCE".split(" ");
  const headingLine2 = "MANAGEMENT SYSTEM".split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const wordVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 25, 
      filter: 'blur(5px)', 
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)', 
      scale: 1,
      transition: { 
        duration: 0.75, 
        ease: [0.16, 1, 0.3, 1] as const 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: 'easeOut' as const }
    })
  };

  return (
    <section id="home" className="relative min-h-[95vh] flex flex-col items-center justify-center pt-40 pb-36 text-center select-none overflow-hidden bg-[#FAF7F0]">
      
      {/* 
        Premium Illustration Background elements
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Large mustard/orange sun shape at bottom right */}
        <div className="absolute right-[2%] md:right-[5%] bottom-[12%] w-60 h-60 md:w-80 md:h-80 rounded-full bg-[#EAA85D]/40 filter blur-xs z-0" />

        {/* 
          Plant Leaf Illustration (Bottom Right)
          Custom SVG coordinates mapping forest green & sage leaves overlapping the sun.
        */}
        <svg 
          className="absolute right-[-4%] md:right-[2%] bottom-[-5%] w-[320px] h-[360px] md:w-[480px] md:h-[520px] z-10 opacity-[0.88]" 
          viewBox="0 0 240 240" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem */}
          <path d="M220,240 Q185,150 145,55" stroke="#3E543C" strokeWidth="2.2" strokeLinecap="round" />
          
          {/* Leaves with different shades of sage & forest green */}
          {/* Leaf 1 (bottom left) */}
          <path d="M192,168 C162,188 132,183 122,218 C152,213 182,198 192,168 Z" fill="#5F7D5E" stroke="#3E543C" strokeWidth="0.8" />
          
          {/* Leaf 2 (mid left) */}
          <path d="M172,118 C132,128 107,123 92,158 C122,153 157,138 172,118 Z" fill="#7A9A78" stroke="#3E543C" strokeWidth="0.8" />
          
          {/* Leaf 3 (top left) */}
          <path d="M152,68 C112,78 87,73 72,108 C102,103 137,88 152,68 Z" fill="#9FBFA0" stroke="#3E543C" strokeWidth="0.8" />
          
          {/* Leaf 4 (bottom right) */}
          <path d="M202,192 C227,217 257,212 272,187 C242,182 217,187 202,192 Z" fill="#4B634A" stroke="#3E543C" strokeWidth="0.8" />
          
          {/* Leaf 5 (mid right) */}
          <path d="M182,142 C207,162 237,157 252,132 C222,127 197,132 182,142 Z" fill="#5F7D5E" stroke="#3E543C" strokeWidth="0.8" />
          
          {/* Leaf 6 (top right) */}
          <path d="M162,92 C187,107 217,102 232,77 C202,72 177,77 162,92 Z" fill="#7A9A78" stroke="#3E543C" strokeWidth="0.8" />
          
          {/* Leaf 7 (top) */}
          <path d="M145,55 C135,25 115,15 100,35 C115,50 135,55 145,55 Z" fill="#9FBFA0" stroke="#3E543C" strokeWidth="0.8" />
        </svg>

        {/* 
          Layered Landscape Waves (Bottom Left)
          Gently rolling sage green waves blending into the next section.
        */}
        <div className="absolute bottom-0 inset-x-0 w-full z-0 h-44 overflow-hidden">
          <svg className="w-full h-full text-[#E3E8DE]" viewBox="0 0 1440 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50,150 C220,110 420,195 720,175 C1020,155 1220,205 1520,195 L1520,250 L-50,250 Z" fill="#E3E8DE" opacity="0.55" />
            <path d="M-50,175 C170,145 370,205 620,185 C870,165 1170,215 1520,205 L1520,250 L-50,250 Z" fill="#D2D9CE" opacity="0.8" />
            <path d="M-50,190 C220,165 520,210 820,180 C1120,150 1420,205 1520,190 L1520,250 L-50,250 Z" fill="#F8F6E8" />
          </svg>
        </div>

      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center gap-8">
        
        {/* Sparkled Cream Pill Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFFDF9] border border-[#E9E5D9] rounded-full shadow-2xs text-[11px] font-semibold tracking-wide text-[#163A2B]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#163A2B] flex-shrink-0" />
          • HRMS • ODOO PLATFORM
        </motion.div>

        {/* 
          Main Serif Heading.
          Line 1: Dark Charcoal, Line 2: Soft Forest Green with mustard/golden dot.
        */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center leading-[1.05] font-serif font-medium tracking-tight w-full"
        >
          {/* Line 1: HUMAN RESOURCE */}
          <span className="flex flex-wrap justify-center gap-x-4 sm:gap-x-5 text-[#182018] text-5xl sm:text-7xl md:text-8xl">
            {headingLine1.map((word, idx) => (
              <motion.span key={idx} variants={wordVariants} className="inline-block">
                {word}
              </motion.span>
            ))}
          </span>
          
          {/* Line 2: MANAGEMENT SYSTEM. */}
          <span className="flex flex-wrap justify-center gap-x-4 sm:gap-x-5 text-[#163A2B] text-5xl sm:text-7xl md:text-8xl mt-1.5 sm:mt-3">
            {headingLine2.map((word, idx) => {
              const isLast = idx === headingLine2.length - 1;
              return (
                <motion.span key={idx} variants={wordVariants} className="inline-block">
                  {word}
                  {isLast && <span className="text-[#D9A036]">.</span>}
                </motion.span>
              );
            })}
          </span>
        </motion.h1>

        {/* Tagline with Typewriter Text Animation */}
        <motion.div
          custom={0.45}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-lg sm:text-2xl md:text-3.5xl font-bold tracking-tight text-[#182018] leading-tight font-sans mt-2"
        >
          Every workday, <TypingText />
        </motion.div>

        {/* Description */}
        <motion.p
          custom={0.6}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-xs sm:text-sm md:text-base text-[#687067] leading-relaxed max-w-2xl mt-1 font-semibold"
        >
          A unified HRMS for managing employees, profiles, attendance, leave, payroll visibility, and HR workflows from one connected platform.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          custom={0.75}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-4 mt-6"
        >
          <button className="bg-[#163A2B] hover:bg-[#0f2a1f] text-white text-xs font-bold uppercase tracking-wider px-7 py-4.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 group cursor-pointer border border-[#163A2B]">
            Get Started
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="bg-white hover:bg-slate-50 text-[#163A2B] border border-[#E9E5D9] font-bold text-xs uppercase tracking-wider px-7 py-4.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-[#D9A036]/70 flex items-center justify-center text-[#D9A036] flex-shrink-0">
              <svg className="w-2 h-2 fill-current ml-0.5" viewBox="0 0 8 10">
                <path d="M0,0 L8,5 L0,10 Z" />
              </svg>
            </span>
            Explore Platform
          </button>
        </motion.div>

        {/* Horizontal Feature Strip */}
        <motion.div
          custom={0.85}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#687067]/80 font-mono mt-12"
        >
          <span className="flex items-center gap-1.5 text-[#163A2B]">✓ ROLE-BASED ACCESS</span>
          <span className="text-slate-300">•</span>
          <span>EMPLOYEE MANAGEMENT</span>
          <span className="text-slate-300">•</span>
          <span>ATTENDANCE</span>
          <span className="text-slate-300">•</span>
          <span>LEAVE & PAYROLL</span>
        </motion.div>

      </div>

    </section>
  );
};
