import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { Search, ChevronLeft, ChevronRight, Calendar, UserCheck, CalendarOff, Clock } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentRole, currentUser, attendanceRecords, employees } = useProjectContext();
  const [selectedDate, setSelectedDate] = useState('2026-08-22');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  // Change selected date
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filter for Admin
  const adminFilteredRecords = attendanceRecords.filter((rec) => {
    const matchesDate = rec.date === selectedDate;
    const matchesSearch = rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  // Filter for Employee
  const employeePersonalRecords = attendanceRecords.filter(
    (rec) => rec.employeeId === (currentUser?.id || 'emp-2')
  );

  // Employee summary stats
  const daysPresent = employeePersonalRecords.filter((r) => r.status === 'present').length;
  const leavesCount = employeePersonalRecords.filter((r) => r.status === 'leave').length;
  const totalWorkingDays = 22; // Monthly standard working days

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Attendance Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentRole === 'admin'
              ? 'View day-wise check-in and check-out records for all employees'
              : 'Track your personal day-wise attendance log and working hours'}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#1E293B] border border-slate-700 p-1.5 rounded-xl text-sm">
          <button
            onClick={handlePrevDay}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 font-semibold text-slate-200">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{selectedDate}</span>
          </div>
          <button
            onClick={handleNextDay}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setViewMode(viewMode === 'day' ? 'month' : 'day')}
            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold uppercase transition cursor-pointer"
          >
            {viewMode}
          </button>
        </div>
      </div>

      {/* ADMIN VIEW */}
      {currentRole === 'admin' ? (
        <div className="space-y-4">
          {/* Admin Search Bar */}
          <div className="flex items-center justify-between gap-4 bg-[#111827] p-4 rounded-xl border border-slate-800">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee name..."
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing <span className="font-semibold text-white">{adminFilteredRecords.length}</span> of {employees.length} employees for {selectedDate}
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1E293B]/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-6">Check In</th>
                    <th className="py-3.5 px-6">Check Out</th>
                    <th className="py-3.5 px-6">Work Hours</th>
                    <th className="py-3.5 px-6">Extra Hours</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {adminFilteredRecords.length > 0 ? (
                    adminFilteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                            {record.employeeName.charAt(0)}
                          </div>
                          <span>{record.employeeName}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                          {record.checkIn || '--:--'}
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                          {record.checkOut || '--:--'}
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                          {record.workHours} hrs
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                          {record.extraHours} hrs
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'present'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : record.status === 'leave'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                        No attendance records found for {selectedDate}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* EMPLOYEE VIEW */
        <div className="space-y-6">
          {/* Employee Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Count of Days Present</span>
                <p className="text-2xl font-bold text-white mt-0.5">{daysPresent} Days</p>
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                <CalendarOff className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Leaves Count</span>
                <p className="text-2xl font-bold text-white mt-0.5">{leavesCount} Days</p>
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Working Days</span>
                <p className="text-2xl font-bold text-white mt-0.5">{totalWorkingDays} Days</p>
              </div>
            </div>
          </div>

          {/* Personal Attendance History Table */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Personal Attendance History</h3>
              <span className="text-xs text-slate-400">Employee: {currentUser?.name}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1E293B]/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Check In</th>
                    <th className="py-3.5 px-6">Check Out</th>
                    <th className="py-3.5 px-6">Work Hours</th>
                    <th className="py-3.5 px-6">Extra Hours</th>
                    <th className="py-3.5 px-6 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {employeePersonalRecords.length > 0 ? (
                    employeePersonalRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-6 font-mono text-xs text-blue-400 font-semibold">
                          {record.date}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">{record.checkIn || '--:--'}</td>
                        <td className="py-4 px-6 font-mono text-xs">{record.checkOut || '--:--'}</td>
                        <td className="py-4 px-6 font-mono text-xs">{record.workHours} hrs</td>
                        <td className="py-4 px-6 font-mono text-xs">{record.extraHours} hrs</td>
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'present'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : record.status === 'leave'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                        No personal attendance history recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
