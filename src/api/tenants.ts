import { apiClient } from './client'
import type { TenantRequest, TenantResponse } from './types'

export function listTenants() {
  return apiClient.get<TenantResponse[]>('/api/tenants')
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
