import type { Payslip } from '@/types/payroll'

// Mock data until backend API is ready
const mockPayslips: Payslip[] = [
  {
    id: '1',
    employee_name: 'John Doe',
    employee_number: 'EMP-001',
    department: 'Engineering',
    position: 'Software Engineer',
    pay_period: 'February 2026',
    pay_date: '2026-02-25',
    basic_salary: 45000,
    earnings: [
      { name: 'Basic Salary', amount: 45000 },
      { name: 'Housing Allowance', amount: 12000 },
      { name: 'Transport Allowance', amount: 5000 },
      { name: 'Medical Allowance', amount: 3000 },
    ],
    deductions: [
      { name: 'Income Tax (PAYE)', amount: 8500 },
      { name: 'Pension Fund', amount: 2250 },
      { name: 'Medical Insurance', amount: 1500 },
      { name: 'NSSF', amount: 400 },
    ],
    gross_pay: 65000,
    total_deductions: 12650,
    net_pay: 52350,
  },
  {
    id: '2',
    employee_name: 'John Doe',
    employee_number: 'EMP-001',
    department: 'Engineering',
    position: 'Software Engineer',
    pay_period: 'January 2026',
    pay_date: '2026-01-25',
    basic_salary: 45000,
    earnings: [
      { name: 'Basic Salary', amount: 45000 },
      { name: 'Housing Allowance', amount: 12000 },
      { name: 'Transport Allowance', amount: 5000 },
      { name: 'Medical Allowance', amount: 3000 },
    ],
    deductions: [
      { name: 'Income Tax (PAYE)', amount: 8500 },
      { name: 'Pension Fund', amount: 2250 },
      { name: 'Medical Insurance', amount: 1500 },
      { name: 'NSSF', amount: 400 },
    ],
    gross_pay: 65000,
    total_deductions: 12650,
    net_pay: 52350,
  },
  {
    id: '3',
    employee_name: 'John Doe',
    employee_number: 'EMP-001',
    department: 'Engineering',
    position: 'Software Engineer',
    pay_period: 'December 2025',
    pay_date: '2025-12-25',
    basic_salary: 45000,
    earnings: [
      { name: 'Basic Salary', amount: 45000 },
      { name: 'Housing Allowance', amount: 12000 },
      { name: 'Transport Allowance', amount: 5000 },
      { name: 'Medical Allowance', amount: 3000 },
      { name: 'Year-End Bonus', amount: 15000 },
    ],
    deductions: [
      { name: 'Income Tax (PAYE)', amount: 11000 },
      { name: 'Pension Fund', amount: 2250 },
      { name: 'Medical Insurance', amount: 1500 },
      { name: 'NSSF', amount: 400 },
    ],
    gross_pay: 80000,
    total_deductions: 15150,
    net_pay: 64850,
  },
]

export const payrollApi = {
  async getMyPayslips(): Promise<Payslip[]> {
    // TODO: Replace with actual API call
    // return apiClient.get<Payslip[]>('/hr/payslips/me')
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPayslips), 500)
    })
  },
}
