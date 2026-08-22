import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  User, 
  FileText, 
  Users, 
  GitPullRequest, 
  CheckCircle 
} from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      id: 1,
      num: '01',
      label: 'Employee',
      desc: 'Requests access, clock-ins, or time-off',
      icon: User,
    },
    {
      id: 2,
      num: '02',
      label: 'Request Logged',
      desc: 'Captured and validated in state',
      icon: FileText,
    },
    {
      id: 3,
      num: '03',
      label: 'HR Review',
      desc: 'Routing details sent to manager review queue',
      icon: Users,
    },
    {
      id: 4,
      num: '04',
      label: 'Approve / Reject',
      desc: 'Workflow decision finalized by HR Admin',
      icon: GitPullRequest,
    },
    {
      id: 5,
      num: '05',
      label: 'Employee Record',
      desc: 'Database state updated and synced in Odoo',
      icon: CheckCircle,
    },
  ];

  // spring-like pop animation for nodes
  const nodeVariants: Variants = {
    hidden: { scale: 0.4, y: 35, opacity: 0 },
    visible: (index: number) => ({
      scale: 1,
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 12,
        delay: index * 0.22 // sequential staggered delay
      }
    })
  };

  // line fill animation
  const lineVariants: Variants = {
    hidden: { width: '0%' },
    visible: {
      width: '100%',
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        delay: 0.1
      }
    }
  };

  const verticalLineVariants: Variants = {
    hidden: { height: '0%' },
    visible: {
      height: '100%',
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        delay: 0.1
      }
    }
  };

  return (
    <section id="workflow" className="py-24 bg-white relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Subtle background mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#D946EF] rounded-full filter blur-[120px] opacity-[0.05]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] bg-[#3B82F6] rounded-full filter blur-[110px] opacity-[0.05]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[13px] font-bold uppercase tracking-[0.25em] text-[#2563EB] block mb-3 font-mono">
            Workflow System
          </span>
          <h2 className="text-3.5xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            HR workflows, connected from request to resolution.
          </h2>
          <p className="mt-4 text-[18px] text-[#64748B] font-semibold leading-relaxed">
            Every module coordinates to ensure automatic records sync and database consistency.
          </p>
        </div>

        {/* Workflow Timeline Diagram Container */}
        <div className="relative max-w-5xl mx-auto py-10">
          
          {/* Connecting Line - Horizontal for Desktop */}
          <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[2.5px] bg-slate-100 z-0">
            <motion.div
              variants={lineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="h-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#EC4899]"
            />
          </div>

          {/* Connecting Line - Vertical for Mobile */}
          <div className="md:hidden absolute left-[39px] top-10 bottom-10 w-[2.5px] bg-slate-100 z-0">
            <motion.div
              variants={verticalLineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="w-full bg-gradient-to-b from-[#2563EB] via-[#7C3AED] to-[#EC4899]"
            />
          </div>

          {/* Timeline Nodes Grid */}
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-12 md:gap-4 relative z-10">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.id}
                  custom={idx}
                  variants={nodeVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-5 md:gap-4 flex-1"
                >
                  {/* Circle Indicator with Icon */}
                  <div className="relative flex-shrink-0">
                    {/* Active highlight glow container */}
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-[#2563EB]/80 shadow-[0_0_20px_rgba(37,99,235,0.12)] flex items-center justify-center text-[#2563EB] transition-all duration-300 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
                      <IconComponent className="w-6.5 h-6.5" />
                    </div>

                    {/* Numeric Badge label */}
                    <span className="absolute -top-1.5 -right-1.5 bg-[#0F1F4B] text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-full font-mono">
                      {step.num}
                    </span>
                  </div>

                  {/* Step Description Content */}
                  <div className="flex flex-col md:items-center">
                    <span className="text-sm font-black text-[#0F172A] tracking-tight uppercase block">
                      {step.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-1.5 max-w-[170px] leading-normal md:text-center">
                      {step.desc}
                    </span>
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
