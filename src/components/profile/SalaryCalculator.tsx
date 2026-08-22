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

  // Live calculated salary breakdown
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
      <div className="p-8 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-3 font-sans">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h4 className="text-lg font-bold text-white">Access Restricted</h4>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Salary information and compensation breakdown are strictly confidential and accessible only to HR Officers and System Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200 font-sans">
      {/* Top Banner & Inputs */}
      <div className="bg-[#1E293B]/70 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            Wage & Working Schedule Settings
          </h4>
          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold px-3 py-1 rounded-full">
            Live Salary Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Monthly Wage Input */}
          <div className="md:col-span-2">
            <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              Monthly Wage (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-emerald-400" />
              <input
                type="number"
                value={monthlyWage}
                onChange={(e) => handleMonthlyWageChange(Number(e.target.value))}
                step="1000"
                min="0"
                className="w-full bg-[#111827] border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-base font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Calculated Yearly Wage */}
          <div>
            <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              Yearly Wage (Auto)
            </label>
            <div className="bg-[#111827] border border-slate-800 rounded-xl py-2 px-3 text-base font-bold text-blue-400 font-mono">
              ₹{salary.yearlyWage.toLocaleString('en-IN')} / yr
            </div>
          </div>

          {/* Working schedule */}
          <div>
            <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              Working Days / Week
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="number"
                value={workingDays}
                onChange={(e) => handleWorkingDaysChange(Number(e.target.value))}
                max="7"
                min="1"
                className="w-full bg-[#111827] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Break Time:</span>
            <input
              type="number"
              value={breakHours}
              onChange={(e) => handleBreakHoursChange(Number(e.target.value))}
              className="w-16 bg-[#111827] border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white"
            />
            <span>hr(s) / day</span>
          </div>
        </div>
      </div>

      {/* Salary Components Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Components */}
        <div className="lg:col-span-2 bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h5 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Salary Structure Components
          </h5>

          <div className="space-y-3 text-xs">
            {/* Basic Salary */}
            <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white text-sm">Basic Salary</span>
                <p className="text-slate-400 text-[11px]">50% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-emerald-400">
                  ₹{salary.basicSalary.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-500 text-[10px]">
                  ({salary.basicPercent}%)
                </span>
              </div>
            </div>

            {/* HRA */}
            <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white text-sm">House Rent Allowance (HRA)</span>
                <p className="text-slate-400 text-[11px]">50% of Basic Salary</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-emerald-400">
                  ₹{salary.hra.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-500 text-[10px]">
                  ({salary.hraPercentOfBasic}% of Basic)
                </span>
              </div>
            </div>

            {/* Standard Allowance */}
            <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white text-sm">Standard Allowance</span>
                <p className="text-slate-400 text-[11px]">8.33% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-emerald-400">
                  ₹{salary.standardAllowance.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-500 text-[10px]">
                  ({salary.standardAllowancePercent}%)
                </span>
              </div>
            </div>

            {/* Performance Bonus */}
            <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white text-sm">Performance Bonus</span>
                <p className="text-slate-400 text-[11px]">4.17% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-emerald-400">
                  ₹{salary.performanceBonus.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-500 text-[10px]">
                  ({salary.performanceBonusPercent}%)
                </span>
              </div>
            </div>

            {/* LTA */}
            <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white text-sm">Leave Travel Allowance (LTA)</span>
                <p className="text-slate-400 text-[11px]">4.17% of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-emerald-400">
                  ₹{salary.lta.toLocaleString('en-IN')}
                </span>
                <span className="block text-slate-500 text-[10px]">
                  ({salary.ltaPercent}%)
                </span>
              </div>
            </div>

            {/* Fixed Allowance */}
            <div className="flex items-center justify-between p-3 bg-blue-950/40 rounded-xl border border-blue-500/30">
              <div>
                <span className="font-bold text-white text-sm">Fixed Allowance</span>
                <p className="text-blue-300 text-[11px]">Remaining portion of Monthly Wage</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-blue-400">
                  ₹{salary.fixedAllowance.toLocaleString('en-IN')}
                </span>
                <span className="block text-blue-300/70 text-[10px]">
                  ({salary.fixedAllowancePercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: PF & Taxes */}
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h5 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Deductions & PF Contributions
          </h5>

          <div className="space-y-3 text-xs">
            {/* Employee PF */}
            <div className="p-3 bg-[#111827] rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Employee PF (12%)</span>
                <span className="font-mono font-bold text-rose-400">
                  ₹{salary.employeePf.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Calculated as 12% of Basic Salary</p>
            </div>

            {/* Employer PF */}
            <div className="p-3 bg-[#111827] rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Employer PF (12%)</span>
                <span className="font-mono font-bold text-purple-400">
                  ₹{salary.employerPf.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Matching contribution by company</p>
            </div>

            {/* Professional Tax */}
            <div className="p-3 bg-[#111827] rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Professional Tax</span>
                <span className="font-mono font-bold text-amber-400">
                  ₹{salary.professionalTax}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Standard statutory monthly tax</p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                Gross Monthly Reconciled: ₹{salary.monthlyWage.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
