import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { Search, Plus, Mail, Building2, MapPin, Plane, Circle, Sparkles, Edit3, Trash2 } from 'lucide-react';
import type { PresenceStatus, Employee } from '../../types/hrms';
import { EmployeeFormModal } from './EmployeeFormModal';

export const EmployeeCardsGrid: React.FC = () => {
  const {
    employees,
    currentRole,
    openProfileModal,
    createEmployee,
    updateEmployeeRecord,
    deleteEmployeeRecord,
  } = useProjectContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.loginId.toLowerCase().includes(query)
    );
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    setEditingEmployee(emp);
    setIsFormModalOpen(true);
  };

  const handleDeleteEmployee = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete employee record for "${name}"?`)) {
      deleteEmployeeRecord(id);
    }
  };

  const handleSaveEmployeeForm = (data: any) => {
    if (editingEmployee) {
      updateEmployeeRecord(editingEmployee.id, data);
    } else {
      createEmployee(data);
    }
  };

  const renderStatusBadge = (status: PresenceStatus) => {
    switch (status) {
      case 'present':
        return (
          <div
            className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-xs"
            title="Present in office"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Present</span>
          </div>
        );
      case 'leave':
        return (
          <div
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full text-xs font-bold shadow-xs"
            title="On Leave"
          >
            <Plane className="w-3 h-3 text-rose-600" />
            <span>On Leave</span>
          </div>
        );
      case 'absent':
      default:
        return (
          <div
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-bold shadow-xs"
            title="Absent"
          >
            <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
            <span>Absent</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveEmployeeForm}
        editingEmployee={editingEmployee}
      />

      {/* Editorial Header Banner */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/70 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#FEF08A]/60 border border-yellow-300 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span>Enterprise Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight pt-1">
            Employees & Team Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Manage corporate profiles, inspect presence indicators, and execute Admin CRUD operations.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-floating"
            />
          </div>

          {currentRole === 'admin' && (
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-full text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-yellow-300" />
              NEW Employee
            </button>
          )}
        </div>
      </div>

      {/* Employees Grid: Floating White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            onClick={() => openProfileModal(employee, currentRole !== 'admin')}
            className="bg-white hover:bg-slate-50/60 border border-slate-200/80 rounded-[28px] p-6 shadow-floating hover:shadow-floating-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 relative"
          >
            {/* Top Status & Login ID Pill */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                {employee.loginId}
              </span>
              {renderStatusBadge(employee.presenceStatus)}
            </div>

            {/* Avatar & Core Info */}
            <div className="flex items-center gap-4">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition duration-200"
              />
              <div className="overflow-hidden">
                <h3 className="font-bold text-base text-slate-900 truncate group-hover:text-black transition">
                  {employee.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate">{employee.jobTitle}</p>
                <div className="flex items-center gap-1 text-[11px] text-[#9333EA] bg-[#F3E8FF] px-2 py-0.5 rounded-full w-fit mt-1 font-semibold border border-[#E9D5FF]">
                  <Building2 className="w-3 h-3 text-[#9333EA]" />
                  <span className="truncate">{employee.department}</span>
                </div>
              </div>
            </div>

            {/* Contact Specs & Admin Quick Actions */}
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <div className="space-y-1 overflow-hidden pr-2">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{employee.location}</span>
                </div>
              </div>

              {currentRole === 'admin' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleOpenEditModal(e, employee)}
                    className="p-2 hover:bg-slate-100 text-slate-600 rounded-full border border-slate-200 transition cursor-pointer"
                    title="Edit Employee"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteEmployee(e, employee.id, employee.name)}
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-full border border-rose-200 transition cursor-pointer"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
