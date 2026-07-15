import { apiClient } from './client'
import type {
  MissionPositionRequest,
  MissionPositionResponse,
  MissionRequest,
  MissionResponse,
  PageResponse,
  UserResponse,
} from './types'

export async function listMissions() {
  const page = await apiClient.get<PageResponse<MissionResponse>>('/api/missions')
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

export async function listMissionUsers(missionId: string) {
  const page = await apiClient.get<PageResponse<UserResponse>>(`/api/missions/${missionId}/users`)
  return page.content
}

export function assignMissionUser(missionId: string, userId: string) {
  return apiClient.post<void>(`/api/missions/${missionId}/users`, {
    userId,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
  })
}

export function unassignMissionUser(missionId: string, userId: string) {
  return apiClient.delete(`/api/missions/${missionId}/users/${userId}`)
}

export async function listMissionPositions(missionId: string) {
  const page = await apiClient.get<PageResponse<MissionPositionResponse>>(
    `/api/missions/${missionId}/positions`,
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
  return apiClient.post<MissionPositionResponse>(
    `/api/missions/${missionId}/positions/${id}/assigned-user`,
    { assignedUserId },
  )
}
