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
      label: 'Employee',
      desc: 'Requests access, clock-ins, or time-off',
      icon: User,
    },
    {
      id: 2,
      label: 'Request Logged',
      desc: 'Captured and validated in state',
      icon: FileText,
    },
    {
      id: 3,
      label: 'HR Review',
      desc: 'Routing details sent to manager review queue',
      icon: Users,
    },
    {
      id: 4,
      label: 'Approve / Reject',
      desc: 'Workflow decision finalized by HR Admin',
      icon: GitPullRequest,
    },
    {
      id: 5,
      label: 'Employee Record',
      desc: 'Database state updated and synced in Odoo',
      icon: CheckCircle,
    },
  ];

  const stepVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.15,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section id="workflow" className="py-24 bg-white relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Subtle background mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#D946EF] rounded-full filter blur-[120px] opacity-[0.05] animate-mesh-3" />
        <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] bg-[#3B82F6] rounded-full filter blur-[110px] opacity-[0.05] animate-mesh-4" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2563EB] block mb-3">
            Workflow System
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-black text-[#0F172A] tracking-tight leading-tight">
            HR workflows, connected from request to resolution.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
            Every module coordinates to ensure automatic records sync and database consistency.
          </p>
        </div>

        {/* Workflow Timeline Diagram Container */}
        <div className="relative max-w-5xl mx-auto py-6">
          
          {/* Connecting Line - Horizontal for Desktop */}
          <div className="hidden md:block absolute top-[44px] left-[8%] right-[8%] h-[2px] bg-slate-200 z-0">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
              className="h-full bg-[#2563EB]"
            />
          </div>

          {/* Connecting Line - Vertical for Mobile */}
          <div className="md:hidden absolute left-[38px] top-10 bottom-10 w-[2px] bg-slate-250 z-0">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
              className="w-full bg-[#2563EB]"
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  custom={idx}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-4.5 text-left md:text-center group"
                >
                  {/* Step Number & Icon Circle */}
                  <div className="w-16 h-16 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#2563EB] relative z-10 flex-shrink-0 group-hover:border-[#2563EB]/40 group-hover:shadow transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    {/* Badge Step Number */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0F1F4B] text-white text-[9px] font-black flex items-center justify-center border border-white font-mono">
                      {step.id}
                    </span>
                  </div>

                  {/* Step Text Copy */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                      {step.label}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed font-semibold">
                      {step.desc}
                    </p>
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
