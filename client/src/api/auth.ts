import axios from 'axios'
import { API_URL } from './config'

export type ApiUser = {
  id: number
  email: string
  name: string | null
  username: string | null
  phone: string | null
  role_id: number
  role?: {
    id: number
    name: string
  }
}

export type AuthResponse = {
  user: ApiUser
  token: string
}

export const toPublicUser = (user: ApiUser) => ({
  name: user.name?.trim() || user.username || user.email,
  email: user.email,
})

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return String(error.response.data.error)
  }
  return fallback
}

export const login = async (email: string, password: string) => {
  const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
    email,
    password,
  })
  return data
}

export const register = async (payload: {
  email: string
  password: string
  name?: string
  username?: string
  phone?: string
}) => {
  const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/register`, payload)
  return data
}

export const fetchMe = async (token: string) => {
  const { data } = await axios.get<ApiUser>(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  phone?: string
  password?: string
}

export const updateUser = async (token: string, payload: UpdateUserPayload) => {
  const { data } = await axios.put<ApiUser>(`${API_URL}/user/update`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}
