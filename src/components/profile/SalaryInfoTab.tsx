import React from 'react';
import type { Employee } from '../../types/hrms';
import { SalaryCalculator } from './SalaryCalculator';

export const SalaryInfoTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return <SalaryCalculator employee={employee} />;
};
