import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { Search, Plus, CalendarCheck, HeartPulse, Check, X, FileText } from 'lucide-react';
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

  // Paid and Sick Leave Available Counters
  const paidAvailable = currentUser?.paidTimeOffAvailable ?? 24;
  const sickAvailable = currentUser?.sickTimeOffAvailable ?? 7;

  // Filter requests based on user role
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

      {/* Header Banner */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Time Off & Allocation Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentRole === 'admin'
              ? 'Manage employee leave requests, approve allocations, and inspect balances'
              : 'Request leave allocations and track your approved time off history'}
          </p>
        </div>

        <button
          onClick={openTimeOffModal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          NEW Time Off Request
        </button>
      </div>

      {/* Navigation Subtabs & Searchbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        {/* Tabs */}
        <div className="flex bg-[#1E293B] p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('timeoff')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'timeoff'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Time Off
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'allocation'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Allocation
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search request or name..."
            className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Paid Time Off
              </span>
              <p className="text-2xl font-black text-white mt-0.5">{paidAvailable} Days Available</p>
            </div>
          </div>
          <span className="text-xs bg-blue-500/10 text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-500/30">
            Annual Balance
          </span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sick Time Off
              </span>
              <p className="text-2xl font-black text-white mt-0.5">{sickAvailable} Days Available</p>
            </div>
          </div>
          <span className="text-xs bg-purple-500/10 text-purple-400 font-semibold px-3 py-1 rounded-full border border-purple-500/30">
            Medical Leave
          </span>
        </div>
      </div>

      {/* Time Off Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-white">
            {activeTab === 'timeoff' ? 'Time Off Requests Table' : 'Leave Allocations Overview'}
          </h3>
          <span className="text-xs text-slate-400">
            Showing {displayedRequests.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1E293B]/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Start Date</th>
                <th className="py-3.5 px-6">End Date</th>
                <th className="py-3.5 px-6">Duration</th>
                <th className="py-3.5 px-6">Time Off Type</th>
                <th className="py-3.5 px-6">Attachment</th>
                <th className="py-3.5 px-6">Status</th>
                {currentRole === 'admin' && <th className="py-3.5 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedRequests.length > 0 ? (
                displayedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                        {req.employeeName.charAt(0)}
                      </div>
                      <span>{req.employeeName}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-300">{req.startDate}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-300">{req.endDate}</td>
                    <td className="py-4 px-6 font-semibold text-xs text-blue-400">
                      {req.durationDays} Days
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300 font-medium">{req.type}</td>
                    <td className="py-4 px-6 text-xs">
                      {req.attachmentName ? (
                        <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 w-fit">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{req.attachmentName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
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
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition border border-emerald-500/30 cursor-pointer"
                              title="Approve Request"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectTimeOff(req.id)}
                              className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition border border-rose-500/30 cursor-pointer"
                              title="Reject Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
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
