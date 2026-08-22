import React, { useState, useEffect } from 'react';
import type { Employee, UserRole } from '../../types/hrms';
import { X, User, Mail, Phone, Building2, Briefcase, IndianRupee, ShieldCheck } from 'lucide-react';
import { generateLoginId } from '../../utils/salaryCalculator';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    jobTitle: string;
    monthlyWage: number;
    phone?: string;
    company?: string;
  }) => void;
  editingEmployee?: Employee | null;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEmployee,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('Odoo India');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [role, setRole] = useState<UserRole>('employee');
  const [monthlyWage, setMonthlyWage] = useState<number>(50000);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setEmail(editingEmployee.email);
      setPhone(editingEmployee.phone || editingEmployee.mobile || '');
      setCompany(editingEmployee.company);
      setDepartment(editingEmployee.department);
      setJobTitle(editingEmployee.jobTitle);
      setRole(editingEmployee.role);
      setMonthlyWage(editingEmployee.monthlyWage || 50000);
    } else {
      setName('');
      setEmail('');
      setPhone('+91 98765 00000');
      setCompany('Odoo India');
      setDepartment('Engineering');
      setJobTitle('Software Engineer');
      setRole('employee');
      setMonthlyWage(50000);
    }
  }, [editingEmployee, isOpen]);

  if (!isOpen) return null;

  const previewLoginId = name
    ? generateLoginId(company, name, new Date().getFullYear(), 1)
    : 'OIJODO20220001';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter both Name and Email');
      return;
    }
    setErrorMsg('');
    onSave({
      name,
      email,
      role,
      department,
      jobTitle,
      monthlyWage,
      phone,
      company,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-slate-200/80 rounded-[32px] w-full max-w-xl shadow-floating-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FEF08A] border border-yellow-300 flex items-center justify-center font-bold text-slate-900 text-xs">
              HR
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 font-heading">
              {editingEmployee ? 'Edit Employee Record' : 'Add New Employee'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {/* Auto Login ID Preview */}
          {!editingEmployee && (
            <div className="p-3 bg-[#FEF08A]/40 border border-yellow-300 rounded-full flex items-center justify-between text-xs px-5 shadow-xs">
              <span className="text-slate-800 font-semibold">Generated System Login ID:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200">
                {previewLoginId}
              </span>
            </div>
          )}

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-black shadow-floating"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-black shadow-floating"
                  required
                />
              </div>
            </div>
          </div>

          {/* Phone & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-black shadow-floating"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Odoo India"
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-black shadow-floating"
                />
              </div>
            </div>
          </div>

          {/* Department & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Department
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-black shadow-floating cursor-pointer"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Product">Product</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Design">Design</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Job Title / Designation
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Software Engineer"
                className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-5 text-sm text-slate-900 focus:outline-none focus:border-black shadow-floating"
              />
            </div>
          </div>

          {/* Role & Monthly Wage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Role Permission
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-black shadow-floating cursor-pointer"
                >
                  <option value="employee">Standard Employee</option>
                  <option value="admin">Admin / HR Officer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Monthly Wage (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-3 w-4 h-4 text-emerald-600" />
                <input
                  type="number"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Number(e.target.value))}
                  step="1000"
                  min="0"
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm font-bold text-emerald-700 focus:outline-none focus:border-black shadow-floating"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-xs shadow-md transition cursor-pointer"
            >
              {editingEmployee ? 'Update Profile' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
