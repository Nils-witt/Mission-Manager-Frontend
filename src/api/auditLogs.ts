import { apiClient, toQueryString } from './client'
import type { AuditLogResponse, PageResponse, Pageable } from './types'

export interface ListAuditLogsParams extends Pageable {
  entityName?: string
  entityId?: string
}

export function listAuditLogs(params: ListAuditLogsParams = {}) {
  const query = toQueryString({
    entityName: params.entityName,
    entityId: params.entityId,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })
  return apiClient.get<PageResponse<AuditLogResponse>>(`/api/audit-logs${query}`)
}
