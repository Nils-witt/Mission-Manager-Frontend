import { apiClient } from './client'
import type { UserRequest, UserResponse } from './types'

export function listUsers() {
  return apiClient.get<UserResponse[]>('/api/users')
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
