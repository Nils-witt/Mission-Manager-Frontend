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
}

export interface UserRequest {
  username: string
  firstName: string
  lastName: string
  email: string
  password?: string
  enabled: boolean
  locked: boolean
  primaryTenantId: string | null
  securityGroupIds: string[]
}

export interface TenantResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
}

export interface TenantRequest {
  name: string
}

export type Permission = 'VIEW' | 'EDIT' | 'CREATE' | 'DELETE' | 'ADMIN'

export interface SecurityGroupResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  ssoGroupName: string
  roles: string[]
  builtIn: boolean
  permissions: Permission[]
}

export interface SecurityGroupRequest {
  name: string
  ssoGroupName: string
  roles: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  token: string
  expiresAt: string
}
