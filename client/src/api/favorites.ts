import axios from 'axios'
import { API_URL } from './config'

export type FavoritePlaceRecord = {
  place_id: number
}

export type FavoriteRouteRecord = {
  route_id: number
}

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
})

export const fetchFavoritePlaces = async (token: string) => {
  const { data } = await axios.get<FavoritePlaceRecord[]>(
    `${API_URL}/favorites/places`,
    authHeaders(token),
  )
  return data
}

export const fetchFavoriteRoutes = async (token: string) => {
  const { data } = await axios.get<FavoriteRouteRecord[]>(
    `${API_URL}/favorites/routes`,
    authHeaders(token),
  )
  return data
}
