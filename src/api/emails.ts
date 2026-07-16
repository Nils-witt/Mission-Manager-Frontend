import { apiClient } from './client'
import type { EmailRequest } from './types'

export function sendEmail(email: EmailRequest) {
  return apiClient.post<void>('/api/emails', email)
}
