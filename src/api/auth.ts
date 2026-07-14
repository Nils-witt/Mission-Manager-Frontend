import { apiClient } from './client'
import { setSession } from './authStore'
import type { TokenResponse } from './types'

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/token', { username, password })
  setSession(response.token, username)
  return response
}
