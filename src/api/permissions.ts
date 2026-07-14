import type { Permission } from './types'

export function hasPermission(permissions: Permission[], scope: Permission): boolean {
  return permissions.includes(scope)
}

export function canCreateAny(items: { permissions: Permission[] }[]): boolean {
  return items.length === 0 || items.some((item) => hasPermission(item.permissions, 'CREATE'))
}
