import React, { useState } from 'react';
import type { Employee } from '../../types/hrms';
import { useProjectContext } from '../../context/useProjectContext';
import { KeyRound, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const SecurityTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  const { updateEmployeePassword } = useProjectContext();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current system-generated password');
      setSuccessMsg('');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
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
    <div className="max-w-xl mx-auto bg-[#1E293B]/60 border border-slate-800 p-6 rounded-2xl space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-base text-white">Security & Password Settings</h4>
          <p className="text-xs text-slate-400">
            Change your system-generated temporary password to secure your account.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="System-generated temporary password"
              className="w-full bg-[#111827] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-[#111827] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-[#111827] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};
