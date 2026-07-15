import { apiClient } from './client'
import type { PageResponse, QualificationTypeRequest, QualificationTypeResponse } from './types'

export async function listQualificationTypes() {
  const page = await apiClient.get<PageResponse<QualificationTypeResponse>>(
    '/api/qualification-types',
  )
  return page.content
}

export function createQualificationType(qualificationType: QualificationTypeRequest) {
  return apiClient.post<QualificationTypeResponse>('/api/qualification-types', qualificationType)
}

export function updateQualificationType(
  id: string,
  qualificationType: QualificationTypeRequest,
) {
  return apiClient.put<QualificationTypeResponse>(
    `/api/qualification-types/${id}`,
    qualificationType,
  )
}

export function deleteQualificationType(id: string) {
  return apiClient.delete(`/api/qualification-types/${id}`)
}
