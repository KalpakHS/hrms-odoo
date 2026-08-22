import React, { useState } from 'react';
import type { Employee } from '../../types/hrms';
import { useProjectContext } from '../../context/useProjectContext';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';
import { KeyRound, Lock, CheckCircle2, AlertCircle, Check } from 'lucide-react';

export const SecurityTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  const { updateEmployeePassword } = useProjectContext();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const strengthResult = evaluatePasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current password');
      setSuccessMsg('');
      return;
    }
    if (!strengthResult.isStrong) {
      setErrorMsg('New password MUST meet all Strong requirements (8+ chars, uppercase, lowercase, number, symbol)');
      setSuccessMsg('');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match');
      setSuccessMsg('');
      return;
    }

    updateEmployeePassword(employee.id, newPassword);
    setErrorMsg('');
    setSuccessMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200/80 p-8 rounded-[32px] space-y-6 font-sans shadow-floating">
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
        <div className="p-3 bg-[#FEF08A]/60 text-slate-900 rounded-full border border-yellow-300 shadow-xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-base text-slate-900 font-heading">Security & Password Settings</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Change your password with strict enterprise Strong-level validation.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-2 px-5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-semibold flex items-center gap-2 px-5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1.5 ml-1 uppercase tracking-wider">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-5 text-slate-900 focus:outline-none focus:border-black shadow-floating"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1.5 ml-1 uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="e.g. Strong@12345"
              className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-5 text-slate-900 focus:outline-none focus:border-black shadow-floating"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1.5 ml-1 uppercase tracking-wider">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-5 text-slate-900 focus:outline-none focus:border-black shadow-floating"
              required
            />
          </div>
        </div>

        {/* REAL-TIME PASSWORD STRENGTH EVALUATOR METER */}
        {newPassword && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-700">Password Strength:</span>
              <span
                className={`${
                  strengthResult.score === 'Strong'
                    ? 'text-emerald-600'
                    : strengthResult.score === 'Medium'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {strengthResult.score}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strengthResult.score === 'Strong'
                    ? 'bg-emerald-500'
                    : strengthResult.score === 'Medium'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${strengthResult.percent}%` }}
              />
            </div>

            {/* Requirements Checklist */}
            <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 font-medium text-slate-600">
              <div className={`flex items-center gap-1 ${strengthResult.hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Check className="w-3 h-3" /> 8+ Characters
              </div>
              <div className={`flex items-center gap-1 ${strengthResult.hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Check className="w-3 h-3" /> Uppercase (A-Z)
              </div>
              <div className={`flex items-center gap-1 ${strengthResult.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Check className="w-3 h-3" /> Number (0-9)
              </div>
              <div className={`flex items-center gap-1 ${strengthResult.hasSpecialChar ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Check className="w-3 h-3" /> Symbol (@, #, $)
              </div>
            </div>
          </div>
        )}

        <div className="pt-3">
          <button
            type="submit"
            disabled={!strengthResult.isStrong}
            className={`w-full font-bold py-3.5 rounded-full text-xs shadow-md transition flex items-center justify-center gap-2 ${
              strengthResult.isStrong
                ? 'bg-black hover:bg-slate-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
};
