import { apiClient, toQueryString } from './client'
import type { PageResponse, Pageable, UserRequest, UserResponse } from './types'

export interface ListUsersParams extends Pageable {
  search?: string
  enabled?: boolean
  locked?: boolean
  tenantId?: string
}

export async function listUsers(params: ListUsersParams = {}) {
  const query = toQueryString({
    search: params.search,
    enabled: params.enabled,
    locked: params.locked,
    tenantId: params.tenantId,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<UserResponse>>(`/api/users${query}`)
  return page.content
}

export function getUser(id: string) {
  return apiClient.get<UserResponse>(`/api/users/${id}`)
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
