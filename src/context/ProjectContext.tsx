import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Employee,
  AttendanceRecord,
  TimeOffRequest,
  UserRole,
} from '../types/hrms';
import {
  initialEmployees,
  initialAttendanceRecords,
  initialTimeOffRequests,
} from '../services/mockApi';
import { generateLoginId } from '../utils/salaryCalculator';

export type AppView = 'home' | 'auth' | 'employees' | 'attendance' | 'timeoff';

export interface ProjectContextType {
  currentUser: Employee | null;
  currentRole: UserRole;
  activeView: AppView;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  timeOffRequests: TimeOffRequest[];
  selectedProfileEmployee: Employee | null;
  isProfileModalOpen: boolean;
  isProfileViewOnly: boolean;
  isTimeOffModalOpen: boolean;
  authMode: 'signin' | 'signup';
  
  // Navigation & Auth Actions
  setActiveView: (view: AppView) => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  login: (loginIdOrEmail: string, password?: string) => boolean;
  signUp: (newEmpData: {
    companyName: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
  }) => Employee;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  
  // Attendance Actions
  checkIn: () => void;
  checkOut: () => void;
  
  // Time Off Actions
  openTimeOffModal: () => void;
  closeTimeOffModal: () => void;
  requestTimeOff: (data: {
    employeeId: string;
    employeeName: string;
    type: 'Paid Time Off' | 'Sick Leave' | 'Unpaid Leave';
    startDate: string;
    endDate: string;
    durationDays: number;
    attachmentName?: string;
  }) => void;
  approveTimeOff: (id: string) => void;
  rejectTimeOff: (id: string) => void;
  
  // Employee & Profile Actions
  openProfileModal: (employee: Employee, isViewOnly?: boolean) => void;
  closeProfileModal: () => void;
  updateEmployeeSalary: (employeeId: string, monthlyWage: number, workingDaysPerWeek: number, breakTimeHours: number) => void;
  updateEmployeePassword: (employeeId: string, newPassword: string) => boolean;
  addSkillToEmployee: (employeeId: string, skillName: string) => void;
  addCertificationToEmployee: (employeeId: string, certName: string) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(initialTimeOffRequests);
  
  // Default logged in as Admin (Speedy Crab)
  const [currentUser, setCurrentUser] = useState<Employee | null>(initialEmployees[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeView, setActiveView] = useState<AppView>('home');
  
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileViewOnly, setIsProfileViewOnly] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const todayStr = new Date().toISOString().split('T')[0];

  // Auth Functions
  const login = (loginIdOrEmail: string, _password?: string): boolean => {
    const found = employees.find(
      (e) =>
        e.loginId.toLowerCase() === loginIdOrEmail.trim().toLowerCase() ||
        e.email.toLowerCase() === loginIdOrEmail.trim().toLowerCase()
    );

    if (found) {
      setCurrentUser(found);
      setCurrentRole(found.role);
      setActiveView('employees');
      return true;
    }
    
    // Fallback default login if custom string entered
    const defaultUser = employees[0];
    setCurrentUser(defaultUser);
    setCurrentRole(defaultUser.role);
    setActiveView('employees');
    return true;
  };

  const signUp = (data: {
    companyName: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
  }): Employee => {
    const newSerial = employees.length + 1;
    const currentYear = new Date().getFullYear();
    const generatedId = generateLoginId(data.companyName, data.name, currentYear, newSerial);

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      loginId: generatedId,
      name: data.name,
      email: data.email,
      role: 'employee',
      company: data.companyName || 'Odoo India',
      department: 'Engineering',
      jobTitle: 'Software Engineer',
      manager: 'Speedy Crab',
      location: 'Gandhinagar, Gujarat',
      mobile: data.phone || '+91 98765 00000',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      presenceStatus: 'present',
      dob: '1998-01-01',
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Indian',
      address: 'Gandhinagar, Gujarat',
      personalEmail: data.email,
      phone: data.phone || '+91 98765 00000',
      dateOfJoining: todayStr,
      accountNumber: '918237465999',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      panNo: 'ABCDE9999F',
      uanNo: '100987654999',
      employeeCode: `EMP00${newSerial}`,
      monthlyWage: 45000,
      workingDaysPerWeek: 5,
      breakTimeHours: 1,
      about: 'Newly registered employee at Dayflow Enterprise.',
      whatILove: 'Solving real-world business challenges.',
      interests: 'Coding, Design, Productivity',
      skills: [{ id: `s-${Date.now()}`, name: 'General Engineering', level: 'Intermediate' }],
      certifications: [],
      paidTimeOffAvailable: 24,
      sickTimeOffAvailable: 7,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setCurrentUser(newEmp);
    setCurrentRole('employee');
    setActiveView('employees');
    return newEmp;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('auth');
    setAuthMode('signin');
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      const adminEmp = employees.find((e) => e.role === 'admin') || employees[0];
      setCurrentUser(adminEmp);
    } else {
      const empUser = employees.find((e) => e.role === 'employee') || employees[1];
      setCurrentUser(empUser);
    }
  };

  // Check In / Check Out Actions
  const checkIn = () => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update current user presence
    const updatedUser = { ...currentUser, presenceStatus: 'present' as const };
    setCurrentUser(updatedUser);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === currentUser.id ? { ...emp, presenceStatus: 'present' } : emp))
    );

    // Check if attendance record exists for today
    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.employeeId === currentUser.id && r.date === todayStr
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          checkIn: timeStr,
          status: 'present',
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          date: todayStr,
          checkIn: timeStr,
          checkOut: '',
          workHours: '00:00',
          extraHours: '00:00',
          status: 'present',
        };
        return [newRecord, ...prev];
      }
    });
  };

  const checkOut = () => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.employeeId === currentUser.id && r.date === todayStr
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        const rec = updated[existingIndex];
        
        const workHours = rec.checkIn ? '09:00' : '08:00';
        const extraHours = '01:00';

        updated[existingIndex] = {
          ...rec,
          checkOut: timeStr,
          workHours,
          extraHours,
        };
        return updated;
      }
      return prev;
    });
  };

  // Time Off Actions
  const openTimeOffModal = () => setIsTimeOffModalOpen(true);
  const closeTimeOffModal = () => setIsTimeOffModalOpen(false);

  const requestTimeOff = (data: {
    employeeId: string;
    employeeName: string;
    type: 'Paid Time Off' | 'Sick Leave' | 'Unpaid Leave';
    startDate: string;
    endDate: string;
    durationDays: number;
    attachmentName?: string;
  }) => {
    const newReq: TimeOffRequest = {
      id: `to-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays: data.durationDays,
      status: 'Pending',
      attachmentName: data.attachmentName,
      createdAt: todayStr,
    };

    setTimeOffRequests((prev) => [newReq, ...prev]);
    closeTimeOffModal();
  };

  const approveTimeOff = (id: string) => {
    setTimeOffRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          // Deduct from employee leave balance
          setEmployees((empList) =>
            empList.map((emp) => {
              if (emp.id === req.employeeId) {
                if (req.type === 'Paid Time Off') {
                  return { ...emp, paidTimeOffAvailable: Math.max(0, emp.paidTimeOffAvailable - req.durationDays) };
                } else if (req.type === 'Sick Leave') {
                  return { ...emp, sickTimeOffAvailable: Math.max(0, emp.sickTimeOffAvailable - req.durationDays) };
                }
              }
              return emp;
            })
          );
          return { ...req, status: 'Approved' };
        }
        return req;
      })
    );
  };

  const rejectTimeOff = (id: string) => {
    setTimeOffRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Rejected' } : req))
    );
  };

  // Profile Modal Actions
  const openProfileModal = (employee: Employee, isViewOnly: boolean = false) => {
    setSelectedProfileEmployee(employee);
    setIsProfileViewOnly(isViewOnly);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfileEmployee(null);
  };

  const updateEmployeeSalary = (
    employeeId: string,
    monthlyWage: number,
    workingDaysPerWeek: number,
    breakTimeHours: number
  ) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, monthlyWage, workingDaysPerWeek, breakTimeHours }
          : emp
      )
    );
    if (selectedProfileEmployee && selectedProfileEmployee.id === employeeId) {
      setSelectedProfileEmployee((prev) =>
        prev ? { ...prev, monthlyWage, workingDaysPerWeek, breakTimeHours } : null
      );
    }
  };

  const updateEmployeePassword = (_employeeId: string, _newPassword: string): boolean => {
    return true;
  };

  const addSkillToEmployee = (employeeId: string, skillName: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const newSkill = { id: `s-${Date.now()}`, name: skillName, level: 'Intermediate' };
          return { ...emp, skills: [...emp.skills, newSkill] };
        }
        return emp;
      })
    );
    if (selectedProfileEmployee && selectedProfileEmployee.id === employeeId) {
      setSelectedProfileEmployee((prev) =>
        prev
          ? {
              ...prev,
              skills: [...prev.skills, { id: `s-${Date.now()}`, name: skillName, level: 'Intermediate' }],
            }
          : null
      );
    }
  };

  const addCertificationToEmployee = (employeeId: string, certName: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const newCert = { id: `c-${Date.now()}`, name: certName, issuer: 'Dayflow Academy', year: '2026' };
          return { ...emp, certifications: [...emp.certifications, newCert] };
        }
        return emp;
      })
    );
    if (selectedProfileEmployee && selectedProfileEmployee.id === employeeId) {
      setSelectedProfileEmployee((prev) =>
        prev
          ? {
              ...prev,
              certifications: [
                ...prev.certifications,
                { id: `c-${Date.now()}`, name: certName, issuer: 'Dayflow Academy', year: '2026' },
              ],
            }
          : null
      );
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentUser,
        currentRole,
        activeView,
        employees,
        attendanceRecords,
        timeOffRequests,
        selectedProfileEmployee,
        isProfileModalOpen,
        isProfileViewOnly,
        isTimeOffModalOpen,
        authMode,
        setActiveView,
        setAuthMode,
        login,
        signUp,
        logout,
        switchRole,
        checkIn,
        checkOut,
        openTimeOffModal,
        closeTimeOffModal,
        requestTimeOff,
        approveTimeOff,
        rejectTimeOff,
        openProfileModal,
        closeProfileModal,
        updateEmployeeSalary,
        updateEmployeePassword,
        addSkillToEmployee,
        addCertificationToEmployee,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
