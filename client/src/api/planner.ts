import axios from 'axios'
import { getApiErrorMessage } from './auth'
import { API_URL } from './config'
import type { PlannerBuildRequest, PlannerBuildResponse } from '../types'

export const buildPlannerRoute = async (
  payload: PlannerBuildRequest,
  token?: string | null,
) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
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
