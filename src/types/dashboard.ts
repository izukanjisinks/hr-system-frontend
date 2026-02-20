export interface DashboardData {
  employee_details: EmployeeDetails
  holidays_this_month: HolidaysThisMonth
  leave_days_this_month: number
  yearly_entitlement: number
  leave_requests: number
}

export interface EmployeeDetails {
  employee_name: string
  address: string
  role: string
  position: string
  employment_period: number
  department: string
  supervisor: string
  position_code: string
}

export interface HolidaysThisMonth {
  total: number
  details: HolidayDetail[]
}

export interface HolidayDetail {
  name: string
  date: string
}
