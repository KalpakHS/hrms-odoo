import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { generateLoginId } from '../../utils/salaryCalculator';
import { Upload, Shield, Building2, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthPages: React.FC = () => {
  const { authMode, setAuthMode, login, signUp } = useProjectContext();

  // Sign In Form State
  const [signInId, setSignInId] = useState('speedy.crab@odoo.com');
  const [signInPassword, setSignInPassword] = useState('password123');

  // Sign Up Form State
  const [companyName, setCompanyName] = useState('Odoo India');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@odoo.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    login(signInId, signInPassword);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !name.trim() || !email.trim()) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    if (password && password !== confirmPassword) {
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
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">PulseFlow Enterprise</h2>
          <p className="text-sm text-slate-400 mt-1">Human Resource Management System</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#1E293B] p-1 rounded-xl mb-8 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              authMode === 'signin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
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
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Login ID / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={signInId}
                  onChange={(e) => setSignInId(e.target.value)}
                  placeholder="e.g. OIJODO20220001 or email@company.com"
                  className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                SIGN IN
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            {/* Auto Generated Login ID Banner */}
            <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">System Auto-Generated Login ID:</span>
              <span className="font-mono font-bold text-blue-400 bg-blue-900/50 px-2.5 py-1 rounded border border-blue-400/30">
                {generatedId}
              </span>
            </div>

            {/* Company Name & Logo Upload */}
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Logo
                </label>
                <label className="flex items-center justify-center gap-1.5 bg-[#1E293B] hover:bg-slate-700 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-300 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate">{companyLogo ? 'Uploaded' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1E293B]/70 border border-slate-700/80 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 cursor-pointer text-sm"
              >
                Sign Up & Generate Profile
              </button>
            </div>

            <div className="text-center pt-1">
              <span className="text-xs text-slate-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
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
