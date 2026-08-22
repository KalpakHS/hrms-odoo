import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { Search, Plus, CalendarCheck, HeartPulse, Check, X, FileText, Sparkles } from 'lucide-react';
import { TimeOffRequestModal } from './TimeOffRequestModal';

export const TimeOffView: React.FC = () => {
  const {
    currentRole,
    currentUser,
    timeOffRequests,
    approveTimeOff,
    rejectTimeOff,
    openTimeOffModal,
  } = useProjectContext();

  const [activeTab, setActiveTab] = useState<'timeoff' | 'allocation'>('timeoff');
  const [searchQuery, setSearchQuery] = useState('');

  const paidAvailable = currentUser?.paidTimeOffAvailable ?? 24;
  const sickAvailable = currentUser?.sickTimeOffAvailable ?? 7;

  const displayedRequests = timeOffRequests.filter((req) => {
    const isUserRequest = currentRole === 'admin' ? true : req.employeeId === currentUser?.id;
    const matchesSearch =
      req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.type.toLowerCase().includes(searchQuery.toLowerCase());
    return isUserRequest && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      <TimeOffRequestModal />

      {/* Editorial Header Banner */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-[32px] shadow-floating flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#F3E8FF] border border-[#E9D5FF] text-[#9333EA] px-3 py-1 rounded-full text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>Leave Management System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight pt-1">
            Time Off & Leave Allocations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentRole === 'admin'
              ? 'Manage employee leave requests, approve allocations, and inspect balances'
              : 'Request leave allocations and track your approved time off history'}
          </p>
        </div>

        <button
          onClick={openTimeOffModal}
          className="bg-black hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-full text-xs flex items-center gap-2 shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-yellow-300" />
          NEW Time Off Request
        </button>
      </div>

      {/* Navigation Subtabs & Searchbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-full border border-slate-200/80 shadow-floating px-6">
        {/* Tabs */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('timeoff')}
            className={`px-6 py-2 text-xs font-bold rounded-full transition ${
              activeTab === 'timeoff'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Time Off
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-6 py-2 text-xs font-bold rounded-full transition ${
              activeTab === 'allocation'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Allocation
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search request or name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Balance Cards: Stark White Containers with Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#FEF08A]/60 text-slate-900 rounded-full border border-yellow-300 shadow-xs">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Paid Time Off
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{paidAvailable} Days Available</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-800 font-bold px-3.5 py-1 rounded-full border border-slate-200">
            Annual Balance
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#F3E8FF] text-[#9333EA] rounded-full border border-[#E9D5FF] shadow-xs">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sick Time Off
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{sickAvailable} Days Available</p>
            </div>
          </div>
          <span className="text-xs bg-[#F3E8FF] text-[#9333EA] font-bold px-3.5 py-1 rounded-full border border-[#E9D5FF]">
            Medical Leave
          </span>
        </div>
      </div>

      {/* Time Off Table */}
      <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-floating">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900 font-heading">
            {activeTab === 'timeoff' ? 'Time Off Requests Table' : 'Leave Allocations Overview'}
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Showing {displayedRequests.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6">Start Date</th>
                <th className="py-4 px-6">End Date</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Time Off Type</th>
                <th className="py-4 px-6">Attachment</th>
                <th className="py-4 px-6">Status</th>
                {currentRole === 'admin' && <th className="py-4 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRequests.length > 0 ? (
                displayedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#9333EA] font-extrabold flex items-center justify-center text-xs border border-[#E9D5FF]">
                        {req.employeeName.charAt(0)}
                      </div>
                      <span>{req.employeeName}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600 font-semibold">{req.startDate}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600 font-semibold">{req.endDate}</td>
                    <td className="py-4 px-6 font-bold text-xs text-slate-900">
                      {req.durationDays} Days
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-semibold">{req.type}</td>
                    <td className="py-4 px-6 text-xs">
                      {req.attachmentName ? (
                        <div className="flex items-center gap-1.5 text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 w-fit font-mono font-semibold">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate max-w-[120px]">{req.attachmentName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    {currentRole === 'admin' && (
                      <td className="py-4 px-6 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveTimeOff(req.id)}
                              className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full transition border border-emerald-200 cursor-pointer shadow-xs"
                              title="Approve Request"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectTimeOff(req.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-full transition border border-rose-200 cursor-pointer shadow-xs"
                              title="Reject Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                    No time off requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
