import { apiClient, toQueryString } from './client'
import type { PageResponse, Pageable, UserQualificationResponse } from './types'

export interface ListUserQualificationsParams extends Pageable {
  qualificationId?: string
  active?: boolean
}

export async function listUserQualifications(
  userId: string,
  params: ListUserQualificationsParams = {},
) {
  const query = toQueryString({
    qualificationId: params.qualificationId,
    active: params.active,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<UserQualificationResponse>>(
    `/api/users/${userId}/qualifications${query}`,
  )
  return page.content
}

export interface AddUserQualificationParams {
  qualificationId: string
  since?: string
  expiry?: string
  active?: boolean
  certificate?: File
}

export function addUserQualification(userId: string, params: AddUserQualificationParams) {
  const query = toQueryString({
    qualificationId: params.qualificationId,
    since: params.since,
    expiry: params.expiry,
    active: params.active,
  })
  const formData = new FormData()
  if (params.certificate) {
    formData.set('certificate', params.certificate)
  }
  return apiClient.postForm<UserQualificationResponse>(
    `/api/users/${userId}/qualifications${query}`,
    formData,
  )
}

export function deleteUserQualification(userId: string, id: string) {
  return apiClient.delete(`/api/users/${userId}/qualifications/${id}`)
}

export function downloadUserQualificationCertificate(userId: string, id: string) {
  return apiClient.getBlob(`/api/users/${userId}/qualifications/${id}/certificate`)
}

export function toggleUserQualificationActive(userId: string, id: string) {
  return apiClient.post<UserQualificationResponse>(
    `/api/users/${userId}/qualifications/${id}/toggle-active`,
    undefined,
  )
}
