import { apiClient } from './client'
import type { PageResponse, TenantRequest, TenantResponse } from './types'

export async function listTenants() {
  const page = await apiClient.get<PageResponse<TenantResponse>>('/api/tenants')
  return page.content
}

export function createTenant(tenant: TenantRequest) {
  return apiClient.post<TenantResponse>('/api/tenants', tenant)
}

export function updateTenant(id: string, tenant: TenantRequest) {
  return apiClient.put<TenantResponse>(`/api/tenants/${id}`, tenant)
}

export function deleteTenant(id: string) {
  return apiClient.delete(`/api/tenants/${id}`)
}
