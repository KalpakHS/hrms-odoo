import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import {
  User,
  LogOut,
  CheckCircle,
  LogOut as LogOutIcon,
  ShieldAlert,
  ChevronDown,
  Plane,
  Circle,
  Building2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    activeView,
    setActiveView,
    switchRole,
    logout,
    checkIn,
    checkOut,
    openProfileModal,
    attendanceRecords,
  } = useProjectContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.find(
    (r) => r.employeeId === currentUser?.id && r.date === todayStr
  );
  const isCheckedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;

  const renderStatusDot = () => {
    const status = currentUser?.presenceStatus || 'absent';
    switch (status) {
      case 'present':
        return (
          <span
            className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm animate-pulse"
            title="Present"
          />
        );
      case 'leave':
        return (
          <div
            className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center border-2 border-white"
            title="On Leave"
          >
            <Plane className="w-2 h-2 text-white" />
          </div>
        );
      case 'absent':
      default:
        return (
          <span title="Absent">
            <Circle className="w-3.5 h-3.5 fill-amber-400 text-amber-400 border-2 border-white" />
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-900 font-sans shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name: Bold Lowercase Geometric Sans */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[#FEF08A] border border-yellow-300 flex items-center justify-center font-black text-slate-900 text-lg shadow-sm group-hover:scale-105 transition duration-200">
              d.
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-brand-logo block leading-none">
                dayflow.
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block leading-none mt-0.5">
                HRMS Suite
              </span>
            </div>
          </button>

          {/* Navigation Links: Pill-Shaped Container */}
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1 sm:p-1.5 rounded-full border border-slate-200/70 overflow-x-auto">
            <button
              onClick={() => setActiveView('home')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${
                activeView === 'home'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('employees')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${
                activeView === 'employees'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveView('attendance')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${
                activeView === 'attendance'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveView('timeoff')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${
                activeView === 'timeoff'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Time Off
            </button>
          </nav>
        </div>

        {/* Right Suite: Role Switcher & User Systray Dropdown */}
        <div className="flex items-center gap-3">
          {/* Soft Lavender Role Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#F3E8FF] border border-[#E9D5FF] px-3.5 py-1.5 rounded-full text-xs shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-[#9333EA]" />
            <span className="text-[#9333EA] font-semibold">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value as 'admin' | 'employee')}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="admin">Admin / HR Officer</option>
              <option value="employee">Standard Employee</option>
            </select>
          </div>

          {/* User Profile Systray Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 p-1.5 pr-3.5 rounded-full shadow-floating transition cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                  <div className="absolute -top-1 -right-1">{renderStatusDot()}</div>
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block leading-tight">
                    {currentUser.loginId}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Systray Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-[28px] shadow-floating-lg p-4 z-50 space-y-3"
                  >
                    {/* User Summary Card */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {currentUser.name}
                        </h4>
                        <p className="text-[10px] text-slate-600 font-mono font-semibold">
                          {currentUser.loginId}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{currentUser.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Check In / Check Out Systray Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          checkIn();
                          setIsDropdownOpen(false);
                        }}
                        disabled={isCheckedIn}
                        className={`py-2.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isCheckedIn
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Check In →
                      </button>

                      <button
                        onClick={() => {
                          checkOut();
                          setIsDropdownOpen(false);
                        }}
                        disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
                        className={`py-2.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          !todayAttendance?.checkIn || !!todayAttendance?.checkOut
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm cursor-pointer'
                        }`}
                      >
                        <LogOutIcon className="w-3.5 h-3.5" />
                        Check Out →
                      </button>
                    </div>

                    <div className="h-px bg-slate-200/80" />

                    {/* Dropdown Action Items */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          openProfileModal(currentUser, false);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-full flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-full flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Luminous Yellow Header Accent Button */
            <button
              onClick={() => setActiveView('auth')}
              className="bg-[#FEF08A] hover:bg-[#FDE047] text-slate-900 font-bold text-xs px-5 py-2.5 rounded-full border border-yellow-300 shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
