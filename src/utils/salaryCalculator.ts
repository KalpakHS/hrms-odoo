import type { SalaryBreakdown } from '../types/hrms';

/**
 * Live Salary Calculator Utility
 * Recalculates all salary components based on Monthly Wage according to specification rules:
 * - Basic Salary = 50% of Monthly Wage
 * - HRA = 50% of Basic Salary
 * - Standard Allowance = 8.33% of Monthly Wage
 * - Performance Bonus = 4.17% of Monthly Wage
 * - LTA = 4.17% of Monthly Wage
 * - Fixed Allowance = Monthly Wage - (Basic + HRA + Standard + Bonus + LTA)
 * - Employee PF = 12% of Basic
 * - Employer PF = 12% of Basic
 * - Professional Tax = ₹200
 */
export function calculateSalary(monthlyWage: number): SalaryBreakdown {
  const wage = Math.max(0, monthlyWage || 0);
  const yearlyWage = wage * 12;
  
  const basicSalary = wage * 0.50;
  const hra = basicSalary * 0.50; // 50% of Basic
  const standardAllowance = Math.round(wage * 0.0833 * 100) / 100;
  const performanceBonus = Math.round(wage * 0.0417 * 100) / 100;
  const lta = Math.round(wage * 0.0417 * 100) / 100;
  
  const sumOtherComponents = basicSalary + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, Math.round((wage - sumOtherComponents) * 100) / 100);
  
  const employeePf = Math.round(basicSalary * 0.12 * 100) / 100;
  const employerPf = Math.round(basicSalary * 0.12 * 100) / 100;
  const professionalTax = 200;

  const getPercent = (amount: number, base: number) => {
    if (!base) return 0;
    return Math.round((amount / base) * 10000) / 100;
  };

  return {
    monthlyWage: wage,
    yearlyWage,
    basicSalary,
    basicPercent: 50.00,
    hra,
    hraPercentOfBasic: 50.00,
    standardAllowance,
    standardAllowancePercent: 8.33,
    performanceBonus,
    performanceBonusPercent: 4.17,
    lta,
    ltaPercent: 4.17,
    fixedAllowance,
    fixedAllowancePercent: getPercent(fixedAllowance, wage),
    employeePf,
    employeePfPercent: 12.00,
    employerPf,
    employerPfPercent: 12.00,
    professionalTax,
  };
}

/**
 * Generate automatic Login ID matching wireframe format:
 * OI + JODO + 2022 + 0001
 * [Comp 2 chars] + [First 2 of First & Last name] + [Year] + [Serial 4 digits]
 */
export function generateLoginId(
  companyName: string,
  fullName: string,
  joiningYear: number | string = new Date().getFullYear(),
  serialNum: number = 1
): string {
  const compPrefix = (companyName || 'Odoo India')
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 2)
    .toUpperCase() || 'OI';

  const nameParts = fullName.trim().split(/\s+/);
  let nameInitials = 'JODO';
  if (nameParts.length >= 2) {
    const firstTwo = nameParts[0].substring(0, 2).toUpperCase();
    const lastTwo = nameParts[nameParts.length - 1].substring(0, 2).toUpperCase();
    nameInitials = `${firstTwo}${lastTwo}`;
  } else if (nameParts.length === 1 && nameParts[0].length >= 4) {
    nameInitials = nameParts[0].substring(0, 4).toUpperCase();
  } else if (nameParts[0]) {
    nameInitials = nameParts[0].padEnd(4, 'X').substring(0, 4).toUpperCase();
  }

  const yearStr = String(joiningYear || new Date().getFullYear());
  const serialStr = String(serialNum).padStart(4, '0');

  return `${compPrefix}${nameInitials}${yearStr}${serialStr}`;
}
