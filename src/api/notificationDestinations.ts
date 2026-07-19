import { apiClient, toQueryString } from './client'
import type {
  NotificationDestinationRequest,
  NotificationDestinationResponse,
  NotificationDeviceType,
  PageResponse,
  Pageable,
} from './types'

export interface ListNotificationDestinationsParams extends Pageable {
  deviceType?: NotificationDeviceType
}

export async function listNotificationDestinations(
  userId: string,
  params: ListNotificationDestinationsParams = {},
) {
  const query = toQueryString({
    deviceType: params.deviceType,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  const page = await apiClient.get<PageResponse<NotificationDestinationResponse>>(
    `/api/users/${userId}/notification-destinations${query}`,
  )
  return page.content
}

export function addNotificationDestination(
  userId: string,
  destination: NotificationDestinationRequest,
) {
  return apiClient.post<NotificationDestinationResponse>(
    `/api/users/${userId}/notification-destinations`,
    destination,
  )
}

export function updateNotificationDestination(
  userId: string,
  id: string,
  destination: NotificationDestinationRequest,
) {
  return apiClient.put<NotificationDestinationResponse>(
    `/api/users/${userId}/notification-destinations/${id}`,
    destination,
  )
}

export function deleteNotificationDestination(userId: string, id: string) {
  return apiClient.delete(`/api/users/${userId}/notification-destinations/${id}`)
}

export function sendTestNotification(userId: string, id: string) {
  return apiClient.post<void>(`/api/users/${userId}/notification-destinations/${id}/test`, undefined)
}
