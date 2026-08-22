import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { X, Mail, Phone, MapPin, Building2, UserCheck, Shield } from 'lucide-react';
import { ResumeTab } from './ResumeTab';
import { PrivateInfoTab } from './PrivateInfoTab';
import { SalaryInfoTab } from './SalaryInfoTab';
import { SecurityTab } from './SecurityTab';

export const EmployeeProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    closeProfileModal,
    selectedProfileEmployee,
    currentRole,
    isProfileViewOnly,
  } = useProjectContext();

  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'salary' | 'security'>('resume');

  if (!isProfileModalOpen || !selectedProfileEmployee) return null;

  const emp = selectedProfileEmployee;
  const canViewSalary = currentRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Sticky Header */}
        <div className="bg-[#1E293B]/80 border-b border-slate-800 p-6 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Basic Info */}
          <div className="flex items-center gap-5">
            <img
              src={emp.avatar}
              alt={emp.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white tracking-tight">{emp.name}</h2>
                <span className="font-mono text-xs text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-0.5 rounded-md font-bold">
                  {emp.loginId}
                </span>
                {isProfileViewOnly && (
                  <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                    View Only
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-300 mt-1">{emp.jobTitle}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{emp.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Dept:</span>
                  <span className="font-medium text-slate-300">{emp.department}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Manager: {emp.manager}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Specs */}
          <div className="bg-[#111827]/80 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5 min-w-[220px]">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{emp.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{emp.mobile}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">{emp.location}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#111827] px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resume')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === 'resume'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === 'private'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Private Info
          </button>

          {canViewSalary && (
            <button
              onClick={() => setActiveTab('salary')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'salary'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Salary Info (Admin Only)
            </button>
          )}

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[60vh]">
          {activeTab === 'resume' && <ResumeTab employee={emp} isViewOnly={isProfileViewOnly} />}
          {activeTab === 'private' && <PrivateInfoTab employee={emp} />}
          {activeTab === 'salary' && canViewSalary && <SalaryInfoTab employee={emp} />}
          {activeTab === 'security' && <SecurityTab employee={emp} />}
        </div>
      </div>
    </div>
  );
};
