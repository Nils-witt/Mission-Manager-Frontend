import { useSyncExternalStore } from 'react'
import { getToken, getUsername, subscribe } from './authStore'

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken)
  const username = useSyncExternalStore(subscribe, getUsername)
  return { token, username, isAuthenticated: token !== null }
}
