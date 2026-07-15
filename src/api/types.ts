export interface UserResponse {
  id: string
  createdAt: string
  updatedAt: string
  username: string
  firstName: string
  lastName: string
  email: string
  enabled: boolean
  locked: boolean
  primaryTenantId: string | null
  tenantIds: string[]
  securityGroupIds: string[]
  permissions: Permission[]
}

export interface UserRequest {
  username: string
  firstName: string
  lastName: string
  email: string
  enabled: boolean
  locked: boolean
  primaryTenantId: string | null
  tenantIds: string[]
  securityGroupIds: string[]
}

export interface TenantResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  permissions: Permission[]
}

export interface TenantRequest {
  name: string
}

export type Permission = 'VIEW' | 'EDIT' | 'CREATE' | 'DELETE' | 'ADMIN'

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface MissionResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  tenantId: string
  startTime: string | null
  endTime: string | null
  latitude: number | null
  longitude: number | null
  streetAddress: string | null
  permissions: Permission[]
}

export interface MissionRequest {
  name: string
  tenantId: string
  startTime: string | null
  endTime: string | null
  latitude: number | null
  longitude: number | null
  streetAddress: string | null
}

export interface MissionPositionResponse {
  id: string
  createdAt: string
  updatedAt: string
  missionId: string
  name: string
  qualificationIds: string[]
  assignedUserId: string | null
  assignedUsername: string | null
  permissions: Permission[]
}

export interface MissionPositionRequest {
  name: string
  qualificationIds: string[]
  assignedUserId: string | null
}

export interface QualificationResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  typeId: string
  typeName: string
  includedQualificationIds: string[]
  permissions: Permission[]
}

export interface QualificationRequest {
  name: string
  typeId: string
  includedQualificationIds: string[]
}

export interface QualificationTypeResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  permissions: Permission[]
}

export interface QualificationTypeRequest {
  name: string
}

export type SecurityRoleType =
  | 'MAPOVERLAY'
  | 'MAPBASELAYER'
  | 'USER'
  | 'MAPGROUP'
  | 'SECURITYGROUP'
  | 'UNIT'
  | 'MAPITEM'
  | 'GLOBAL'
  | 'PHOTO'
  | 'MISSIONGROUP'
  | 'MISSION'
  | 'PATIENT'
  | 'UHS'
  | 'AUDITLOG'
  | 'EMAIL'
  | 'QUALIFICATION'
  | 'POSITION'

export type SecurityRoleScope = Permission

export interface SecurityRole {
  type: SecurityRoleType
  scope: SecurityRoleScope
}

export interface SecurityGroupResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  tenantId: string
  ssoGroupName: string
  roles: SecurityRole[]
  builtIn: boolean
  permissions: Permission[]
}

export interface SecurityGroupRequest {
  name: string
  ssoGroupName: string
  roles: SecurityRole[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  token: string
  expiresAt: string
}
