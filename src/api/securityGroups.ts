import { apiClient, toQueryString } from './client'
import type {
  PageResponse,
  Pageable,
  SecurityGroupRequest,
  SecurityGroupResponse,
  SecurityRole,
} from './types'

export interface ListSecurityGroupsParams extends Pageable {
  name?: string
}

export async function listSecurityGroups(tenantId: string, params: ListSecurityGroupsParams = {}) {
  const query = toQueryString({
    name: params.name,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<SecurityGroupResponse>>(
    `/api/tenants/${tenantId}/security-groups${query}`,
  )
  return page.content
}

export function getSecurityGroup(tenantId: string, id: string) {
  return apiClient.get<SecurityGroupResponse>(`/api/tenants/${tenantId}/security-groups/${id}`)
}

export function listAvailableSecurityRoles() {
  return apiClient.get<SecurityRole[]>('/api/security-groups/roles')
}

export function listAvailableSecurityRolesForTenant(tenantId: string) {
  return apiClient.get<SecurityRole[]>(`/api/tenants/${tenantId}/security-groups/roles`)
}

export function createSecurityGroup(tenantId: string, group: SecurityGroupRequest) {
  return apiClient.post<SecurityGroupResponse>(`/api/tenants/${tenantId}/security-groups`, group)
}

export function updateSecurityGroup(tenantId: string, id: string, group: SecurityGroupRequest) {
  return apiClient.put<SecurityGroupResponse>(
    `/api/tenants/${tenantId}/security-groups/${id}`,
    group,
  )
}

export function deleteSecurityGroup(tenantId: string, id: string) {
  return apiClient.delete(`/api/tenants/${tenantId}/security-groups/${id}`)
}
