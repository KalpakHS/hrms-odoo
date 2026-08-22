import React from 'react';
import type { Employee } from '../../types/hrms';
import { User, CreditCard, Calendar, Mail, MapPin, Globe, Building } from 'lucide-react';

export const PrivateInfoTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6 text-slate-800 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Section */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] space-y-4 shadow-floating">
          <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2 font-heading">
            <User className="w-4 h-4 text-slate-700" />
            Personal Details
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Date of Birth:</span>
              <span className="font-semibold text-slate-900 font-mono">{employee.dob}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Gender:</span>
              <span className="font-semibold text-slate-900">{employee.gender}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Marital Status:</span>
              <span className="font-semibold text-slate-900">{employee.maritalStatus}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Nationality:
              </span>
              <span className="font-semibold text-slate-900">{employee.nationality}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Personal Email:
              </span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {employee.personalEmail}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date of Joining:
              </span>
              <span className="font-semibold text-slate-900 font-mono">{employee.dateOfJoining}</span>
            </div>

            <div className="pt-2">
              <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Residing Address:
              </span>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 leading-relaxed font-medium">
                {employee.address}
              </p>
            </div>
          </div>
        </div>

        {/* Bank & Identity Details */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] space-y-4 shadow-floating">
          <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2 font-heading">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Bank & Identity Information
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Bank Name:
              </span>
              <span className="font-semibold text-slate-900">{employee.bankName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Account Number:</span>
              <span className="font-mono font-extrabold text-emerald-700">
                {employee.accountNumber}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">IFSC Code:</span>
              <span className="font-mono font-semibold text-slate-900">{employee.ifscCode}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">PAN Card No:</span>
              <span className="font-mono font-semibold text-slate-900">{employee.panNo}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">UAN Number:</span>
              <span className="font-mono font-semibold text-slate-900">{employee.uanNo}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Employee Code:</span>
              <span className="font-mono font-bold text-slate-900 bg-[#FEF08A] px-2.5 py-0.5 rounded-full border border-yellow-300 shadow-xs">
                {employee.employeeCode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
