import { apiClient } from './client'
import type { MissionRequest, MissionResponse } from './types'

export function listMissions() {
  return apiClient.get<MissionResponse[]>('/api/missions')
}

export function createMission(mission: MissionRequest) {
  return apiClient.post<MissionResponse>('/api/missions', mission)
}

export function updateMission(id: string, mission: MissionRequest) {
  return apiClient.put<MissionResponse>(`/api/missions/${id}`, mission)
}

export function deleteMission(id: string) {
  return apiClient.delete(`/api/missions/${id}`)
}
