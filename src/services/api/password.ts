import { apiClient } from './client'
import type { PasswordPolicy, UpdatePasswordPolicyPayload } from '@/types/password'

export const passwordApi = {
  getPasswordPolicy(): Promise<PasswordPolicy> {
    return apiClient.get<PasswordPolicy>('/password-policy')
  },

  updatePasswordPolicy(payload: UpdatePasswordPolicyPayload): Promise<PasswordPolicy> {
    return apiClient.put<PasswordPolicy>('/password-policy', payload)
  },
}
