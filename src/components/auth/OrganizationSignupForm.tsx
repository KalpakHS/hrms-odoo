import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import { LogoUploader } from './LogoUploader';

interface OrganizationSignupFormProps {
  onSignupSuccess: (orgData: {
    companyName: string;
    companyCode: string;
    adminName: string;
    email: string;
    phone: string;
    logo: File | null;
  }) => void;
  onSwitchToLogin: () => void;
}

export const OrganizationSignupForm: React.FC<OrganizationSignupFormProps> = ({
  onSignupSuccess,
  onSwitchToLogin
}) => {
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logo, setLogo] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Password Strength State: 0 (empty) to 4 (excellent)
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthLabel('');
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    setStrength(score);

    switch(score) {
      case 1:
        setStrengthLabel('Weak');
        break;
      case 2:
        setStrengthLabel('Fair');
        break;
      case 3:
        setStrengthLabel('Strong');
        break;
      case 4:
        setStrengthLabel('Excellent');
        break;
      default:
        setStrengthLabel('Weak');
    }
  }, [password]);

  const getStrengthColor = () => {
    switch (strength) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-amber-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-[#163A2B]';
      default: return 'bg-slate-200';
    }
  };

  const generateCompanyCode = (name: string): string => {
    const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (clean.length >= 3) return clean.substring(0, 3);
    if (clean.length >= 2) return clean.substring(0, 2);
    return 'DF';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    let hasError = false;

    // Standard validations
    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
      hasError = true;
    }
    if (!adminName.trim()) {
      newErrors.adminName = 'Admin / HR name is required.';
      hasError = true;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'A valid email address is required.';
      hasError = true;
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
      hasError = true;
    }
    if (!password) {
      newErrors.password = 'Password is required.';
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
      hasError = true;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // Simulate creation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
      
      const companyCode = generateCompanyCode(companyName);
      onSignupSuccess({
        companyName,
        companyCode,
        adminName,
        email,
        phone,
        logo
      });
    } catch (err) {
      setIsLoading(false);
      setErrors({ form: 'Failed to create organization. Please verify fields.' });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-10">
      
      {/* Header Info */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#163A2B] font-mono">
          Organization Setup
        </span>
        
        <h1 className="text-4.5xl sm:text-6xl font-serif font-medium tracking-tight leading-[1.08] text-[#182018]">
          Set Up Your<br />
          Organization<span className="text-[#D9A036]">.</span>
        </h1>
        
        <p className="text-sm md:text-base text-[#687067] font-semibold leading-relaxed max-w-md mt-2">
          Create your HR workspace and start managing your people.
        </p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="flex flex-col gap-5 bg-white border border-[#E9E5D9] p-6 sm:p-10 rounded-3xl shadow-2xs relative">
        
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4.5 py-3 rounded-xl text-left">
            {errors.form}
          </div>
        )}

        {/* Company Name */}
        <FormField label="Company Name" error={errors.companyName}>
          <input
            type="text"
            placeholder="e.g. Odoo India or Dayflow Inc"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isLoading}
            className="w-full px-5 py-3.5 bg-white border border-[#E9E5D9] rounded-full text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#163A2B] focus:ring-1 focus:ring-[#163A2B] transition-all duration-200"
          />
        </FormField>

        {/* Admin/HR Officer Name */}
        <FormField label="Admin / HR Officer Name" error={errors.adminName}>
          <input
            type="text"
            placeholder="e.g. Sarah Connor"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            disabled={isLoading}
            className="w-full px-5 py-3.5 bg-white border border-[#E9E5D9] rounded-full text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#163A2B] focus:ring-1 focus:ring-[#163A2B] transition-all duration-200"
          />
        </FormField>

        {/* Email & Phone grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Work Email" error={errors.email}>
            <input
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-5 py-3.5 bg-white border border-[#E9E5D9] rounded-full text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#163A2B] focus:ring-1 focus:ring-[#163A2B] transition-all duration-200"
            />
          </FormField>
          
          <FormField label="Phone Number" error={errors.phone}>
            <input
              type="tel"
              placeholder="+1 555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="w-full px-5 py-3.5 bg-white border border-[#E9E5D9] rounded-full text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#163A2B] focus:ring-1 focus:ring-[#163A2B] transition-all duration-200"
            />
          </FormField>
        </div>

        {/* Password */}
        <FormField label="Password" error={errors.password}>
          <PasswordInput
            placeholder="Choose password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            error={errors.password}
          />
          {/* Password strength meter */}
          {password && (
            <div className="flex flex-col gap-1.5 mt-2 px-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-[#687067]">Password Strength</span>
                <span className="text-[#163A2B]">{strengthLabel}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div 
                    key={bar} 
                    className={`h-full rounded-full transition-colors duration-300 ${
                      bar <= strength ? getStrengthColor() : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </FormField>

        {/* Confirm Password */}
        <FormField label="Confirm Password" error={errors.confirmPassword}>
          <PasswordInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            error={errors.confirmPassword}
          />
        </FormField>

        {/* Logo Upload */}
        <FormField label="Company Logo">
          <LogoUploader onLogoChange={setLogo} />
        </FormField>

        {/* Action button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-[#182018] hover:bg-[#163A2B] text-white text-xs font-bold uppercase tracking-wider py-4.5 rounded-full shadow-sm hover:shadow transition-all duration-205 flex items-center justify-center gap-2 group cursor-pointer border-none"
        >
          {isLoading ? 'Creating Organization...' : 'Create Organization'}
          {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>

      </form>

      {/* Switch back to login link */}
      <span className="text-xs text-[#687067] font-semibold">
        Already have an account?{' '}
        <button 
          onClick={onSwitchToLogin}
          type="button"
          className="text-[#163A2B] hover:underline bg-transparent border-none p-0 cursor-pointer font-bold"
        >
          Sign In
        </button>
      </span>

    </div>
  );
};
