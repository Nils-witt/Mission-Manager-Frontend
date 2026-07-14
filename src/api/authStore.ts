const TOKEN_KEY = 'authToken'
const USERNAME_KEY = 'authUsername'
const FIRST_NAME_KEY = 'authFirstName'
const LAST_NAME_KEY = 'authLastName'

type Listener = () => void

const listeners = new Set<Listener>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function getFirstName(): string | null {
  return localStorage.getItem(FIRST_NAME_KEY)
}

export function getLastName(): string | null {
  return localStorage.getItem(LAST_NAME_KEY)
}

export function setSession(
  token: string,
  username: string,
  firstName: string,
  lastName: string,
) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
  localStorage.setItem(FIRST_NAME_KEY, firstName)
  localStorage.setItem(LAST_NAME_KEY, lastName)
  emitChange()
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(FIRST_NAME_KEY)
  localStorage.removeItem(LAST_NAME_KEY)
  emitChange()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
