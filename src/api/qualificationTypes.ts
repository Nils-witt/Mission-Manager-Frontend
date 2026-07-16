import { apiClient, toQueryString } from './client'
import type {
  PageResponse,
  Pageable,
  QualificationTypeRequest,
  QualificationTypeResponse,
} from './types'

export interface ListQualificationTypesParams extends Pageable {
  name?: string
}

export async function listQualificationTypes(params: ListQualificationTypesParams = {}) {
  const query = toQueryString({
    name: params.name,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<QualificationTypeResponse>>(
    `/api/qualification-types${query}`,
  )
  return page.content
}

export function getQualificationType(id: string) {
  return apiClient.get<QualificationTypeResponse>(`/api/qualification-types/${id}`)
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
