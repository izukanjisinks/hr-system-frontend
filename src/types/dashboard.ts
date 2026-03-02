export interface AdminDashboardData {
  total_employees: number
  total_departments: number
  open_positions: number
  pending_leave_requests: number
  active_payroll_periods: number
  recent_hires: RecentHire[]
  leave_requests_summary: LeaveRequestsSummary
}

export interface RecentHire {
  name: string
  position: string
  department: string
  start_date: string
}

export interface LeaveRequestsSummary {
  pending: number
  approved: number
  rejected: number
}

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
