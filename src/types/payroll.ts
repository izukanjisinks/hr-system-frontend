export interface PayrollPeriod {
  id: string
  start_date: string
  end_date: string
  status: 'OPEN' | 'PROCESSING' | 'CLOSED'
  processed_by: string | null
  processed_by_name: string | null
  created_at: string
}

export interface GetPayrollPeriodsResponse {
  data: PayrollPeriod[]
  page: number
  page_size: number
  total: number
}

export interface PayslipLineItem {
  name: string
  amount: number
}

export interface Payslip {
  id: string
  employee_name: string
  employee_number: string
  department: string
  position: string
  pay_period: string
  pay_date: string
  basic_salary: number
  earnings: PayslipLineItem[]
  deductions: PayslipLineItem[]
  gross_pay: number
  total_deductions: number
  net_pay: number
}
