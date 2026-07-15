import { apiClient } from './client'
import type { PageResponse, QualificationRequest, QualificationResponse } from './types'

export async function listQualifications() {
  const page = await apiClient.get<PageResponse<QualificationResponse>>('/api/qualifications')
  return page.content
}

export function getQualification(id: string) {
  return apiClient.get<QualificationResponse>(`/api/qualifications/${id}`)
}

export function createQualification(qualification: QualificationRequest) {
  return apiClient.post<QualificationResponse>('/api/qualifications', qualification)
}

export function updateQualification(id: string, qualification: QualificationRequest) {
  return apiClient.put<QualificationResponse>(`/api/qualifications/${id}`, qualification)
}

export function deleteQualification(id: string) {
  return apiClient.delete(`/api/qualifications/${id}`)
}
