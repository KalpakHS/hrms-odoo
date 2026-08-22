import React, { useState } from 'react';
import type { Employee } from '../../types/hrms';
import { useProjectContext } from '../../context/useProjectContext';
import { calculateSalary } from '../../utils/salaryCalculator';
import { Calculator, IndianRupee, Clock, CalendarDays, Lock } from 'lucide-react';

export const SalaryCalculator: React.FC<{ employee: Employee }> = ({ employee }) => {
  const { updateEmployeeSalary, currentRole } = useProjectContext();

  const [monthlyWage, setMonthlyWage] = useState<number>(employee.monthlyWage || 50000);
  const [workingDays, setWorkingDays] = useState<number>(employee.workingDaysPerWeek || 5);
  const [breakHours, setBreakHours] = useState<number>(employee.breakTimeHours || 1);

  const salary = calculateSalary(monthlyWage);

  const handleMonthlyWageChange = (val: number) => {
    setMonthlyWage(val);
    if (currentRole === 'admin') {
      updateEmployeeSalary(employee.id, val, workingDays, breakHours);
    }
  };

  const handleWorkingDaysChange = (val: number) => {
    setWorkingDays(val);
    if (currentRole === 'admin') {
      updateEmployeeSalary(employee.id, monthlyWage, val, breakHours);
    }
  };

  const handleBreakHoursChange = (val: number) => {
    setBreakHours(val);
    if (currentRole === 'admin') {
      updateEmployeeSalary(employee.id, monthlyWage, workingDays, val);
    }
  };

  if (currentRole !== 'admin') {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-[28px] text-center space-y-3 font-sans">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h4 className="text-lg font-bold text-slate-900 font-heading">Access Restricted</h4>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Salary information and compensation breakdown are strictly confidential and accessible only to HR Officers and System Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Top Settings Banner */}
      <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-[28px]">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2 font-heading">
            <Calculator className="w-5 h-5 text-slate-700" />
            Wage & Working Schedule Settings
          </h4>
          <span className="text-xs bg-[#FEF08A] text-slate-900 border border-yellow-300 font-bold px-3.5 py-1 rounded-full shadow-xs">
            Live Salary Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Monthly Wage Input */}
          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5 ml-1">
              Monthly Wage (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-3 w-4 h-4 text-emerald-600" />
              <input
                type="number"
                value={monthlyWage}
                onChange={(e) => handleMonthlyWageChange(Number(e.target.value))}
                step="1000"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-base font-black text-emerald-700 focus:outline-none focus:border-black shadow-floating"
              />
            </div>
          </div>

          {/* Calculated Yearly Wage */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5 ml-1">
              Yearly Wage (Auto)
            </label>
            <div className="bg-white border border-slate-200 rounded-full py-2.5 px-4 text-sm font-black text-slate-900 font-mono shadow-floating">
              ₹{salary.yearlyWage.toLocaleString('en-IN')} / yr
            </div>
          </div>

          {/* Working schedule */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5 ml-1">
              Working Days / Wk
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={workingDays}
                onChange={(e) => handleWorkingDaysChange(Number(e.target.value))}
                max="7"
                min="1"
                className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-black shadow-floating"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">Break Time:</span>
            <input
              type="number"
              value={breakHours}
              onChange={(e) => handleBreakHoursChange(Number(e.target.value))}
              className="w-16 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-900 font-bold text-center shadow-xs"
            />
            <span>hr(s) / day</span>
          </div>
        </div>
      </div>

      {/* Salary Component Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Structure Components */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[28px] p-6 space-y-4 shadow-floating">
          <h5 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 font-heading">
            Salary Structure Components
          </h5>

          <div className="space-y-3 text-xs">
            {/* Basic */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div>
                <span className="font-bold text-slate-900 text-sm">Basic Salary</span>
                <p className="text-slate-500 text-[11px]">50% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-sm text-emerald-700">
                  ₹{salary.basicSalary.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-400 text-[10px]">
                  ({salary.basicPercent}%)
                </span>
              </div>
            </div>

            {/* HRA */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div>
                <span className="font-bold text-slate-900 text-sm">House Rent Allowance (HRA)</span>
                <p className="text-slate-500 text-[11px]">50% of Basic Salary</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-sm text-emerald-700">
                  ₹{salary.hra.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-400 text-[10px]">
                  ({salary.hraPercentOfBasic}% of Basic)
                </span>
              </div>
            </div>

            {/* Standard Allowance */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div>
                <span className="font-bold text-slate-900 text-sm">Standard Allowance</span>
                <p className="text-slate-500 text-[11px]">8.33% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-sm text-emerald-700">
                  ₹{salary.standardAllowance.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-400 text-[10px]">
                  ({salary.standardAllowancePercent}%)
                </span>
              </div>
            </div>

            {/* Performance Bonus */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div>
                <span className="font-bold text-slate-900 text-sm">Performance Bonus</span>
                <p className="text-slate-500 text-[11px]">4.17% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-sm text-emerald-700">
                  ₹{salary.performanceBonus.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-400 text-[10px]">
                  ({salary.performanceBonusPercent}%)
                </span>
              </div>
            </div>

            {/* LTA */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div>
                <span className="font-bold text-slate-900 text-sm">Leave Travel Allowance (LTA)</span>
                <p className="text-slate-500 text-[11px]">4.17% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-sm text-emerald-700">
                  ₹{salary.lta.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-400 text-[10px]">
                  ({salary.ltaPercent}%)
                </span>
              </div>
            </div>

            {/* Fixed Allowance */}
            <div className="flex items-center justify-between p-3.5 bg-[#FEF08A]/40 rounded-2xl border border-yellow-300">
              <div>
                <span className="font-extrabold text-slate-900 text-sm">Fixed Allowance</span>
                <p className="text-slate-600 text-[11px]">Remaining portion of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-sm text-slate-900">
                  ₹{salary.fixedAllowance.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-600 text-[10px]">
                  ({salary.fixedAllowancePercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Deductions & PF */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 space-y-4 shadow-floating">
          <h5 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 font-heading">
            Deductions & PF Contributions
          </h5>

          <div className="space-y-3 text-xs">
            {/* Employee PF */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Employee PF (12%)</span>
                <span className="font-mono font-black text-rose-600">
                  ₹{salary.employeePf.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Calculated as 12% of Basic Salary</p>
            </div>

            {/* Employer PF */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Employer PF (12%)</span>
                <span className="font-mono font-black text-[#9333EA]">
                  ₹{salary.employerPf.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Matching contribution by company</p>
            </div>

            {/* Professional Tax */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Professional Tax</span>
                <span className="font-mono font-black text-amber-600">
                  ₹{salary.professionalTax}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Standard statutory monthly tax</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 font-semibold">
                Gross Monthly Reconciled: ₹{salary.monthlyWage.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
