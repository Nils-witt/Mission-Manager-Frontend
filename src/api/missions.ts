import { apiClient, toQueryString } from './client'
import type {
  AssignedUserRequest,
  MissionPositionRequest,
  MissionPositionResponse,
  MissionRequest,
  MissionResponse,
  PageResponse,
  Pageable,
  UserMissionAssignmentRequest,
  UserMissionAssignmentResponse,
} from './types'

export interface ListMissionsParams extends Pageable {
  name?: string
  tenantId?: string
  startAfter?: string
  startBefore?: string
}

export async function listMissions(params: ListMissionsParams = {}) {
  const query = toQueryString({
    name: params.name,
    tenantId: params.tenantId,
    startAfter: params.startAfter,
    startBefore: params.startBefore,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<MissionResponse>>(`/api/missions${query}`)
  return page.content
}

export function createMission(mission: MissionRequest) {
  return apiClient.post<MissionResponse>('/api/missions', mission)
}

export function updateMission(id: string, mission: MissionRequest) {
  return apiClient.put<MissionResponse>(`/api/missions/${id}`, mission)
}

export function getMission(id: string) {
  return apiClient.get<MissionResponse>(`/api/missions/${id}`)
}

export function deleteMission(id: string) {
  return apiClient.delete(`/api/missions/${id}`)
}

export interface ListMissionUsersParams extends Pageable {
  userId?: string
}

export async function listMissionUsers(missionId: string, params: ListMissionUsersParams = {}) {
  const query = toQueryString({
    userId: params.userId,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<UserMissionAssignmentResponse>>(
    `/api/missions/${missionId}/users${query}`,
  )
  return page.content
}

export function assignMissionUser(missionId: string, assignment: UserMissionAssignmentRequest) {
  return apiClient.post<UserMissionAssignmentResponse>(
    `/api/missions/${missionId}/users`,
    assignment,
  )
}

export function unassignMissionUser(missionId: string, id: string) {
  return apiClient.delete(`/api/missions/${missionId}/users/${id}`)
}

export interface ListMissionPositionsParams extends Pageable {
  name?: string
  assignedUserId?: string
}

export async function listMissionPositions(
  missionId: string,
  params: ListMissionPositionsParams = {},
) {
  const query = toQueryString({
    name: params.name,
    assignedUserId: params.assignedUserId,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<MissionPositionResponse>>(
    `/api/missions/${missionId}/positions${query}`,
  )
  return page.content
}

export function createMissionPosition(missionId: string, position: MissionPositionRequest) {
  return apiClient.post<MissionPositionResponse>(`/api/missions/${missionId}/positions`, position)
}

export function deleteMissionPosition(missionId: string, id: string) {
  return apiClient.delete(`/api/missions/${missionId}/positions/${id}`)
}

export function assignMissionPositionUser(
  missionId: string,
  id: string,
  assignedUserId: string | null,
) {
  const body: AssignedUserRequest = { assignedUserId }
  return apiClient.post<MissionPositionResponse>(
    `/api/missions/${missionId}/positions/${id}/assigned-user`,
    body,
  )
}
