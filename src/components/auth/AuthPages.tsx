import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { generateLoginId } from '../../utils/salaryCalculator';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';
import { Upload, Mail, Phone, Lock, ArrowRight, User, Building2, ArrowLeft, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserRole } from '../../types/hrms';

export const AuthPages: React.FC = () => {
  const { authMode, setAuthMode, login, signUp, setActiveView } = useProjectContext();

  // Sign In Form State
  const [signInId, setSignInId] = useState('speedy.crab@odoo.com');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [preLoginRole, setPreLoginRole] = useState<UserRole>('admin');

  // Sign Up Form State
  const [companyName, setCompanyName] = useState('Odoo India');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@odoo.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password Strength Evaluation
  const strengthResult = evaluatePasswordStrength(password);

  // Live Login ID Calculation directly during render
  const generatedId = name || companyName
    ? generateLoginId(companyName, name, new Date().getFullYear(), 1)
    : 'OIJODO20220001';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInId.trim()) {
      setErrorMsg('Please enter a valid Login ID or Email');
      return;
    }
    setErrorMsg('');
    login(signInId, signInPassword, preLoginRole);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !name.trim() || !email.trim()) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    if (!strengthResult.isStrong) {
      setErrorMsg('Password MUST meet all Strong requirements (8+ chars, uppercase, lowercase, number, symbol)');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    signUp({
      companyName,
      name,
      email,
      phone,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Top Header Bar for Public Auth Page */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 max-w-7xl mx-auto w-full">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 group cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-full bg-[#FEF08A] border border-yellow-300 flex items-center justify-center font-black text-slate-900 text-sm shadow-xs group-hover:scale-105 transition duration-200">
            d.
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 font-brand-logo">
            dayflow.
          </span>
        </button>

        <button
          onClick={() => setActiveView('home')}
          className="text-xs font-bold text-slate-600 hover:text-black bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full shadow-xs transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </button>
      </div>

      {/* Soft Ambient Accents */}
      <div className="absolute top-12 left-12 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Centralized Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white rounded-[32px] shadow-floating-lg border border-slate-200/70 p-8 sm:p-10 relative z-10 space-y-7 my-auto mt-20 sm:mt-auto"
      >
        {/* Editorial Header Title (PulseFlow Badge Completely Removed) */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            {authMode === 'signin' ? (
              <>
                <span className="relative inline-block px-2 z-10">
                  Login
                  <span className="absolute inset-0 bg-[#FEF08A] -rotate-2 rounded-2xl -z-10 shadow-xs border border-yellow-300/60" />
                </span>{' '}
                to Your Account
              </>
            ) : (
              <>
                Create Your{' '}
                <span className="relative inline-block px-2 z-10">
                  Account
                  <span className="absolute inset-0 bg-[#FEF08A] rotate-1 rounded-2xl -z-10 shadow-xs border border-yellow-300/60" />
                </span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
            {authMode === 'signin'
              ? 'Select your session role and enter employee credentials to continue.'
              : 'Register your company organization with enterprise password security.'}
          </p>
        </div>

        {/* Pill-shaped Mode Switcher */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              authMode === 'signin'
                ? 'bg-black text-white shadow-md'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-black text-white shadow-md'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium text-center shadow-xs flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-5">
            {/* Pre-Authentication Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                Select Session Role
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setPreLoginRole('admin')}
                  className={`py-2 px-3 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    preLoginRole === 'admin'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin / HR Officer
                </button>

                <button
                  type="button"
                  onClick={() => setPreLoginRole('employee')}
                  className={`py-2 px-3 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    preLoginRole === 'employee'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Standard Employee
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                Phone / Email / Login ID
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={signInId}
                  onChange={(e) => setSignInId(e.target.value)}
                  placeholder="e.g. OIJODO20220001 or email@company.com"
                  className="w-full bg-white border border-slate-200/80 rounded-full py-3.5 pl-11 pr-5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 shadow-floating transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200/80 rounded-full py-3.5 pl-11 pr-5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 shadow-floating transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-black hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-full shadow-lg shadow-black/10 transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Login to Your Account
                <ArrowRight className="w-4 h-4 text-yellow-300" />
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-xs text-black font-bold hover:underline cursor-pointer ml-1"
              >
                Sign Up Now
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP FORM WITH REAL-TIME PASSWORD STRENGTH METER */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            {/* Auto Generated Login ID Pill Banner */}
            <div className="p-3.5 bg-[#FEF08A]/40 border border-yellow-300/80 rounded-full flex items-center justify-between text-xs px-5 shadow-xs">
              <span className="text-slate-800 font-semibold">Auto Login ID:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                {generatedId}
              </span>
            </div>

            {/* Company Name & Logo Upload */}
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-floating"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Logo</label>
                <label className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full py-3 px-3 text-xs text-slate-700 font-semibold cursor-pointer shadow-floating transition">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{companyLogo ? 'Uploaded' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-floating"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-floating"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-floating"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. Admin@12345"
                  className="w-full bg-white border border-slate-200 rounded-full py-3 px-5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-floating"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-white border border-slate-200 rounded-full py-3 px-5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-floating"
                  required
                />
              </div>
            </div>

            {/* REAL-TIME PASSWORD STRENGTH EVALUATOR METER */}
            {password && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={!strengthResult.isStrong}
                className={`w-full font-bold py-3.5 px-6 rounded-full shadow-lg transition text-sm flex items-center justify-center gap-2 ${
                  strengthResult.isStrong
                    ? 'bg-black hover:bg-slate-800 text-white cursor-pointer shadow-black/10'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                Sign Up & Generate Profile
              </button>
            </div>

            <div className="text-center pt-1">
              <span className="text-xs text-slate-500">Already registered? </span>
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-xs text-black font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
