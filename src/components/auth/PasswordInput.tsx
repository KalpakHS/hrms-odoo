import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ error, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        className={`w-full px-5 py-3.5 bg-white border border-[#E9E5D9] rounded-full text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#163A2B] focus:ring-1 focus:ring-[#163A2B] transition-all duration-200 pr-12 ${
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
        } ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#163A2B] transition-colors cursor-pointer border-none bg-transparent p-0 flex items-center justify-center"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
