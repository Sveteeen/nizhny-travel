import type { PublicUser } from './types'

export const STORAGE_KEY = 'travel-app-session'

export type StoredSession = {
  token: string
  user: PublicUser
}

export const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const readSession = (): StoredSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed?.token || !parsed?.user?.email) return null
    return parsed
  } catch {
    return null
  }
}

export const saveSession = (session: StoredSession) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const readAuthToken = () => readSession()?.token ?? null

export const readPublicUser = (): PublicUser | null => readSession()?.user ?? null

export const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY)
}
