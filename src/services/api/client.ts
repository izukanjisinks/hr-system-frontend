import type { ApiError } from '@/types/auth'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api/v1'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  requiresAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (requiresAuth) {
    const token = localStorage.getItem('hr_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: { code: 'UNKNOWN_ERROR', message: `HTTP ${response.status}` },
    }))
    throw errorData
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, requiresAuth = true) =>
    request<T>('GET', path, undefined, requiresAuth),

  post: <T>(path: string, body?: unknown, requiresAuth = true) =>
    request<T>('POST', path, body, requiresAuth),

  put: <T>(path: string, body?: unknown, requiresAuth = true) =>
    request<T>('PUT', path, body, requiresAuth),

  delete: <T>(path: string, requiresAuth = true) =>
    request<T>('DELETE', path, undefined, requiresAuth),
}
