import { apiClient } from './client'
import type { SystemUser, CreateUserPayload, UpdateUserPayload } from '@/types/user'

export const userApi = {
  async getUsers(): Promise<SystemUser[]> {
    return apiClient.get<SystemUser[]>('/users')
  },

  async createUser(payload: CreateUserPayload): Promise<SystemUser> {
    return apiClient.post<SystemUser>('/users', payload)
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<SystemUser> {
    return apiClient.put<SystemUser>(`/users/${userId}`, payload)
  },

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete(`/users/${userId}`)
  },

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    return apiClient.post(`/users/${userId}/reset-password`, { new_password: newPassword })
  },
}
