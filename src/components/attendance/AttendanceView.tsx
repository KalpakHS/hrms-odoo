import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { Search, ChevronLeft, ChevronRight, Calendar, UserCheck, CalendarOff, Clock } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentRole, currentUser, attendanceRecords, employees } = useProjectContext();
  const [selectedDate, setSelectedDate] = useState('2026-08-22');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

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

  const adminFilteredRecords = attendanceRecords.filter((rec) => {
    const matchesDate = rec.date === selectedDate;
    const matchesSearch = rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const employeePersonalRecords = attendanceRecords.filter(
    (rec) => rec.employeeId === (currentUser?.id || 'emp-2')
  );

  const daysPresent = employeePersonalRecords.filter((r) => r.status === 'present').length;
  const leavesCount = employeePersonalRecords.filter((r) => r.status === 'leave').length;
  const totalWorkingDays = 22;

  return (
    <div className="space-y-6 font-sans">
      {/* Editorial Header Banner */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-[32px] shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentRole === 'admin'
              ? 'View day-wise check-in and check-out records for all employees'
              : 'Track your personal day-wise attendance log and working hours'}
          </p>
        </div>

        {/* Pill-shaped Date Selector */}
        <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 p-1.5 rounded-full text-xs shadow-xs">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-white rounded-full text-slate-600 transition cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 font-bold text-slate-900 font-mono">
            <Calendar className="w-4 h-4 text-[#9333EA]" />
            <span>{selectedDate}</span>
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-white rounded-full text-slate-600 transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            onClick={() => setViewMode(viewMode === 'day' ? 'month' : 'day')}
            className="px-4 py-1.5 bg-black hover:bg-slate-800 text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition cursor-pointer"
          >
            {viewMode}
          </button>
        </div>
      </div>

      {/* ADMIN VIEW */}
      {currentRole === 'admin' ? (
        <div className="space-y-4">
          {/* Admin Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-full border border-slate-200/80 shadow-floating px-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{adminFilteredRecords.length}</span> of {employees.length} employees for {selectedDate}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-floating">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-4 px-6">Employee</th>
                    <th className="py-4 px-6">Check In</th>
                    <th className="py-4 px-6">Check Out</th>
                    <th className="py-4 px-6">Work Hours</th>
                    <th className="py-4 px-6">Extra Hours</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminFilteredRecords.length > 0 ? (
                    adminFilteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FEF08A] text-slate-900 font-extrabold flex items-center justify-center text-xs border border-yellow-300 shadow-xs">
                            {record.employeeName.charAt(0)}
                          </div>
                          <span>{record.employeeName}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs font-semibold">
                          {record.checkIn || '--:--'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs font-semibold">
                          {record.checkOut || '--:--'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                          {record.workHours} hrs
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                          {record.extraHours} hrs
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              record.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : record.status === 'leave'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
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
            <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Days Present</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{daysPresent} Days</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating flex items-center gap-4">
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-full border border-rose-200">
                <CalendarOff className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Leaves Count</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{leavesCount} Days</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating flex items-center gap-4">
              <div className="p-3.5 bg-purple-50 text-[#9333EA] rounded-full border border-[#E9D5FF]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Working Days</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{totalWorkingDays} Days</p>
              </div>
            </div>
          </div>

          {/* Personal Attendance History Table */}
          <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-floating">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 font-heading">Personal Attendance History</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Employee: {currentUser?.name}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Check In</th>
                    <th className="py-4 px-6">Check Out</th>
                    <th className="py-4 px-6">Work Hours</th>
                    <th className="py-4 px-6">Extra Hours</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeePersonalRecords.length > 0 ? (
                    employeePersonalRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6 font-mono text-xs text-slate-900 font-bold">
                          {record.date}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">{record.checkIn || '--:--'}</td>
                        <td className="py-4 px-6 font-mono text-xs">{record.checkOut || '--:--'}</td>
                        <td className="py-4 px-6 font-mono text-xs">{record.workHours} hrs</td>
                        <td className="py-4 px-6 font-mono text-xs">{record.extraHours} hrs</td>
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              record.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : record.status === 'leave'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
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
