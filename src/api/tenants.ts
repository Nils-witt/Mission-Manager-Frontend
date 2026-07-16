import { apiClient, toQueryString } from './client'
import type { PageResponse, Pageable, TenantRequest, TenantResponse } from './types'

export interface ListTenantsParams extends Pageable {
  name?: string
}

export async function listTenants(params: ListTenantsParams = {}) {
  const query = toQueryString({
    name: params.name,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<TenantResponse>>(`/api/tenants${query}`)
  return page.content
}

export function getTenant(id: string) {
  return apiClient.get<TenantResponse>(`/api/tenants/${id}`)
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
