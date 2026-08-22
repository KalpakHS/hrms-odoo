import type { Employee, AttendanceRecord, TimeOffRequest, UserRole } from '../types/hrms';
import { initialEmployees, initialAttendanceRecords, initialTimeOffRequests } from './mockApi';
import { generateLoginId } from '../utils/salaryCalculator';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper for JWT session tokens
export const authStorage = {
  getToken: () => localStorage.getItem('hrms_jwt_token'),
  setToken: (token: string) => localStorage.setItem('hrms_jwt_token', token),
  clearToken: () => localStorage.removeItem('hrms_jwt_token'),
};

// Local storage persistent fallback state keys
const STORAGE_KEYS = {
  EMPLOYEES: 'hrms_employees_data',
  ATTENDANCE: 'hrms_attendance_data',
  TIME_OFF: 'hrms_timeoff_data',
};

// Initialize persistent state in localStorage
function getStoredData<T>(key: string, initialData: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialData;
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage:`, err);
    return initialData;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

// REST API Service Wrapper with Authorization Bearer header
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Token ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // If backend endpoint is unavailable, fall back seamlessly to local persistent state
    console.info(`API call to ${endpoint} using local storage persistence`);
    throw error;
  }
}

// Core HRMS Data API Methods
export const hrmsApi = {
  // --- EMPLOYEES ---
  getEmployees(): Employee[] {
    const employees = getStoredData<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    setStoredData(STORAGE_KEYS.EMPLOYEES, employees);
    return employees;
  },

  saveEmployees(employees: Employee[]): void {
    setStoredData(STORAGE_KEYS.EMPLOYEES, employees);
  },

  createEmployee(data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    jobTitle: string;
    monthlyWage: number;
    phone?: string;
    company?: string;
  }): Employee {
    const employees = this.getEmployees();
    const company = data.company || 'Odoo India';
    const serial = employees.length + 1;
    const currentYear = new Date().getFullYear();
    const loginId = generateLoginId(company, data.name, currentYear, serial);
    const todayStr = new Date().toISOString().split('T')[0];

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      loginId,
      name: data.name,
      email: data.email,
      role: data.role,
      company,
      department: data.department || 'Engineering',
      jobTitle: data.jobTitle || 'Software Engineer',
      manager: 'Speedy Crab',
      location: 'Gandhinagar, Gujarat',
      mobile: data.phone || '+91 98765 00000',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      presenceStatus: 'absent',
      dob: '1998-01-01',
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Indian',
      address: 'Gandhinagar, Gujarat',
      personalEmail: data.email,
      phone: data.phone || '+91 98765 00000',
      dateOfJoining: todayStr,
      accountNumber: '918237465' + Math.floor(100 + Math.random() * 900),
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      panNo: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
      uanNo: '100987654' + Math.floor(100 + Math.random() * 900),
      employeeCode: `EMP${String(serial).padStart(3, '0')}`,
      monthlyWage: data.monthlyWage || 50000,
      workingDaysPerWeek: 5,
      breakTimeHours: 1,
      about: 'Newly onboarded team member.',
      whatILove: 'Solving high impact organizational problems.',
      interests: 'Technology, Design, Product',
      skills: [{ id: `s-${Date.now()}`, name: 'General Engineering', level: 'Intermediate' }],
      certifications: [],
      paidTimeOffAvailable: 24,
      sickTimeOffAvailable: 7,
    };

    const updated = [newEmp, ...employees];
    this.saveEmployees(updated);
    return newEmp;
  },

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index < 0) return null;

    const updatedEmp = { ...employees[index], ...updates };
    employees[index] = updatedEmp;
    this.saveEmployees(employees);
    return updatedEmp;
  },

  deleteEmployee(id: string): boolean {
    const employees = this.getEmployees();
    const filtered = employees.filter((e) => e.id !== id);
    if (filtered.length === employees.length) return false;
    this.saveEmployees(filtered);
    return true;
  },

  // --- ATTENDANCE ---
  getAttendance(): AttendanceRecord[] {
    const records = getStoredData<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, initialAttendanceRecords);
    setStoredData(STORAGE_KEYS.ATTENDANCE, records);
    return records;
  },

  saveAttendance(records: AttendanceRecord[]): void {
    setStoredData(STORAGE_KEYS.ATTENDANCE, records);
  },

  // --- TIME OFF ---
  getTimeOff(): TimeOffRequest[] {
    const requests = getStoredData<TimeOffRequest[]>(STORAGE_KEYS.TIME_OFF, initialTimeOffRequests);
    setStoredData(STORAGE_KEYS.TIME_OFF, requests);
    return requests;
  },

  saveTimeOff(requests: TimeOffRequest[]): void {
    setStoredData(STORAGE_KEYS.TIME_OFF, requests);
  },
};
