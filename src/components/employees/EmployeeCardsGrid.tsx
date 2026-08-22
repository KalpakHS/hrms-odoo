import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { Search, Plus, Mail, Building2, MapPin, Plane, Circle } from 'lucide-react';
import type { PresenceStatus } from '../../types/hrms';

export const EmployeeCardsGrid: React.FC = () => {
  const { employees, currentRole, openProfileModal } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.loginId.toLowerCase().includes(query)
    );
  });

  const renderStatusBadge = (status: PresenceStatus) => {
    switch (status) {
      case 'present':
        return (
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-semibold" title="Present in office">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Present</span>
          </div>
        );
      case 'leave':
        return (
          <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded-full text-xs font-semibold" title="On Leave">
            <Plane className="w-3 h-3 text-rose-400" />
            <span>On Leave</span>
          </div>
        );
      case 'absent':
      default:
        return (
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold" title="Absent">
            <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
            <span>Absent</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => {
              const defaultEmp = employees[0];
              if (defaultEmp) openProfileModal(defaultEmp, false);
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            NEW Employee
          </button>
        )}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            onClick={() => openProfileModal(employee, true)}
            className="bg-[#111827] hover:bg-[#1A2333] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition duration-200 cursor-pointer group relative flex flex-col justify-between"
          >
            {/* Top Status Indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-medium text-slate-500 group-hover:text-blue-400 transition">
                {employee.loginId}
              </span>
              {renderStatusBadge(employee.presenceStatus)}
            </div>

            {/* Avatar & Core Info */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700/80 group-hover:border-blue-500 transition duration-200"
              />
              <div className="overflow-hidden">
                <h3 className="font-bold text-base text-white truncate group-hover:text-blue-400 transition">
                  {employee.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium truncate">{employee.jobTitle}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{employee.department}</span>
                </div>
              </div>
            </div>

            {/* Footer details */}
            <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{employee.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
