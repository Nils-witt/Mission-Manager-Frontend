import type { SecurityRole } from '../../api/types'

export function formatSecurityRole(role: SecurityRole): string {
  return `${role.type}_${role.scope}`
}

export function securityRolesEqual(a: SecurityRole, b: SecurityRole): boolean {
  return a.type === b.type && a.scope === b.scope
}
