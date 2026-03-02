import type { Payslip, PayrollPeriod, GetPayrollPeriodsResponse } from '@/types/payroll'

// Mock payroll periods
const mockPayrollPeriods: PayrollPeriod[] = [
  {
    id: 'pp-1',
    start_date: '2026-02-01',
    end_date: '2026-02-28',
    status: 'OPEN',
    processed_by: null,
    processed_by_name: null,
    created_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 'pp-2',
    start_date: '2026-01-01',
    end_date: '2026-01-31',
    status: 'CLOSED',
    processed_by: 'u-1',
    processed_by_name: 'Jane Smith',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pp-3',
    start_date: '2025-12-01',
    end_date: '2025-12-31',
    status: 'CLOSED',
    processed_by: 'u-1',
    processed_by_name: 'Jane Smith',
    created_at: '2025-12-01T08:00:00Z',
  },
  {
    id: 'pp-4',
    start_date: '2025-11-01',
    end_date: '2025-11-30',
    status: 'CLOSED',
    processed_by: 'u-2',
    processed_by_name: 'John Doe',
    created_at: '2025-11-01T08:00:00Z',
  },
]

// Mock payslips
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
  async getPayrollPeriods(params?: {
    page?: number
    page_size?: number
  }): Promise<GetPayrollPeriodsResponse> {
    // TODO: Replace with actual API call
    // return apiClient.get('/hr/payroll-periods', { params })
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        data: mockPayrollPeriods,
        page: params?.page || 1,
        page_size: params?.page_size || 10,
        total: mockPayrollPeriods.length,
      }), 500)
    })
  },

  async runPayroll(periodId: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.post(`/hr/payroll-periods/${periodId}/run`)
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000)
    })
  },

  async getMyPayslips(): Promise<Payslip[]> {
    // TODO: Replace with actual API call
    // return apiClient.get<Payslip[]>('/hr/payslips/me')
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPayslips), 500)
    })
  },
}
