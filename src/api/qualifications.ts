import { apiClient, toQueryString } from './client'
import type { PageResponse, Pageable, QualificationRequest, QualificationResponse } from './types'

export interface ListQualificationsParams extends Pageable {
  name?: string
}

export async function listQualifications(params: ListQualificationsParams = {}) {
  const query = toQueryString({
    name: params.name,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<QualificationResponse>>(
    `/api/qualifications${query}`,
  )
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
