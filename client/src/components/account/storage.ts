import type { PublicUser, StoredUser } from './types'

export const STORAGE_KEY = 'travel-app-user'

export const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const readStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export const saveStoredUser = (user: StoredUser) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const readPublicUser = (): PublicUser | null => {
  const stored = readStoredUser()
  if (!stored?.name || !stored?.email) return null
  return { name: stored.name, email: stored.email }
}

export const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY)
}
