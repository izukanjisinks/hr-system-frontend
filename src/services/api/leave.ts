import { apiClient } from './client'
import type { LeaveRequestsResponse, LeaveType, CreateLeaveRequestPayload, LeaveRequest } from '@/types/leave'

export const leaveApi = {
  getMyLeaveRequests(page = 1, pageSize = 20): Promise<LeaveRequestsResponse> {
    return apiClient.get<LeaveRequestsResponse>(
      `/hr/leave-requests/me?page=${page}&page_size=${pageSize}`
    )
  },

  getLeaveTypes(): Promise<LeaveType[]> {
    return apiClient.get<LeaveType[]>('/hr/leave-types')
  },

  createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest> {
    return apiClient.post<LeaveRequest>('/hr/leave-requests', payload)
  },
}
