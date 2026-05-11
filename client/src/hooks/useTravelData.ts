import { useEffect, useState } from 'react'
import axios from 'axios'
import type { PlaceDetails, PlaceListItem, RouteDetails, RouteListItem } from '../types'

const API_URL = 'http://localhost:5000/api'

export const useTravelData = () => {
  const [places, setPlaces] = useState<PlaceListItem[]>([])
  const [routes, setRoutes] = useState<RouteListItem[]>([])
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState<number | null>(null)
  const [favoriteRoutesLoading, setFavoriteRoutesLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [yandexApiKey, setYandexApiKey] = useState<string | null>(null)
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<Set<number>>(new Set())
  const [favoriteRouteIds, setFavoriteRouteIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    let mounted = true

    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [placesRes, routesRes] = await Promise.all([
          axios.get<PlaceListItem[]>(`${API_URL}/places`),
          axios.get<RouteListItem[]>(`${API_URL}/routes`),
        ])
        const configRes = await axios.get<{ yandexMapsApiKey: string | null }>(`${API_URL}/config/public`)

        if (!mounted) return

        setPlaces(placesRes.data)
        setRoutes(routesRes.data)
        setYandexApiKey(configRes.data.yandexMapsApiKey)
      } catch {
        if (!mounted) return
        setError('Не удалось загрузить данные. Проверьте, что сервер запущен на localhost:5000.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadInitialData()
    return () => {
      mounted = false
    }
  }, [])

  const openPlaceDetails = async (id: number) => {
    try {
      setDetailsLoading(true)
      const { data } = await axios.get<PlaceDetails>(`${API_URL}/places/${id}`)
      setPlaceDetails(data)
    } finally {
      setDetailsLoading(false)
    }
  }

  const openRouteDetails = async (id: number) => {
    try {
      setDetailsLoading(true)
      const { data } = await axios.get<RouteDetails>(`${API_URL}/routes/${id}`)
      setRouteDetails(data)
    } finally {
      setDetailsLoading(false)
    }
  }

  const togglePlaceFavorite = async (placeId: number) => {
    try {
      setFavoritesLoading(placeId)
      const isFavorite = favoritePlaceIds.has(placeId)
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${placeId}`)
        setFavoritePlaceIds((prev) => {
          const next = new Set(prev)
          next.delete(placeId)
          return next
        })
      } else {
        await axios.post(`${API_URL}/favorite/${placeId}`)
        setFavoritePlaceIds((prev) => new Set(prev).add(placeId))
      }
    } finally {
      setFavoritesLoading(null)
    }
  }

  const toggleRouteFavorite = async (routeId: number) => {
    try {
      setFavoriteRoutesLoading(routeId)
      const isFavorite = favoriteRouteIds.has(routeId)
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorite-routes/${routeId}`)
        setFavoriteRouteIds((prev) => {
          const next = new Set(prev)
          next.delete(routeId)
          return next
        })
      } else {
        await axios.post(`${API_URL}/favorite-route/${routeId}`)
        setFavoriteRouteIds((prev) => new Set(prev).add(routeId))
      }
    } finally {
      setFavoriteRoutesLoading(null)
    }
  }

  const closeDetails = () => {
    if (placeDetails) {
      setPlaceDetails(null)
      return
    }
    setRouteDetails(null)
  }

  const searchPlaces = async (query: string) => {
    try {
      const params = query.trim() ? { search: query.trim() } : undefined
      const { data } = await axios.get<PlaceListItem[]>(`${API_URL}/places`, { params })
      setPlaces(data)
    } catch {
      setError('Не удалось выполнить поиск мест.')
    }
  }

  const searchRoutes = async (query: string) => {
    try {
      const params = query.trim() ? { search: query.trim() } : undefined
      const { data } = await axios.get<RouteListItem[]>(`${API_URL}/routes`, { params })
      setRoutes(data)
    } catch {
      setError('Не удалось выполнить поиск маршрутов.')
    }
  }

  return {
    places,
    routes,
    placeDetails,
    routeDetails,
    loading,
    detailsLoading,
    favoritesLoading,
    favoriteRoutesLoading,
    error,
    yandexApiKey,
    favoritePlaceIds,
    favoriteRouteIds,
    openPlaceDetails,
    openRouteDetails,
    togglePlaceFavorite,
    toggleRouteFavorite,
    closeDetails,
    searchPlaces,
    searchRoutes,
  }
}
