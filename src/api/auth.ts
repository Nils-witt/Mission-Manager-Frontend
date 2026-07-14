import { apiClient } from './client'
import { clearSession, setSession } from './authStore'
import { getCurrentUser } from './users'
import type { TokenResponse } from './types'

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/token', { username, password })
  setSession(response.token, username, '', '')
  try {
    const currentUser = await getCurrentUser()
    setSession(response.token, username, currentUser.firstName, currentUser.lastName)
  } catch (err) {
    clearSession()
    throw err
  }
  return response
}
