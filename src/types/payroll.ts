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
