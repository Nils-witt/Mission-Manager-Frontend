import { apiClient } from './client'
import type { PageResponse, UserRequest, UserResponse } from './types'

export async function listUsers() {
  const page = await apiClient.get<PageResponse<UserResponse>>('/api/users')
  return page.content
}

export function getCurrentUser() {
  return apiClient.get<UserResponse>('/api/users/me')
}

export function createUser(user: UserRequest) {
  return apiClient.post<UserResponse>('/api/users', user)
}

export function updateUser(id: string, user: UserRequest) {
  return apiClient.put<UserResponse>(`/api/users/${id}`, user)
}

export function deleteUser(id: string) {
  return apiClient.delete(`/api/users/${id}`)
}
