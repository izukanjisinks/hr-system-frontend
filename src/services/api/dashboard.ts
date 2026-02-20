import { apiClient } from './client'
import type { DashboardData } from '@/types/dashboard'

export const dashboardApi = {
  getDashboard(): Promise<DashboardData> {
    return apiClient.get<DashboardData>('/hr/dashboard/me')
  },
}
