import { apiClient, toQueryString } from './client'
import type {
  LogBookEntryRequest,
  LogBookEntryResponse,
  PageResponse,
  Pageable,
  StoredFileResponse,
} from './types'

export async function listLogBookEntries(missionId: string, params: Pageable = {}) {
  const query = toQueryString({
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<LogBookEntryResponse>>(
    `/api/missions/${missionId}/logbook${query}`,
  )
  return page.content
}

export function addLogBookEntry(missionId: string, entry: LogBookEntryRequest) {
  return apiClient.post<LogBookEntryResponse>(`/api/missions/${missionId}/logbook`, entry)
}

export function uploadLogBookAttachment(missionId: string, file: File, name?: string) {
  const query = toQueryString({ name })
  const formData = new FormData()
  formData.set('file', file)
  return apiClient.postForm<StoredFileResponse>(
    `/api/missions/${missionId}/logbook/attachments${query}`,
    formData,
  )
}

export function downloadLogBookAttachment(missionId: string, fileId: string) {
  return apiClient.getBlob(`/api/missions/${missionId}/logbook/attachments/${fileId}`)
}
