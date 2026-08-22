import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => {
  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <label className="text-xs font-black uppercase tracking-widest text-[#182018]/90 font-mono">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-500 font-semibold mt-0.5 ml-2 block">
          {error}
        </span>
      )}
    </div>
  );
};
