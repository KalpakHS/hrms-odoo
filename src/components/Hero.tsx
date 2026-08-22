import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
      scale: 0.95,
      letterSpacing: '-0.02em'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)', 
      scale: 1,
      letterSpacing: '0em',
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
    <section id="home" className="relative min-h-[95vh] flex flex-col items-center justify-center pt-40 pb-36 text-center select-none overflow-hidden bg-[#FFFDF2]">
      
      {/* 
        Premium Animated Fluid Mesh-Gradient Background
        Smooth liquid green & cream light motion.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Warm cream base */}
        <div className="absolute inset-0 bg-[#FFFDF2]" />

        {/* Ambient Color Blobs Container with Screen blend for luminous additive lighting */}
        <div className="absolute inset-0 mix-blend-multiply opacity-[0.85]">
          {/* Blob 1: Soft Mint/Pale Green (Left Side) */}
          <div className="absolute top-[-10%] left-[-20%] w-[75vw] h-[75vw] bg-[#A8DFA0] rounded-full filter blur-[150px] opacity-[0.28] animate-mesh-1" />
          
          {/* Blob 2: Stronger Green/Mint (Lower Left) */}
          <div className="absolute bottom-[-15%] left-[-15%] w-[65vw] h-[65vw] bg-[#63B64F] rounded-full filter blur-[140px] opacity-[0.28] animate-mesh-3" />
          
          {/* Blob 3: Lime/Yellow-Green (Right Side) */}
          <div className="absolute top-[-5%] right-[-20%] w-[75vw] h-[75vw] bg-[#CDEB72] rounded-full filter blur-[150px] opacity-[0.28] animate-mesh-2" />
          
          {/* Blob 4: Soft Purple Accent (Lower Right) */}
          <div className="absolute bottom-[-15%] right-[-15%] w-[65vw] h-[65vw] bg-[#D8CBEA] rounded-full filter blur-[140px] opacity-[0.14] animate-mesh-4" />
          
          {/* Blob 5: Warm Orange Accent (Center) */}
          <div className="absolute top-[20%] left-[20%] w-[45vw] h-[45vw] bg-[#F3D3A4] rounded-full filter blur-[120px] opacity-[0.15] animate-mesh-1" />
        </div>

        {/* Luminous Curved Light Trails / Streaks (Flowing ribbon curves) */}
        <div className="absolute inset-0 mix-blend-multiply opacity-[0.7]">
          {/* Fresh Green Trail sweeping bottom-left to bottom-right */}
          <div className="absolute bottom-[-5%] left-[-20%] w-[85vw] h-[25vw] bg-gradient-to-r from-transparent via-[#63B64F] to-transparent rounded-full filter blur-[100px] opacity-[0.25] rotate-[-15deg] animate-streak-1" />
          
          {/* Lime Green Trail sweeping right to center */}
          <div className="absolute top-[25%] right-[-20%] w-[80vw] h-[25vw] bg-gradient-to-r from-transparent via-[#CDEB72] to-transparent rounded-full filter blur-[110px] opacity-[0.22] rotate-[15deg] animate-streak-2" />
          
          {/* Mint Trail near bottom center */}
          <div className="absolute bottom-[8%] left-[5%] w-[70vw] h-[20vw] bg-gradient-to-r from-transparent via-[#A8DFA0] to-transparent rounded-full filter blur-[90px] opacity-[0.2] rotate-[-5deg] animate-streak-3" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center gap-8">
        
        {/* Rounded Glass Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/40 backdrop-blur-md border border-[#63B64F]/20 rounded-full shadow-xs text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#63B64F]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#63B64F] animate-pulse" />
          • HRMS • ODOO PLATFORM
        </motion.div>

        {/* 
          Main Heading.
          Line 1: Dark Charcoal, Line 2: Soft Green Gradient.
        */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center leading-[0.96] font-sans font-black tracking-tighter uppercase w-full"
        >
          {/* Line 1: HUMAN RESOURCE */}
          <span className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 text-[#182018] text-5xl sm:text-7xl md:text-8.5xl lg:text-[10xl]">
            {headingLine1.map((word, idx) => (
              <motion.span key={idx} variants={wordVariants} className="inline-block">
                {word}
              </motion.span>
            ))}
          </span>
          
          {/* Line 2: MANAGEMENT SYSTEM */}
          <span className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 bg-gradient-to-r from-[#182018] to-[#63B64F] bg-clip-text text-transparent text-5xl sm:text-7xl md:text-8.5xl lg:text-[10xl] mt-2.5 sm:mt-4">
            {headingLine2.map((word, idx) => (
              <motion.span key={idx} variants={wordVariants} className="inline-block">
                {word}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.div
          custom={0.45}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-xl sm:text-3xl md:text-4.5xl font-extrabold tracking-tight text-[#182018] leading-tight font-sans mt-4"
        >
          Every workday, <span className="text-[#63B64F]">perfectly aligned.</span>
        </motion.div>

        {/* Description */}
        <motion.p
          custom={0.6}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-xs sm:text-sm md:text-base text-[#687067] leading-relaxed max-w-2xl mt-2 font-semibold"
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
          <button className="bg-[#63B64F] hover:bg-[#52a13e] text-white text-xs font-bold uppercase tracking-wider px-7 py-4.5 rounded-lg shadow-sm hover:shadow transition-all duration-205 flex items-center gap-2 group cursor-pointer border border-[#63B64F]">
            Get Started
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="bg-transparent hover:bg-[#63B64F]/5 text-[#182018] border border-[#63B64F]/35 font-bold text-xs uppercase tracking-wider px-7 py-4.5 rounded-lg transition-all duration-200 cursor-pointer">
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
          <span className="flex items-center gap-1.5 text-[#63B64F]">✓ ROLE-BASED ACCESS</span>
          <span className="text-slate-300">•</span>
          <span>EMPLOYEE MANAGEMENT</span>
          <span className="text-slate-300">•</span>
          <span>ATTENDANCE</span>
          <span className="text-slate-300">•</span>
          <span>LEAVE & PAYROLL</span>
        </motion.div>

      </div>

      {/* 
        Soft curved transition dividing the hero from the next section.
        Curves downward gently, filled with the next section's background (#F8FAFC).
      */}
      <div className="absolute bottom-0 inset-x-0 w-full z-10 pointer-events-none">
        <svg className="w-full h-12 text-[#F8FAFC] fill-current" viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,24 Q720,48 1440,24 L1440,48 L0,48 Z" />
        </svg>
      </div>

    </section>
  );
};
