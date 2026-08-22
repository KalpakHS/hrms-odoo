import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  User, 
  Clock, 
  Calendar, 
  Coins, 
  ShieldCheck, 
  Layers, 
  FolderLock,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

export const RoleBasedSection: React.FC = () => {
  const employeeItems = [
    { name: 'Personal Profile', desc: 'Manage contact info, tax declarations, and contracts.', icon: User },
    { name: 'Attendance Self-Clock', desc: 'Perform check-in/out logs with auto hours calc.', icon: Clock },
    { name: 'Time-Off Requests', desc: 'Submit leave request forms and track workflow approvals.', icon: Calendar },
    { name: 'Payroll View', desc: 'Read-only visibility into monthly disbursed payslips.', icon: Coins }
  ];

  const adminItems = [
    { name: 'Employee Directory', desc: 'Manage organization structures, job titles, and permissions.', icon: Layers },
    { name: 'Attendance Oversight', desc: 'Monitor daily attendance check-ins and audit log entries.', icon: FileCheck2 },
    { name: 'Leave Approvals', desc: 'Review, approve, or reject employee time-off requests.', icon: CheckCircle2 },
    { name: 'Payroll Control', desc: 'Manage payroll cycles, salary levels, and allowances.', icon: FolderLock }
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
        ease: [0.16, 1, 0.3, 1] as const,
      }
    })
  };

  return (
    <section id="about" className="py-24 bg-[#F8FAFC] relative">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2563EB] block mb-3">
            Role-Based Experiences
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-black text-[#0F172A] tracking-tight leading-tight">
            One platform for employees and HR.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
            Different permissions, same workspace. Dayflow aligns employees and administrators.
          </p>
        </div>

        {/* Side-by-Side Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Panel 1: Employee Experience */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0F172A]">Employee Workspace</h3>
                  <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider block mt-0.5">Standard Self-Service</span>
                </div>
              </div>

              {/* Items checklist */}
              <div className="flex flex-col gap-5">
                {employeeItems.map((item) => (
                  <div key={item.name} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{item.name}</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed mt-1 font-semibold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom visual tag */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              Designed for simple, mobile self-service
            </div>
          </motion.div>

          {/* Panel 2: HR Admin / Manager Experience */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-[#0F1F4B] border border-blue-905 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between text-white"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-[#3B82F6] flex items-center justify-center border border-blue-800/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">HR & Admin Control</h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Full Management Portal</span>
                </div>
              </div>

              {/* Items checklist */}
              <div className="flex flex-col gap-5">
                {adminItems.map((item) => (
                  <div key={item.name} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-950/60 border border-blue-900/40 flex items-center justify-center text-[#3B82F6] flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom visual tag */}
            <div className="mt-8 pt-6 border-t border-blue-900/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              Role-Based Admin Staging Active
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
