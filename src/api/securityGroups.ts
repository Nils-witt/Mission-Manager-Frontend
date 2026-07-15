import { apiClient } from './client'
import type { PageResponse, SecurityGroupRequest, SecurityGroupResponse, SecurityRole } from './types'

export async function listSecurityGroups(tenantId: string) {
  const page = await apiClient.get<PageResponse<SecurityGroupResponse>>(
    `/api/tenants/${tenantId}/security-groups`,
  )
  return page.content
}

export function listAvailableSecurityRoles() {
  return apiClient.get<SecurityRole[]>('/api/security-groups/roles')
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
