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
            className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#111827] shadow-sm animate-pulse"
            title="Present"
          />
        );
      case 'leave':
        return (
          <div
            className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center border-2 border-[#111827]"
            title="On Leave"
          >
            <Plane className="w-2 h-2 text-white" />
          </div>
        );
      case 'absent':
      default:
        return (
          <span title="Absent">
            <Circle className="w-3 h-3 fill-amber-500 text-amber-500 border-2 border-[#111827]" />
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800 text-slate-100 font-sans shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="flex items-end gap-1 h-5.5">
              <div className="w-1.5 h-3.5 bg-blue-500 rounded-full group-hover:h-4.5 transition-all duration-300" />
              <div className="w-1.5 h-5.5 bg-blue-600 rounded-full" />
              <div className="w-1.5 h-2.5 bg-purple-500 rounded-full group-hover:h-3.5 transition-all duration-300" />
            </div>
            <div className="text-left">
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                Dayflow
              </span>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest leading-none">
                PulseFlow HRMS
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('home')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                activeView === 'home'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('employees')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                activeView === 'employees'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveView('attendance')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                activeView === 'attendance'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveView('timeoff')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                activeView === 'timeoff'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Time Off
            </button>
          </nav>
        </div>

        {/* Right Suite: Demo Role Switcher + Systray Avatar */}
        <div className="flex items-center gap-4">
          {/* Role Switcher Demo Control */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#111827] px-3 py-1 rounded-xl border border-slate-800 text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value as 'admin' | 'employee')}
              className="bg-transparent font-bold text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="admin" className="bg-slate-900 text-white">
                Admin / HR Officer
              </option>
              <option value="employee" className="bg-slate-900 text-white">
                Standard Employee
              </option>
            </select>
          </div>

          {/* User Profile Avatar Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 bg-[#111827] hover:bg-slate-800 border border-slate-800 p-1.5 pr-3 rounded-2xl transition cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="absolute -top-1 -right-1">{renderStatusDot()}</div>
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
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
                    className="absolute right-0 mt-2 w-64 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-3"
                  >
                    {/* User Card */}
                    <div className="p-3 bg-[#1E293B] rounded-xl border border-slate-800 flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-xl object-cover border border-blue-500"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-white truncate">
                          {currentUser.name}
                        </h4>
                        <p className="text-[10px] text-blue-400 font-mono font-semibold">
                          {currentUser.loginId}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
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
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isCheckedIn
                            ? 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer'
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
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          !todayAttendance?.checkIn || !!todayAttendance?.checkOut
                            ? 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 cursor-pointer'
                        }`}
                      >
                        <LogOutIcon className="w-3.5 h-3.5" />
                        Check Out →
                      </button>
                    </div>

                    <div className="h-px bg-slate-800" />

                    {/* Navigation Menu Options */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          openProfileModal(currentUser, false);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition cursor-pointer"
                      >
                        <User className="w-4 h-4 text-blue-400" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition cursor-pointer"
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
            <button
              onClick={() => setActiveView('auth')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow cursor-pointer transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
