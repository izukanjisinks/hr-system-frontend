export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  employee_id: string | null
  created_at: string
}

export type UserRole = 'super_admin' | 'hr_manager' | 'manager' | 'employee'

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: string[]
  }
}
