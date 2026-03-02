import { apiClient } from './client'
import type { GetPayrollPeriodsResponse, GetPayslipsResponse } from '@/types/payroll'

export const payrollApi = {
  async getPayrollPeriods(params?: {
    page?: number
    page_size?: number
  }): Promise<GetPayrollPeriodsResponse> {
    return apiClient.get('/hr/payrolls', { params })
  },

  async runPayroll(periodId: string): Promise<void> {
    return apiClient.post(`/hr/payrolls/${periodId}/run`)
  },

  async getMyPayslips(): Promise<GetPayslipsResponse> {
    return apiClient.get<GetPayslipsResponse>('/hr/payslips/me')
  },
}
