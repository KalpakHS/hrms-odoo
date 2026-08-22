import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { X, Upload, Calendar, Paperclip, AlertCircle } from 'lucide-react';
import type { TimeOffType } from '../../types/hrms';

export const TimeOffRequestModal: React.FC = () => {
  const { isTimeOffModalOpen, closeTimeOffModal, requestTimeOff, currentUser } = useProjectContext();

  const [timeOffType, setTimeOffType] = useState<TimeOffType>('Paid Time Off');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-27');
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate duration directly during render
  let durationDays = 0;
  let invalidRange = false;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      invalidRange = true;
    }
  }

  if (!isTimeOffModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (invalidRange || durationDays <= 0) {
      setErrorMsg('End Date cannot be before Start Date');
      return;
    }
    if (timeOffType === 'Sick Leave' && !attachmentName) {
      setErrorMsg('Sick Leave requires uploading a medical certificate attachment');
      return;
    }

    setErrorMsg('');
    requestTimeOff({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      type: timeOffType,
      startDate,
      endDate,
      durationDays,
      attachmentName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#1E293B]/50">
          <h3 className="font-bold text-lg text-white">Time Off Type Request</h3>
          <button
            onClick={closeTimeOffModal}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {(errorMsg || invalidRange) && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg || 'End Date cannot be before Start Date'}</span>
            </div>
          )}

          {/* Employee */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Employee
            </label>
            <input
              type="text"
              value={currentUser?.name || 'Employee'}
              disabled
              className="w-full bg-[#1E293B]/60 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 font-semibold cursor-not-allowed"
            />
          </div>

          {/* Time Off Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Time Off Type
            </label>
            <select
              value={timeOffType}
              onChange={(e) => setTimeOffType(e.target.value as TimeOffType)}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Paid Time Off">Paid Time Off</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration Calculation */}
          <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold uppercase tracking-wider">
              Allocation / Duration:
            </span>
            <span className="font-mono font-bold text-base text-blue-400">
              {!invalidRange && durationDays > 0 ? `${durationDays} Days` : 'Invalid Range'}
            </span>
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Attachment {timeOffType === 'Sick Leave' && '(Required for Sick Leave certificate)'}
            </label>
            <label className="flex items-center justify-between bg-[#1E293B] hover:bg-slate-800 border border-slate-700/80 border-dashed rounded-xl p-3.5 cursor-pointer transition">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Paperclip className="w-4 h-4 text-blue-400" />
                <span className="truncate max-w-[240px]">
                  {attachmentName || 'Click to attach medical certificate or document'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-blue-600/20 text-blue-400 text-xs px-2.5 py-1 rounded-lg border border-blue-500/30 font-semibold shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </div>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeTimeOffModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              Save Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
