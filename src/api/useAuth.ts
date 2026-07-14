import { useSyncExternalStore } from 'react'
import { getFirstName, getLastName, getToken, getUsername, subscribe } from './authStore'

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken)
  const username = useSyncExternalStore(subscribe, getUsername)
  const firstName = useSyncExternalStore(subscribe, getFirstName)
  const lastName = useSyncExternalStore(subscribe, getLastName)
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const displayName = fullName || username
  return { token, username, firstName, lastName, displayName, isAuthenticated: token !== null }
}
