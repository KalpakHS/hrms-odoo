import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Calendar, 
  GitPullRequest, 
  Coins, 
  Check, 
  X, 
  FileText
} from 'lucide-react';

export const PlatformSection: React.FC = () => {
  const features = [
    {
      id: 1,
      title: 'Employee Management',
      desc: 'Employee profiles, job details, documents and essential information.',
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      preview: (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex flex-col gap-2 mt-4 text-left select-none">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[9px] text-blue-700">CO</div>
            <div>
              <div className="text-[10px] font-black text-slate-800 leading-none">Clara Oswald</div>
              <span className="text-[8px] text-slate-400 font-semibold leading-none mt-0.5 block">Senior Product PM</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[8px] font-semibold bg-white p-1.5 rounded border border-slate-100">
            <span className="text-slate-650 truncate max-w-[110px]">employment_contract.pdf</span>
            <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Attendance',
      desc: 'Daily and weekly attendance with check-in and check-out.',
      icon: Clock,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      preview: (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex flex-col gap-2.5 mt-4 text-left select-none">
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Shift Attendance</span>
            <span className="text-emerald-600 font-mono">Present</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 pt-1">
            {['M', 'T', 'W', 'T', 'F'].map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[8px] text-slate-450 font-bold font-mono">{day}</span>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px] ${
                  idx === 3 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}>
                  <Check className="w-2.5 h-2.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Leave & Time-Off',
      desc: 'Employees can request leave while HR reviews and approves or rejects requests.',
      icon: Calendar,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      preview: (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex flex-col gap-2 mt-4 text-left select-none">
          <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-150">
            <span>Paid Leave</span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">Approved</span>
          </div>
          <div className="text-[9px] font-semibold text-slate-700 leading-tight mt-1">
            <div><span className="text-slate-450 font-medium">Dates:</span> Aug 25 - Aug 27</div>
            <div className="mt-0.5"><span className="text-slate-450 font-medium">Reason:</span> Personal work</div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Approval Workflows',
      desc: 'Connect employee requests with HR/Admin approval.',
      icon: GitPullRequest,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      preview: (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex flex-col gap-2 mt-4 text-left select-none">
          <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
            <span>Review Request</span>
            <span className="text-amber-600 font-mono text-[9px] animate-pulse font-bold">Pending HR</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-emerald-600 text-white text-[8px] font-bold uppercase tracking-wider py-1.5 px-2.5 rounded hover:bg-emerald-700 transition-colors flex items-center justify-center gap-0.5 cursor-pointer">
              <Check className="w-2.5 h-2.5" /> Approve
            </button>
            <button className="flex-1 bg-white border border-rose-350 text-rose-600 text-[8px] font-bold uppercase tracking-wider py-1.5 px-2.5 rounded hover:bg-rose-50 transition-colors flex items-center justify-center gap-0.5 cursor-pointer">
              <X className="w-2.5 h-2.5" /> Reject
            </button>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Payroll Visibility',
      desc: 'Employee payroll visibility and HR salary structure management.',
      icon: Coins,
      iconColor: 'text-amber-650',
      iconBg: 'bg-amber-50',
      preview: (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex flex-col gap-1.5 mt-4 text-left select-none font-semibold text-[9px]">
          <div className="flex justify-between text-slate-500 border-b border-slate-150 pb-1.5 mb-1.5">
            <span>Basic Base Salary</span>
            <span className="font-mono text-slate-800">$6,500.00</span>
          </div>
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Housing Allowance</span>
            <span className="font-mono text-slate-700">+$800.00</span>
          </div>
          <div className="flex justify-between text-rose-500 font-medium">
            <span>Tax Deductions</span>
            <span className="font-mono">-$980.00</span>
          </div>
          <div className="flex justify-between text-slate-800 font-extrabold border-t border-slate-150 pt-1.5 mt-1">
            <span>Net Disbursed</span>
            <span className="font-mono text-emerald-600">$6,345.00</span>
          </div>
        </div>
      )
    }
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="features" className="py-24 bg-[#F8FAFC] relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Subtle background mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-[#6D28D9] rounded-full filter blur-[110px] opacity-[0.06]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-[#F97316] rounded-full filter blur-[130px] opacity-[0.05]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2563EB] block mb-3 font-mono">
            Platform Operations
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Everything you need to manage HR
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
            Powerful features to simplify HR operations and empower your team.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                variants={itemVariants}
                className="group bg-white border border-[#E2E8F0] p-6 rounded-xl hover:shadow-lg hover:border-[#2563EB]/35 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon Block */}
                  <div className={`w-9.5 h-9.5 rounded-lg flex items-center justify-center ${feat.iconBg} ${feat.iconColor} mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-tight">
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 text-xs text-[#64748B] leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>

                {/* Miniature UI View */}
                <div className="w-full mt-4">
                  {feat.preview}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};
