import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Calendar, 
  GitPullRequest, 
  Coins, 
  FileText, 
  Download
} from 'lucide-react';

// Custom Interactive Tilt & Glow Card Component
const FeatureCard: React.FC<{
  index: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  bgClass: string;
  children: React.ReactNode;
}> = ({ index, icon, title, description, bgClass, children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const currentRect = e.currentTarget.getBoundingClientRect();
    setRect(currentRect);
    setMousePos({
      x: e.clientX - currentRect.left,
      y: e.clientY - currentRect.top
    });
  };

  // Stagger reveal variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  // Calculate rotation angles for 3D tilt
  const rotateX = isHovered && rect ? ((mousePos.y - rect.height / 2) / (rect.height / 2)) * -3.5 : 0;
  const rotateY = isHovered && rect ? ((mousePos.x - rect.width / 2) / (rect.width / 2)) * 3.5 : 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)` 
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'none' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`relative border rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300 ${bgClass} ${
        isHovered ? 'shadow-md border-[#63B64F]/30' : ''
      }`}
    >
      {/* Background Hover Radial Glow */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 182, 79, 0.08), transparent 80%)`
          }}
        />
      )}

      <div>
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl transition-all duration-300 ${
            isHovered ? 'bg-[#182018] text-[#FFFDF2] shadow-md' : 'bg-white/60 text-[#687067]'
          }`}>
            {icon}
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#63B64F]/80 font-mono">
            Platform Unit
          </span>
        </div>

        <h3 className="text-xl font-black text-[#182018] tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#687067] font-semibold leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Unique Mini UI Preview Render Container */}
      <div className="bg-white/80 border border-slate-200/50 rounded-xl p-4 text-left font-sans shadow-2xs select-none">
        {children}
      </div>
    </motion.div>
  );
};

export const PlatformSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-[#F8F6E8] relative overflow-hidden">
      {/* Top boundary separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-[#63B64F]/10" />

      {/* Static mesh grid decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-[#A8DFA0] rounded-full filter blur-[120px] opacity-[0.12]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-[#CDEB72] rounded-full filter blur-[130px] opacity-[0.1]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[13px] font-bold uppercase tracking-[0.25em] text-[#63B64F] block mb-3 font-mono">
            Platform Operations
          </span>
          <h2 className="text-3.5xl sm:text-5xl font-black text-[#182018] tracking-tight leading-tight">
            Everything you need to manage HR
          </h2>
          <p className="mt-4 text-[18px] text-[#687067] font-semibold leading-relaxed">
            Powerful features to simplify HR operations and empower your team.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Employee Management */}
          <FeatureCard
            index={0}
            icon={<Users className="w-5.5 h-5.5" />}
            title="Employee Management"
            description="Consolidate staff profiles, files, and contracts inside a secure corporate directory."
            bgClass="bg-white/80 border-[#63B64F]/15 hover:bg-[#DCEFD5]/40"
            children={
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/50">
                  <div className="w-7 h-7 rounded-full bg-[#DCEFD5] flex items-center justify-center font-bold text-[9px] text-[#63B64F]">
                    CO
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#182018] block leading-none">Clara Oswald</span>
                    <span className="text-[8px] text-[#687067] mt-1 block font-semibold leading-none">Senior PM</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[9px] bg-white border border-slate-100 p-2 rounded shadow-3xs">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <FileText className="w-3.5 h-3.5 text-[#63B64F] flex-shrink-0" />
                    <span className="font-bold text-[#182018] truncate">contract_signed.pdf</span>
                  </div>
                  <Download className="w-3 h-3 text-[#687067]" />
                </div>
              </div>
            }
          />

          {/* Card 2: Attendance */}
          <FeatureCard
            index={1}
            icon={<Clock className="w-5.5 h-5.5" />}
            title="Attendance Tracker"
            description="Track daily shift times, login durations, and check-in milestones in real time."
            bgClass="bg-white/80 border-[#63B64F]/15 hover:bg-[#DCEFD5]/40"
            children={
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[10px] font-semibold text-[#687067]">
                  <span>Shift Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCEFD5] text-[#63B64F] text-[8px] font-black uppercase tracking-wider border border-[#63B64F]/20">
                    Present
                  </span>
                </div>
                <div className="bg-white border border-slate-100 p-2.5 rounded shadow-3xs flex items-center justify-between text-[9px] font-mono">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[#687067] font-bold uppercase font-sans">Check-In</span>
                    <span className="font-bold text-[#182018] mt-0.5">09:02:14 AM</span>
                  </div>
                  <div className="w-px h-6 bg-slate-100" />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[#687067] font-bold uppercase font-sans">Daily Hours</span>
                    <span className="font-bold text-[#63B64F] mt-0.5">8.5 Hrs Logged</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* Card 3: Leave & Time-Off */}
          <FeatureCard
            index={2}
            icon={<Calendar className="w-5.5 h-5.5" />}
            title="Leave & Time-Off"
            description="Manage annual leave and medical leaves with integrated manager approval paths."
            bgClass="bg-white/80 border-[#63B64F]/15 hover:bg-[#DCEFD5]/40"
            children={
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="font-bold text-[#182018]">Annual Paid Leave</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCEFD5] text-[#63B64F] text-[8px] font-black uppercase tracking-wider border border-[#63B64F]/20">
                    Approved
                  </span>
                </div>
                <div className="bg-white border border-slate-100 p-2.5 rounded shadow-3xs text-[9px]">
                  <div className="font-bold text-[#182018]">Aug 25 - Aug 27</div>
                  <div className="text-[#687067] mt-1 font-semibold leading-none">Employee: Sarah Vance · 3 Days</div>
                </div>
              </div>
            }
          />

          {/* Card 4: Approval Workflows */}
          <FeatureCard
            index={3}
            icon={<GitPullRequest className="w-5.5 h-5.5" />}
            title="Approval Workflows"
            description="Route employee request notifications directly to managers for quick sign-offs."
            bgClass="bg-white/80 border-[#63B64F]/15 hover:bg-[#DCEFD5]/40"
            children={
              <div className="flex items-center justify-between text-[9px] bg-white border border-slate-200/50 p-2.5 rounded shadow-3xs">
                <div>
                  <span className="font-bold text-[#182018] block leading-none">Sick Leave Request</span>
                  <span className="text-[8px] text-[#687067] font-semibold block mt-1 leading-none font-mono">ID: WF-9284</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="bg-[#63B64F] hover:bg-[#52a13e] text-white text-[8px] font-bold uppercase tracking-wider py-1 px-2 rounded cursor-pointer border border-[#63B64F]">
                    Approve
                  </button>
                  <button className="bg-transparent hover:bg-slate-50 text-[#687067] border border-slate-200 text-[8px] font-bold uppercase tracking-wider py-1 px-2 rounded cursor-pointer">
                    Reject
                  </button>
                </div>
              </div>
            }
          />

          {/* Card 5: Payroll Visibility */}
          <FeatureCard
            index={4}
            icon={<Coins className="w-5.5 h-5.5" />}
            title="Payroll Visibility"
            description="Review basic salary scales, standard allowances, and tax withholding summaries."
            bgClass="bg-white/80 border-[#63B64F]/15 hover:bg-[#DCEFD5]/40"
            children={
              <div className="flex flex-col gap-2 font-mono text-[9px] font-semibold text-[#687067]">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>Basic Pay</span>
                  <span className="text-[#182018] font-bold">$6,500.00</span>
                </div>
                <div className="flex justify-between text-[#63B64F] font-bold">
                  <span>Net Payout</span>
                  <span>$6,345.00</span>
                </div>
              </div>
            }
          />

        </div>

      </div>
    </section>
  );
};
