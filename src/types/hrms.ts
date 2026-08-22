export type UserRole = 'admin' | 'employee';

export type PresenceStatus = 'present' | 'absent' | 'leave';

export interface SkillItem {
  id: string;
  name: string;
  level?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string;
  year?: string;
}

export interface Employee {
  id: string;
  loginId: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  department: string;
  jobTitle: string;
  manager: string;
  location: string;
  mobile: string;
  avatar: string;
  presenceStatus: PresenceStatus;
  
  // Private Info
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nationality: string;
  address: string;
  personalEmail: string;
  phone: string;
  dateOfJoining: string;
  
  // Bank Details
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  panNo: string;
  uanNo: string;
  employeeCode: string;
  
  // Salary Settings (Editable by Admin)
  monthlyWage: number;
  workingDaysPerWeek: number;
  breakTimeHours: number;
  
  // Resume / Bio
  about: string;
  whatILove: string;
  interests: string;
  skills: SkillItem[];
  certifications: CertificationItem[];

  // Time off balances
  paidTimeOffAvailable: number;
  sickTimeOffAvailable: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD format
  checkIn: string; // e.g. "09:00 AM" or ""
  checkOut: string; // e.g. "06:00 PM" or ""
  workHours: string; // e.g. "09:00"
  extraHours: string; // e.g. "01:00"
  status: PresenceStatus;
}

export type TimeOffType = 'Paid Time Off' | 'Sick Leave' | 'Unpaid Leave';
export type TimeOffStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: TimeOffType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  status: TimeOffStatus;
  attachmentName?: string;
  createdAt: string;
}

export interface SalaryBreakdown {
  monthlyWage: number;
  yearlyWage: number;
  basicSalary: number;
  basicPercent: number;
  hra: number;
  hraPercentOfBasic: number;
  standardAllowance: number;
  standardAllowancePercent: number;
  performanceBonus: number;
  performanceBonusPercent: number;
  lta: number;
  ltaPercent: number;
  fixedAllowance: number;
  fixedAllowancePercent: number;
  
  // PF Contributions
  employeePf: number;
  employeePfPercent: number;
  employerPf: number;
  employerPfPercent: number;
  
  // Taxes
  professionalTax: number;
}
