import React from 'react';
import type { Employee } from '../../types/hrms';
import { User, CreditCard, Calendar, Mail, MapPin, Globe, Building } from 'lucide-react';

export const PrivateInfoTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6 text-slate-300 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Section */}
        <div className="bg-[#1E293B]/60 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h4 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Personal Details
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Date of Birth:</span>
              <span className="font-semibold text-white font-mono">{employee.dob}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Gender:</span>
              <span className="font-semibold text-white">{employee.gender}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Marital Status:</span>
              <span className="font-semibold text-white">{employee.maritalStatus}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-500" />
                Nationality:
              </span>
              <span className="font-semibold text-white">{employee.nationality}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" />
                Personal Email:
              </span>
              <span className="font-semibold text-blue-400 truncate max-w-[200px]">
                {employee.personalEmail}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                Date of Joining:
              </span>
              <span className="font-semibold text-white font-mono">{employee.dateOfJoining}</span>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                Residing Address:
              </span>
              <p className="text-slate-300 bg-[#111827] p-2.5 rounded-xl border border-slate-800 leading-normal">
                {employee.address}
              </p>
            </div>
          </div>
        </div>

        {/* Bank & Identification Details */}
        <div className="bg-[#1E293B]/60 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h4 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Bank & Identity Information
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-500" />
                Bank Name:
              </span>
              <span className="font-semibold text-white">{employee.bankName}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Account Number:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {employee.accountNumber}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">IFSC Code:</span>
              <span className="font-mono font-semibold text-white">{employee.ifscCode}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">PAN Card No:</span>
              <span className="font-mono font-semibold text-white">{employee.panNo}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">UAN Number:</span>
              <span className="font-mono font-semibold text-white">{employee.uanNo}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Employee Code:</span>
              <span className="font-mono font-semibold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-500/20">
                {employee.employeeCode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
