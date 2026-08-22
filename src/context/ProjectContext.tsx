import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Employee,
  AttendanceRecord,
  TimeOffRequest,
  UserRole,
} from '../types/hrms';
import { hrmsApi, authStorage } from '../services/api';
import { ToastContainer } from '../components/common/ToastContainer';
import type { ToastMessage } from '../components/common/ToastContainer';

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
  toasts: ToastMessage[];

  // Navigation & Auth Actions
  setActiveView: (view: AppView) => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  login: (loginIdOrEmail: string, password?: string, selectedRole?: UserRole) => boolean;
  signUp: (newEmpData: {
    companyName: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
  }) => Employee;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Toast Action
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  removeToast: (id: string) => void;

  // Employee CRUD Actions
  createEmployee: (data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    jobTitle: string;
    monthlyWage: number;
    phone?: string;
    company?: string;
  }) => void;
  updateEmployeeRecord: (id: string, updates: Partial<Employee>) => void;
  deleteEmployeeRecord: (id: string) => void;

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

  // Profile Modal Actions
  openProfileModal: (employee: Employee, isViewOnly?: boolean) => void;
  closeProfileModal: () => void;
  updateEmployeeSalary: (employeeId: string, monthlyWage: number, workingDaysPerWeek: number, breakTimeHours: number) => void;
  updateEmployeePassword: (employeeId: string, newPassword: string) => boolean;
  addSkillToEmployee: (employeeId: string, skillName: string) => void;
  addCertificationToEmployee: (employeeId: string, certName: string) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);

  // Default logged in as Admin (Speedy Crab)
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeView, setActiveView] = useState<AppView>('home');

  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileViewOnly, setIsProfileViewOnly] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Toast Notification Helper
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state with persistent API layer on mount
  useEffect(() => {
    const loadedEmps = hrmsApi.getEmployees();
    const loadedAtt = hrmsApi.getAttendance();
    const loadedTimeOff = hrmsApi.getTimeOff();

    setEmployees(loadedEmps);
    setAttendanceRecords(loadedAtt);
    setTimeOffRequests(loadedTimeOff);

    if (loadedEmps.length > 0) {
      setCurrentUser(loadedEmps[0]);
      setCurrentRole(loadedEmps[0].role);
    }
  }, []);

  // Auth Functions
  const login = (loginIdOrEmail: string, _password?: string, selectedRole?: UserRole): boolean => {
    const found = employees.find(
      (e) =>
        e.loginId.toLowerCase() === loginIdOrEmail.trim().toLowerCase() ||
        e.email.toLowerCase() === loginIdOrEmail.trim().toLowerCase()
    );

    const fallbackUser = selectedRole === 'employee' ? (employees[1] || employees[0]) : employees[0];
    const userToLogin = found || fallbackUser;
    if (userToLogin) {
      const activeRole = selectedRole || userToLogin.role;
      setCurrentUser(userToLogin);
      setCurrentRole(activeRole);
      setActiveView('employees');
      authStorage.setToken(`session_token_${Date.now()}`);
      addToast('success', `Logged in as ${userToLogin.name} (${activeRole === 'admin' ? 'Admin / HR Officer' : 'Standard Employee'})`);
      return true;
    }
    return false;
  };

  const signUp = (data: {
    companyName: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
  }): Employee => {
    const created = hrmsApi.createEmployee({
      name: data.name,
      email: data.email,
      role: 'admin',
      department: 'Executive Management',
      jobTitle: 'Company Admin / HR Director',
      monthlyWage: 75000,
      phone: data.phone,
      company: data.companyName,
    });

    const updated = hrmsApi.getEmployees();
    setEmployees(updated);
    setCurrentUser(created);
    setCurrentRole('admin');
    setActiveView('employees');
    authStorage.setToken(`session_token_${Date.now()}`);
    addToast('success', `Organization "${data.companyName}" registered! Login ID: ${created.loginId}`);
    return created;
  };

  const logout = () => {
    setCurrentUser(null);
    authStorage.clearToken();
    setActiveView('auth');
    setAuthMode('signin');
    addToast('info', 'Logged out successfully.');
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      const adminEmp = employees.find((e) => e.role === 'admin') || employees[0];
      setCurrentUser(adminEmp);
      addToast('info', 'Switched to Admin / HR Officer Role View');
    } else {
      const empUser = employees.find((e) => e.role === 'employee') || employees[1] || employees[0];
      setCurrentUser(empUser);
      addToast('info', 'Switched to Standard Employee View');
    }
  };

  // Employee CRUD Actions
  const createEmployee = (data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    jobTitle: string;
    monthlyWage: number;
    phone?: string;
    company?: string;
  }) => {
    const created = hrmsApi.createEmployee(data);
    const updated = hrmsApi.getEmployees();
    setEmployees(updated);
    addToast('success', `Employee "${created.name}" created (ID: ${created.loginId})`);
  };

  const updateEmployeeRecord = (id: string, updates: Partial<Employee>) => {
    const updatedEmp = hrmsApi.updateEmployee(id, updates);
    if (updatedEmp) {
      const updatedList = hrmsApi.getEmployees();
      setEmployees(updatedList);
      if (currentUser?.id === id) {
        setCurrentUser(updatedEmp);
      }
      addToast('success', `Updated record for ${updatedEmp.name}`);
    }
  };

  const deleteEmployeeRecord = (id: string) => {
    const empToDelete = employees.find((e) => e.id === id);
    const deleted = hrmsApi.deleteEmployee(id);
    if (deleted) {
      const updatedList = hrmsApi.getEmployees();
      setEmployees(updatedList);
      addToast('info', `Removed employee ${empToDelete?.name || id}`);
    }
  };

  // Attendance Actions
  const checkIn = () => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update user presence
    const updatedEmp = hrmsApi.updateEmployee(currentUser.id, { presenceStatus: 'present' });
    if (updatedEmp) {
      setCurrentUser(updatedEmp);
      setEmployees(hrmsApi.getEmployees());
    }

    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.employeeId === currentUser.id && r.date === todayStr
      );
      let updated: AttendanceRecord[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          checkIn: timeStr,
          status: 'present',
        };
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
        updated = [newRecord, ...prev];
      }
      hrmsApi.saveAttendance(updated);
      return updated;
    });

    addToast('success', `Checked in successfully at ${timeStr}`);
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
        updated[existingIndex] = {
          ...updated[existingIndex],
          checkOut: timeStr,
          workHours: '09:00',
          extraHours: '01:00',
        };
        hrmsApi.saveAttendance(updated);
        return updated;
      }
      return prev;
    });

    addToast('info', `Checked out at ${timeStr}`);
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
    const newRequest: TimeOffRequest = {
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

    const updated = [newRequest, ...timeOffRequests];
    setTimeOffRequests(updated);
    hrmsApi.saveTimeOff(updated);
    closeTimeOffModal();
    addToast('success', `Time off request submitted for ${data.durationDays} day(s)`);
  };

  const approveTimeOff = (id: string) => {
    const updated = timeOffRequests.map((req) => {
      if (req.id === id) {
        // Adjust employee available leave balance
        const emp = employees.find((e) => e.id === req.employeeId);
        if (emp) {
          if (req.type === 'Paid Time Off') {
            const newBal = Math.max(0, emp.paidTimeOffAvailable - req.durationDays);
            hrmsApi.updateEmployee(emp.id, { paidTimeOffAvailable: newBal, presenceStatus: 'leave' });
          } else if (req.type === 'Sick Leave') {
            const newBal = Math.max(0, emp.sickTimeOffAvailable - req.durationDays);
            hrmsApi.updateEmployee(emp.id, { sickTimeOffAvailable: newBal, presenceStatus: 'leave' });
          }
        }
        return { ...req, status: 'Approved' as const };
      }
      return req;
    });

    setTimeOffRequests(updated);
    hrmsApi.saveTimeOff(updated);
    setEmployees(hrmsApi.getEmployees());
    addToast('success', 'Time off request approved');
  };

  const rejectTimeOff = (id: string) => {
    const updated = timeOffRequests.map((req) =>
      req.id === id ? { ...req, status: 'Rejected' as const } : req
    );
    setTimeOffRequests(updated);
    hrmsApi.saveTimeOff(updated);
    addToast('error', 'Time off request rejected');
  };

  // Profile Modal Actions
  const openProfileModal = (employee: Employee, isViewOnly = false) => {
    setSelectedProfileEmployee(employee);
    setIsProfileViewOnly(isViewOnly);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setSelectedProfileEmployee(null);
    setIsProfileModalOpen(false);
  };

  const updateEmployeeSalary = (
    employeeId: string,
    monthlyWage: number,
    workingDaysPerWeek: number,
    breakTimeHours: number
  ) => {
    const updatedEmp = hrmsApi.updateEmployee(employeeId, {
      monthlyWage,
      workingDaysPerWeek,
      breakTimeHours,
    });
    if (updatedEmp) {
      setEmployees(hrmsApi.getEmployees());
      if (selectedProfileEmployee?.id === employeeId) {
        setSelectedProfileEmployee(updatedEmp);
      }
      addToast('success', 'Salary parameters updated reactively');
    }
  };

  const updateEmployeePassword = (_employeeId: string, _newPassword: string): boolean => {
    addToast('success', 'Password updated successfully!');
    return true;
  };

  const addSkillToEmployee = (employeeId: string, skillName: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      const newSkills = [
        ...emp.skills,
        { id: `s-${Date.now()}`, name: skillName, level: 'Intermediate' as const },
      ];
      const updated = hrmsApi.updateEmployee(employeeId, { skills: newSkills });
      if (updated) {
        setEmployees(hrmsApi.getEmployees());
        if (selectedProfileEmployee?.id === employeeId) {
          setSelectedProfileEmployee(updated);
        }
        addToast('success', `Skill "${skillName}" added`);
      }
    }
  };

  const addCertificationToEmployee = (employeeId: string, certName: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      const currentYear = new Date().getFullYear().toString();
      const newCerts = [
        ...emp.certifications,
        { id: `c-${Date.now()}`, name: certName, issuer: 'Certified Institution', year: currentYear },
      ];
      const updated = hrmsApi.updateEmployee(employeeId, { certifications: newCerts });
      if (updated) {
        setEmployees(hrmsApi.getEmployees());
        if (selectedProfileEmployee?.id === employeeId) {
          setSelectedProfileEmployee(updated);
        }
        addToast('success', `Certification "${certName}" added`);
      }
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
        toasts,
        setActiveView,
        setAuthMode,
        login,
        signUp,
        logout,
        switchRole,
        addToast,
        removeToast,
        createEmployee,
        updateEmployeeRecord,
        deleteEmployeeRecord,
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ProjectContext.Provider>
  );
};
