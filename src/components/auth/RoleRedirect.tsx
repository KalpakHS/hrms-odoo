import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Clock, 
  Calendar, 
  Coins, 
  LogOut, 
  Building,
  FileText,
  UserCheck
} from 'lucide-react';

interface RoleRedirectProps {
  user: {
    loginId: string;
    name: string;
    role: 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
    email: string;
    empCode: string;
  };
  onLogout: () => void;
}

export const RoleRedirect: React.FC<RoleRedirectProps> = ({ user, onLogout }) => {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);
  
  // HR Mock leave requests
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 101, name: 'Sarah Vance', type: 'Paid Leave', duration: '3 Days', dates: 'Aug 25 - Aug 27', status: 'PENDING' },
    { id: 102, name: 'Martha Jones', type: 'Medical Leave', duration: '1 Day', dates: 'Sep 02 - Sep 02', status: 'PENDING' }
  ]);

  const handleClockToggle = () => {
    if (clockedIn) {
      setClockedIn(false);
      setClockTime(null);
    } else {
      const now = new Date();
      setClockedIn(true);
      setClockTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  const handleLeaveDecision = (id: number, approved: boolean) => {
    setLeaveRequests(prev => 
      prev.map(req => req.id === id ? { ...req, status: approved ? 'APPROVED' : 'REJECTED' } : req)
    );
  };

  // Render Super Admin Dashboard
  const renderSuperAdmin = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#EFF6FF] border border-[#BFDBFE]/65 p-6 rounded-2xl md:col-span-2 flex flex-col gap-4 text-left">
        <h3 className="text-lg font-black text-[#182018] flex items-center gap-2">
          <Shield className="w-5.5 h-5.5 text-[#2563EB]" />
          System Configuration
        </h3>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          Manage system tenants, database syncing schedules, database backups, Odoo credentials, and environment API variables.
        </p>
        <div className="bg-white border border-slate-200/50 p-4 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#182018] block">Database Status</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">mysql://localhost:3306/dayflow_hrms</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black border border-emerald-100 uppercase tracking-wider">
            Connected
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button className="bg-[#182018] hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider py-3 px-4 rounded-lg cursor-pointer border-none shadow-3xs">
            Sync Database
          </button>
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-[#182018] text-[10px] font-bold uppercase tracking-wider py-3 px-4 rounded-lg cursor-pointer shadow-3xs">
            View API Logs
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E9E5D9] p-6 rounded-2xl flex flex-col justify-between text-left shadow-2xs">
        <div>
          <h3 className="text-lg font-black text-[#182018] flex items-center gap-2 mb-2">
            <Building className="w-5.5 h-5.5 text-[#163A2B]" />
            Organization
          </h3>
          <span className="text-xs text-slate-400 font-bold block mb-4">Dayflow Internal</span>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-1.5 font-mono">
              <span className="text-slate-450">Active Users</span>
              <span className="font-bold text-[#182018]">248 Employees</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5 font-mono">
              <span className="text-slate-450">HR Managers</span>
              <span className="font-bold text-[#182018]">4 Accounts</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-450">Company Code</span>
              <span className="font-bold text-[#163A2B]">DF</span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] font-bold text-slate-450 uppercase">
          License Level: Pro Cloud
        </div>
      </div>
    </div>
  );

  // Render HR Admin/Officer Dashboard
  const renderHR = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Leave request approvals list */}
      <div className="bg-white border border-[#E9E5D9] p-6 rounded-2xl md:col-span-2 flex flex-col gap-4 text-left shadow-2xs">
        <h3 className="text-lg font-black text-[#182018] flex items-center gap-2">
          <Calendar className="w-5.5 h-5.5 text-[#163A2B]" />
          Leave & Workflows Approval Queue
        </h3>
        
        <div className="flex flex-col gap-3 mt-2">
          {leaveRequests.map(req => (
            <div key={req.id} className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[#182018] block">{req.name} · {req.type}</span>
                <span className="text-[10px] text-slate-400 mt-1 block leading-none font-semibold">
                  Dates: {req.dates} ({req.duration})
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                {req.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => handleLeaveDecision(req.id, true)}
                      className="bg-[#163A2B] hover:bg-[#0f2a1f] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded cursor-pointer border-none flex items-center gap-1"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleLeaveDecision(req.id, false)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-[#687067] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                    req.status === 'APPROVED' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directory Quick-Links */}
      <div className="bg-[#FAF7F0] border border-[#E9E5D9] p-6 rounded-2xl flex flex-col gap-4 text-left shadow-2xs">
        <h3 className="text-lg font-black text-[#182018] flex items-center gap-2">
          <Users className="w-5.5 h-5.5 text-[#163A2B]" />
          HR Quick Actions
        </h3>
        
        <div className="flex flex-col gap-2.5 mt-2 text-xs">
          <button className="bg-white border border-slate-200 hover:border-[#163A2B]/40 hover:bg-slate-50/50 p-3.5 rounded-xl font-bold text-[#182018] text-left transition-colors flex items-center justify-between group cursor-pointer">
            <span>Add New Employee</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-[#163A2B]" />
          </button>
          
          <button className="bg-white border border-slate-200 hover:border-[#163A2B]/40 hover:bg-slate-50/50 p-3.5 rounded-xl font-bold text-[#182018] text-left transition-colors flex items-center justify-between group cursor-pointer">
            <span>Generate Payroll Reports</span>
            <Coins className="w-4 h-4 text-slate-400 group-hover:text-[#163A2B]" />
          </button>

          <button className="bg-white border border-slate-200 hover:border-[#163A2B]/40 hover:bg-slate-50/50 p-3.5 rounded-xl font-bold text-[#182018] text-left transition-colors flex items-center justify-between group cursor-pointer">
            <span>Odoo Synchronization log</span>
            <Clock className="w-4 h-4 text-slate-400 group-hover:text-[#163A2B]" />
          </button>
        </div>
      </div>
    </div>
  );

  // Render Manager Dashboard
  const renderManager = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Team Oversight Widget */}
      <div className="bg-white border border-[#E9E5D9] p-6 rounded-2xl md:col-span-2 flex flex-col gap-4 text-left shadow-2xs">
        <h3 className="text-lg font-black text-[#182018] flex items-center gap-2">
          <Users className="w-5.5 h-5.5 text-[#163A2B]" />
          My Direct Reports
        </h3>
        
        <div className="flex flex-col gap-3 mt-2 text-xs">
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#DCEFD5] text-[#163A2B] font-bold flex items-center justify-center">SV</div>
              <div>
                <span className="font-bold text-[#182018] block">Sarah Vance</span>
                <span className="text-[10px] text-slate-400 font-semibold">UX Designer</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black border border-emerald-100 uppercase tracking-wider">
              Present
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-650 font-bold flex items-center justify-center font-sans">MJ</div>
              <div>
                <span className="font-bold text-[#182018] block">Martha Jones</span>
                <span className="text-[10px] text-slate-400 font-semibold">Frontend Dev</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-black border border-slate-200 uppercase tracking-wider">
              Absent
            </span>
          </div>
        </div>
      </div>

      {/* Team Leave Approvals */}
      <div className="bg-[#FAF7F0] border border-[#E9E5D9] p-6 rounded-2xl flex flex-col gap-4 text-left shadow-2xs">
        <h3 className="text-lg font-black text-[#182018] flex items-center gap-2">
          <Calendar className="w-5.5 h-5.5 text-[#163A2B]" />
          Team Leave Actions
        </h3>
        <p className="text-xs text-[#687067] font-semibold leading-relaxed">
          You have no pending leave approval requests from your direct reports today.
        </p>
      </div>
    </div>
  );

  // Render Employee Dashboard
  const renderEmployee = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Clock in/out widget */}
      <div className="bg-white border border-[#E9E5D9] p-6 rounded-2xl flex flex-col justify-between text-left shadow-2xs">
        <div>
          <h3 className="text-lg font-black text-[#182018] flex items-center gap-2 mb-2">
            <Clock className="w-5.5 h-5.5 text-[#163A2B]" />
            Attendance Clock
          </h3>
          <span className="text-xs text-slate-450 font-bold block mb-6">Record your daily shift login</span>
          
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center justify-between text-xs font-mono mb-6">
            <div>
              <span className="text-[9px] text-[#687067] font-bold block uppercase font-sans">Status</span>
              <span className={`font-bold mt-0.5 block ${clockedIn ? 'text-emerald-600' : 'text-red-500'}`}>
                {clockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
              </span>
            </div>
            {clockedIn && (
              <div>
                <span className="text-[9px] text-[#687067] font-bold block uppercase font-sans">Checked In At</span>
                <span className="font-bold text-[#182018] mt-0.5 block">{clockTime}</span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleClockToggle}
          className={`w-full text-xs font-bold uppercase tracking-wider py-4.5 rounded-full shadow-xs hover:shadow transition-all duration-200 cursor-pointer border-none ${
            clockedIn 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-[#163A2B] hover:bg-[#0f2a1f] text-white'
          }`}
        >
          {clockedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      {/* Salary payslips summary */}
      <div className="bg-white border border-[#E9E5D9] p-6 rounded-2xl flex flex-col justify-between text-left shadow-2xs">
        <div>
          <h3 className="text-lg font-black text-[#182018] flex items-center gap-2 mb-2">
            <Coins className="w-5.5 h-5.5 text-[#163A2B]" />
            Payroll & Payslips
          </h3>
          <span className="text-xs text-slate-455 font-bold block mb-6">Your compensation summary</span>
          
          <div className="flex flex-col gap-2 text-xs font-mono text-[#687067] font-semibold">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Basic Salary</span>
              <span className="text-[#182018] font-bold">$6,500.00</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Allowances</span>
              <span className="text-[#182018] font-bold">+$800.00</span>
            </div>
            <div className="flex justify-between text-[#163A2B] font-bold">
              <span>Net Payout</span>
              <span>$6,345.00</span>
            </div>
          </div>
        </div>

        <button className="w-full bg-[#182018] hover:bg-[#163A2B] text-white text-[10px] font-bold uppercase tracking-wider py-3.5 rounded-xl transition-colors cursor-pointer border-none flex items-center justify-center gap-1.5 shadow-3xs mt-6">
          <FileText className="w-4 h-4" />
          Download Latest Payslip (PDF)
        </button>
      </div>

      {/* Time off Request status */}
      <div className="bg-[#FAF7F0] border border-[#E9E5D9] p-6 rounded-2xl flex flex-col justify-between text-left shadow-2xs">
        <div>
          <h3 className="text-lg font-black text-[#182018] flex items-center gap-2 mb-2">
            <Calendar className="w-5.5 h-5.5 text-[#163A2B]" />
            Leave Balance
          </h3>
          <span className="text-xs text-slate-450 font-bold block mb-6 font-sans">Submit time-off requests</span>
          
          <div className="bg-white border border-slate-200/50 p-4 rounded-xl text-xs flex justify-between font-mono mb-4">
            <span className="text-slate-500 font-sans">Remaining Vacation</span>
            <span className="font-bold text-[#182018]">12 Days</span>
          </div>

          <div className="bg-white border border-slate-200/50 p-4 rounded-xl text-xs flex justify-between font-mono">
            <span className="text-slate-500 font-sans">Sick Leave Balance</span>
            <span className="font-bold text-[#182018]">6 Days</span>
          </div>
        </div>

        <button className="w-full bg-white hover:bg-slate-50 text-[#163A2B] border border-[#163A2B]/30 font-bold text-xs uppercase tracking-wider py-4 rounded-full transition-all duration-200 cursor-pointer mt-6">
          Request Time-Off
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between font-sans text-[#182018] relative overflow-hidden select-none">
      
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-[#A8DFA0] rounded-full filter blur-[120px] opacity-[0.08]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-[#CDEB72] rounded-full filter blur-[130px] opacity-[0.06]" />
      </div>

      {/* Dashboard Top Header Bar */}
      <header className="w-full border-b border-[#E9E5D9] bg-white/70 backdrop-blur-md py-4.5 px-6 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-end gap-1 h-5.5">
              <div className="w-1.5 h-3.5 rounded-full bg-[#A8DFA0]" />
              <div className="w-1.5 h-5.5 rounded-full bg-[#163A2B]" />
              <div className="w-1.5 h-2.5 rounded-full bg-[#182018]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#182018]">
              Dayflow<span className="text-[#D9A036]">.</span>
            </span>
          </div>

          {/* User profile & logout */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 border border-[#E9E5D9] bg-white rounded-full py-1.5 px-3.5 shadow-3xs">
              <UserCheck className="w-3.5 h-3.5 text-[#163A2B]" />
              <span className="text-[#182018] font-bold">{user.name}</span>
              <span className="w-px h-3.5 bg-slate-200" />
              <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">{user.role}</span>
            </div>
            <button 
              onClick={onLogout}
              className="bg-transparent border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600 py-1.5 px-3.5 rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1 font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-8 py-12 flex-grow relative z-10 flex flex-col gap-8 text-center justify-center">
        
        {/* Welcome Board */}
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#163A2B] font-mono">
            Secure Session Active
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-serif font-medium tracking-tight text-[#182018]">
            Welcome to Dayflow Portal<span className="text-[#D9A036]">.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
            Role: <span className="font-mono text-[10px] bg-slate-100 text-slate-655 font-bold px-2 py-0.5 rounded uppercase tracking-wider">{user.role}</span> · Account code: <code className="font-bold">{user.empCode}</code>
          </p>
        </div>

        {/* Dynamic Role Dashboard render */}
        {user.role === 'SUPER_ADMIN' && renderSuperAdmin()}
        {user.role === 'HR' && renderHR()}
        {user.role === 'MANAGER' && renderManager()}
        {user.role === 'EMPLOYEE' && renderEmployee()}

      </main>

      <footer className="w-full border-t border-[#E9E5D9] bg-white/40 py-5 text-center text-xs text-[#687067]/80 font-medium relative z-10">
        Dayflow HRMS · Connected Odoo Operations
      </footer>

    </div>
  );
};
