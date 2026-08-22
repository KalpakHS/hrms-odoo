import type { SalaryBreakdown } from '../types/hrms';

/**
 * Live Salary Calculator Utility
 * Recalculates all salary components based on Monthly Wage according to exact specification rules:
 * - Yearly Wage = Monthly Wage * 12
 * - Basic Salary = 50% of Monthly Wage
 * - HRA = 50% of Basic Salary
 * - Performance Bonus = 8.33% of Basic Salary
 * - Leave Travel Allowance (LTA) = 8.33% of Basic Salary
 * - Standard Allowance = 8.33% of Monthly Wage
 * - Fixed Allowance = Monthly Wage - (Basic + HRA + Standard + Bonus + LTA)
 * - Employee PF = 12% of Basic Salary
 * - Employer PF = 12% of Basic Salary
 * - Professional Tax = ₹200
 */
export function calculateSalary(monthlyWage: number): SalaryBreakdown {
  const wage = Math.max(0, monthlyWage || 0);
  const yearlyWage = wage * 12;

  const basicSalary = Math.round(wage * 0.50 * 100) / 100;
  const hra = Math.round(basicSalary * 0.50 * 100) / 100; // 50% of Basic

  const performanceBonus = Math.round(basicSalary * 0.0833 * 100) / 100; // 8.33% of Basic
  const lta = Math.round(basicSalary * 0.0833 * 100) / 100;              // 8.33% of Basic
  const standardAllowance = Math.round(wage * 0.0833 * 100) / 100;     // 8.33% of Wage

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
    standardAllowancePercent: getPercent(standardAllowance, wage),
    performanceBonus,
    performanceBonusPercent: getPercent(performanceBonus, basicSalary),
    lta,
    ltaPercent: getPercent(lta, basicSalary),
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
 * Generate automatic Login ID matching exact spec:
 * [CompanyInitials][First2First+First2Last][Year][4DigitSerial]
 * Example: Odoo India + John Doe + 2022 + 0001 -> OIJODO20220001
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
