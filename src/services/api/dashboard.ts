import { apiClient } from './client'
import type { DashboardData, AdminDashboardData } from '@/types/dashboard'
import { employeeApi } from './employee'
import { departmentApi } from './department'
import { positionApi } from './position'
import { leaveApi } from './leave'
import { payrollApi } from './payroll'

export const dashboardApi = {
  getDashboard(): Promise<DashboardData> {
    return apiClient.get<DashboardData>('/hr/dashboard/me')
  },

  async getAdminDashboard(): Promise<AdminDashboardData> {
    // Helper to safely fetch leave counts — endpoint may not exist yet
    const safeLeaveCount = (status: 'pending' | 'approved' | 'rejected') =>
      leaveApi.getAllLeaveRequests({ status })
        .then(res => {
          console.log(`Leave requests (${status}) raw response:`, JSON.stringify(res))
          return res?.pagination?.total_items ?? res?.data?.length ?? 0
        })
        .catch((err) => {
          console.error(`Failed to fetch ${status} leave requests:`, err)
          return 0
        })

    const [employees, departments, positions, pendingCount, approvedCount, rejectedCount, payroll] = await Promise.all([
      employeeApi.getEmployees({ page: 1, page_size: 4 }),
      departmentApi.getDepartments({ page: 1, page_size: 100 }),
      positionApi.getPositions({ page: 1, page_size: 100 }),
      safeLeaveCount('pending'),
      safeLeaveCount('approved'),
      safeLeaveCount('rejected'),
      payrollApi.getPayrollPeriods({ page: 1, page_size: 100 }),
    ])

    const activePayrollPeriods = payroll.data.filter(p => p.status === 'OPEN').length

    // Build lookup maps for department and position names
    const deptMap = new Map(departments.data.map(d => [d.id, d.name]))
    const posMap = new Map(positions.data.map(p => [p.id, p.title]))

    const openPositions = positions.data.filter(p => p.is_active).length

    return {
      total_employees: employees.total,
      total_departments: departments.total,
      open_positions: openPositions,
      pending_leave_requests: pendingCount,
      active_payroll_periods: activePayrollPeriods,
      recent_hires: employees.data.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        position: posMap.get(emp.position_id) || 'N/A',
        department: deptMap.get(emp.department_id) || 'N/A',
        start_date: emp.hire_date,
      })),
      leave_requests_summary: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    }
  },
}
