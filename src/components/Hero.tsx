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
    <section id="home" className="relative min-h-[95vh] flex flex-col items-center justify-center pt-40 pb-36 text-center select-none overflow-hidden bg-[#050212]">
      
      {/* 
        Premium Animated Fluid Mesh-Gradient Background
        Oversized, highly saturated color clouds with 3 fluid light trails.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Base dark canvas */}
        <div className="absolute inset-0 bg-[#050212]" />

        {/* Ambient Color Blobs Container with Screen blend for luminous additive lighting */}
        <div className="absolute inset-0 mix-blend-screen opacity-90">
          {/* Blob 1: Violet/Purple (Left Side) */}
          <div className="absolute top-[-10%] left-[-20%] w-[75vw] h-[75vw] bg-[#5B21F5] rounded-full filter blur-[160px] opacity-[0.45]" />
          
          {/* Blob 2: Magenta/Pink (Lower Left) */}
          <div className="absolute bottom-[-15%] left-[-15%] w-[65vw] h-[65vw] bg-[#D946EF] rounded-full filter blur-[150px] opacity-[0.42]" />
          
          {/* Blob 3: Central Deep Purple + Burgundy Base */}
          <div className="absolute top-[10%] left-[10%] w-[80vw] h-[80vw] bg-[#21005F] rounded-full filter blur-[180px] opacity-[0.38]" />
          
          {/* Blob 4: Bright Orange (Right Side) */}
          <div className="absolute top-[-5%] right-[-20%] w-[75vw] h-[75vw] bg-[#FF6A00] rounded-full filter blur-[160px] opacity-[0.42]" />
          
          {/* Blob 5: Orange/Red (Lower Right) */}
          <div className="absolute bottom-[-15%] right-[-15%] w-[65vw] h-[65vw] bg-[#EF4444] rounded-full filter blur-[150px] opacity-[0.45]" />
        </div>

        {/* Luminous Curved Light Streaks / Trails */}
        <div className="absolute inset-0 mix-blend-plus-lighter opacity-80">
          {/* Violet/Purple Trail sweeping from left-bottom to center */}
          <div className="absolute bottom-[-5%] left-[-20%] w-[85vw] h-[25vw] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent rounded-full filter blur-[110px] opacity-[0.32] rotate-[-25deg]" />
          
          {/* Bright Orange Trail sweeping from right to center */}
          <div className="absolute top-[20%] right-[-20%] w-[80vw] h-[25vw] bg-gradient-to-r from-transparent via-[#FF8A00] to-transparent rounded-full filter blur-[120px] opacity-[0.28] rotate-[20deg]" />
          
          {/* Magenta Trail near the bottom center */}
          <div className="absolute bottom-[8%] left-[5%] w-[70vw] h-[20vw] bg-gradient-to-r from-transparent via-[#EC4899] to-transparent rounded-full filter blur-[100px] opacity-[0.25] rotate-[-10deg]" />
        </div>

        {/* Subtle localized dark vignette filter behind main text content for optimal contrast & readability */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-video bg-[radial-gradient(circle_at_center,rgba(5,2,18,0.35)_0%,rgba(5,2,18,0)_70%)] pointer-events-none z-0" />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center gap-8">
        
        {/* Rounded Glass Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/15 rounded-full shadow-lg text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/90"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] animate-pulse" />
          • HRMS • ODOO PLATFORM
        </motion.div>

        {/* 
          Main Heading (Dominant Element).
          Line 1: White, Line 2: Purple-Pink-Orange Gradient.
        */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center leading-[0.96] font-sans font-black tracking-tighter uppercase w-full"
        >
          {/* Line 1: HUMAN RESOURCE */}
          <span className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 text-white text-5xl sm:text-7xl md:text-8.5xl lg:text-[10xl]">
            {headingLine1.map((word, idx) => (
              <motion.span key={idx} variants={wordVariants} className="inline-block">
                {word}
              </motion.span>
            ))}
          </span>
          
          {/* Line 2: MANAGEMENT SYSTEM */}
          <span className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] bg-clip-text text-transparent text-5xl sm:text-7xl md:text-8.5xl lg:text-[10xl] mt-2.5 sm:mt-4">
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
          className="text-xl sm:text-3xl md:text-4.5xl font-extrabold tracking-tight text-white leading-tight font-sans mt-4"
        >
          Every workday, <span className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] bg-clip-text text-transparent">perfectly aligned.</span>
        </motion.div>

        {/* Description */}
        <motion.p
          custom={0.6}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-xs sm:text-sm md:text-base text-white/70 leading-relaxed max-w-2xl mt-2 font-semibold"
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
          <button className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white text-xs font-bold uppercase tracking-wider px-7 py-4.5 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all duration-200 flex items-center gap-2 group cursor-pointer border border-[#3B82F6]/50">
            Get Started
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold text-xs uppercase tracking-wider px-7 py-4.5 rounded-lg transition-all duration-200 cursor-pointer backdrop-blur-md">
            Explore Platform
          </button>
        </motion.div>

        {/* Horizontal Feature Strip */}
        <motion.div
          custom={0.85}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/50 font-mono mt-12"
        >
          <span className="flex items-center gap-1.5 text-white/70">✓ ROLE-BASED ACCESS</span>
          <span className="text-white/20">•</span>
          <span>EMPLOYEE MANAGEMENT</span>
          <span className="text-white/20">•</span>
          <span>ATTENDANCE</span>
          <span className="text-white/20">•</span>
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
