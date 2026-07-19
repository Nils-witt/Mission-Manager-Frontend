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
  roles: SecurityRole[]
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

export interface Pageable {
  page?: number
  size?: number
  sort?: string[]
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

export interface AssignedUserRequest {
  assignedUserId: string | null
}

export interface UserMissionAssignmentResponse {
  id: string
  createdAt: string
  updatedAt: string
  missionId: string
  userId: string
  username: string
  startTime: string | null
  endTime: string | null
  permissions: Permission[]
}

export interface UserMissionAssignmentRequest {
  userId: string
  startTime: string | null
  endTime: string | null
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

export interface UserQualificationResponse {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  qualificationId: string
  qualificationName: string
  since: string | null
  expiry: string | null
  active: boolean
  expired: boolean
  hasCertificate: boolean
  permissions: Permission[]
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
  | 'TENANT'

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

export interface TokenValidationResponse {
  valid: boolean
  userId: string | null
  username: string | null
}

export type AuditLogChangeType = 'CREATED' | 'UPDATED' | 'DELETED' | 'RETRANSMIT'

export interface FieldChange {
  field: string
  oldValue: string | null
  newValue: string | null
}

export interface AuditLogResponse {
  id: string
  entityName: string
  entityId: string
  changeType: AuditLogChangeType
  changedBy: string
  changedAt: string
  changes: FieldChange[]
  permissions: Permission[]
}

export interface EmbeddableLocation {
  latitude: number | null
  longitude: number | null
  height: number | null
  locationName: string | null
}

export interface StoredFileResponse {
  id: string
  createdAt: string
  name: string
  originalFileName: string
  location: EmbeddableLocation | null
}

export interface LogBookEntryResponse {
  id: string
  createdAt: string
  updatedAt: string
  missionId: string
  text: string
  sender: string
  recipient: string
  author: string
  location: EmbeddableLocation | null
  attachments: StoredFileResponse[]
  permissions: Permission[]
}

export interface LogBookEntryRequest {
  text: string
  sender: string
  recipient: string
  attachmentIds: string[]
  location: EmbeddableLocation | null
}

export interface EmailRequest {
  recipientType: 'USER' | 'TENANT' | 'GROUP'
  recipientId: string
  subject: string
  body: string
}

export type NotificationDeviceType = 'ANDROID' | 'IOS' | 'WEB'

export interface NotificationDestinationResponse {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  deviceType: NotificationDeviceType
  token: string
  name: string
  permissions: Permission[]
}

export interface NotificationDestinationRequest {
  deviceType: NotificationDeviceType
  token: string
  name: string
}
