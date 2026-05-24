import axios from 'axios'
import { getApiErrorMessage } from './auth'
import { API_URL } from './config'
import type {
  PlannerBuildRequest,
  PlannerBuildResponse,
  PlannerSaveRequest,
  SavedRouteDetails,
  SavedRouteListItem,
} from '../types'

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

export const buildPlannerRoute = async (
  payload: PlannerBuildRequest,
  token?: string | null,
) => {
  try {
    const headers = token ? authHeaders(token) : undefined
    const { data } = await axios.post<PlannerBuildResponse>(
      `${API_URL}/planner/build`,
      payload,
      { headers },
    )
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Не удалось построить маршрут.'))
  }
}

export const savePlannerRoute = async (payload: PlannerSaveRequest, token: string) => {
  try {
    const { data } = await axios.post<SavedRouteDetails>(
      `${API_URL}/planner/routes`,
      payload,
      { headers: authHeaders(token) },
    )
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Не удалось сохранить маршрут.'))
  }
}

export const fetchSavedRoutes = async (token: string) => {
  try {
    const { data } = await axios.get<SavedRouteListItem[]>(`${API_URL}/planner/routes`, {
      headers: authHeaders(token),
    })
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Не удалось загрузить сохранённые маршруты.'))
  }
}

export const fetchSavedRoute = async (id: number, token: string) => {
  try {
    const { data } = await axios.get<SavedRouteDetails>(`${API_URL}/planner/routes/${id}`, {
      headers: authHeaders(token),
    })
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Не удалось открыть маршрут.'))
  }
}

export const deleteSavedRoute = async (id: number, token: string) => {
  try {
    await axios.delete(`${API_URL}/planner/routes/${id}`, {
      headers: authHeaders(token),
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Не удалось удалить маршрут.'))
  }
}
