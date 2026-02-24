import { apiClient } from './client'
import type { PasswordPolicy, UpdatePasswordPolicyPayload } from '@/types/password'

export interface GeneratePasswordResponse {
  password: string
}

export const passwordApi = {
  getPasswordPolicy(): Promise<PasswordPolicy> {
    return apiClient.get<PasswordPolicy>('/password-policy')
  },

  updatePasswordPolicy(payload: UpdatePasswordPolicyPayload): Promise<PasswordPolicy> {
    return apiClient.put<PasswordPolicy>('/password-policy', payload)
  },

  generatePassword(): Promise<GeneratePasswordResponse> {
    return apiClient.get<GeneratePasswordResponse>('/password-policy/generate')
  },
}
