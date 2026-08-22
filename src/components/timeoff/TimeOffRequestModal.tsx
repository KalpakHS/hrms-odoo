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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-slate-200/80 rounded-[32px] w-full max-w-lg shadow-floating-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-xl text-slate-900 font-heading">Time Off Type Request</h3>
          <button
            onClick={closeTimeOffModal}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {(errorMsg || invalidRange) && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-semibold flex items-center gap-2 px-5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg || 'End Date cannot be before Start Date'}</span>
            </div>
          )}

          {/* Employee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
              Employee
            </label>
            <input
              type="text"
              value={currentUser?.name || 'Employee'}
              disabled
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-3 px-5 text-sm text-slate-700 font-bold cursor-not-allowed"
            />
          </div>

          {/* Time Off Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
              Time Off Type
            </label>
            <select
              value={timeOffType}
              onChange={(e) => setTimeOffType(e.target.value as TimeOffType)}
              className="w-full bg-white border border-slate-200 rounded-full py-3 px-5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-black shadow-floating cursor-pointer"
            >
              <option value="Paid Time Off">Paid Time Off</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 font-semibold focus:outline-none focus:border-black shadow-floating"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 font-semibold focus:outline-none focus:border-black shadow-floating"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration Calculation Banner */}
          <div className="p-4 bg-[#FEF08A]/40 border border-yellow-300 rounded-full flex items-center justify-between text-xs px-6 shadow-xs">
            <span className="text-slate-800 font-bold uppercase tracking-wider">
              Allocation / Duration:
            </span>
            <span className="font-mono font-black text-base text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200">
              {!invalidRange && durationDays > 0 ? `${durationDays} Days` : 'Invalid Range'}
            </span>
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
              Attachment {timeOffType === 'Sick Leave' && '(Required for Sick Leave certificate)'}
            </label>
            <label className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 border-dashed rounded-2xl p-4 cursor-pointer transition">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                <Paperclip className="w-4 h-4 text-slate-500" />
                <span className="truncate max-w-[220px]">
                  {attachmentName || 'Click to attach medical certificate or document'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-black text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-xs shrink-0">
                <Upload className="w-3.5 h-3.5 text-yellow-300" />
                <span>Upload</span>
              </div>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeTimeOffModal}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-xs shadow-md transition cursor-pointer"
            >
              Save Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
