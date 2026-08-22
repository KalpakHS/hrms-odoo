import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'minimal' | 'graphic' | 'reveal' | 'resolve' | 'transition'>('minimal');

  useEffect(() => {
    // Sequence timing as per spec
    const timers = [
      setTimeout(() => setStage('graphic'), 600),     // Subtle connected-system graphic appears
      setTimeout(() => setStage('reveal'), 1800),      // HRMS-ODOO & Title reveal
      setTimeout(() => setStage('resolve'), 3600),     // Hold & resolve
      setTimeout(() => {
        setStage('transition');
        setTimeout(onComplete, 600);                  // Transition to homepage
      }, 4400)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Center hub coordinates
  const center = { x: 50, y: 40 };

  // Surrounding blank node coordinates
  const systemNodes = [
    { x: 32, y: 24, delay: 0.1 },
    { x: 68, y: 24, delay: 0.25 },
    { x: 24, y: 48, delay: 0.4 },
    { x: 76, y: 48, delay: 0.55 },
    { x: 50, y: 64, delay: 0.7 }
  ];

  const nodeVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: custom
      }
    })
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F1F4B] text-[#FFFFFF] overflow-hidden select-none"
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Premium Background Grid */}
      <div className="absolute inset-0 dark-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#081230_100%)] pointer-events-none" />

      {/* SVG Canvas for Connected Graph */}
      <div className="relative w-full max-w-xl aspect-square flex items-center justify-center p-4">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {systemNodes.map((node, i) => {
            const isVisible = stage === 'graphic' || stage === 'reveal' || stage === 'resolve';
            return (
              <g key={i}>
                {/* Connecting Line */}
                <motion.line
                  x1={`${center.x}%`}
                  y1={`${center.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="rgba(59, 130, 246, 0.25)" // Bright Blue with opacity
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                  initial={{ strokeDashoffset: 60, opacity: 0 }}
                  animate={{
                    strokeDashoffset: isVisible ? 0 : 60,
                    opacity: isVisible ? (stage === 'resolve' ? 0 : 1) : 0,
                  }}
                  transition={{ duration: 1.0, ease: 'easeInOut' }}
                />
                
                {/* Micro-animations: data packets moving along network paths */}
                {isVisible && stage !== 'resolve' && (
                  <motion.circle
                    r="3.5"
                    fill="#3B82F6" // Bright Blue accent
                    animate={{
                      cx: [`${node.x}%`, `${center.x}%`],
                      cy: [`${node.y}%`, `${center.y}%`],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: node.delay,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Network Nodes */}
        <AnimatePresence>
          {(stage === 'graphic' || stage === 'reveal') && (
            <>
              {/* Central hub representing HRMS core connection */}
              <motion.div
                style={{ left: `${center.x}%`, top: `${center.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#2563EB]/15 border border-[#3B82F6]/40 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.15)] backdrop-blur-sm z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <div className="w-4 h-4 rounded-full bg-[#3B82F6] animate-pulse" />
              </motion.div>

              {/* Sub-system generic node circles */}
              {systemNodes.map((node, i) => (
                <motion.div
                  key={i}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-6.5 h-6.5 rounded-full bg-[#0F1F4B] border border-[#3B82F6]/30 flex items-center justify-center shadow-md z-10"
                  custom={node.delay}
                  variants={nodeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main Text Reveal */}
        <AnimatePresence>
          {(stage === 'reveal' || stage === 'resolve') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: 'blur(0px)',
                }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1], // easeOutExpo
                }}
                className="text-center px-6"
              >
                {/* System Label (HRMS-ODOO) */}
                <motion.span
                  className="text-xs font-bold uppercase tracking-[0.45em] text-[#3B82F6] block mb-2.5 font-mono"
                  animate={{ letterSpacing: ['0.3em', '0.45em'] }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                >
                  HRMS-ODOO
                </motion.span>
                
                {/* Main Readability Focus (HUMAN RESOURCE MANAGEMENT SYSTEM) */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#FFFFFF] uppercase max-w-xl mx-auto leading-tight font-sans">
                  Human Resource Management System
                </h1>
                
                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#EFF6FF] font-sans"
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Every workday, perfectly aligned.
                </motion.p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-[#081230] border border-blue-900/40 px-4 py-2 rounded-full cursor-pointer"
      >
        Skip Intro
      </button>
    </motion.div>
  );
};
