import { apiClient } from './client'
import type { SecurityGroupRequest, SecurityGroupResponse } from './types'

export function listSecurityGroups() {
  return apiClient.get<SecurityGroupResponse[]>('/api/security-groups')
}

export function createSecurityGroup(group: SecurityGroupRequest) {
  return apiClient.post<SecurityGroupResponse>('/api/security-groups', group)
}

export function updateSecurityGroup(id: string, group: SecurityGroupRequest) {
  return apiClient.put<SecurityGroupResponse>(`/api/security-groups/${id}`, group)
}

export function deleteSecurityGroup(id: string) {
  return apiClient.delete(`/api/security-groups/${id}`)
}
