import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { fetchFavoritePlaces, fetchFavoriteRoutes } from '../api/favorites'
import { API_URL } from '../api/config'
import { readAuthToken } from '../components/account/storage'
import type { Category, PlaceDetails, PlaceListItem, RouteDetails, RouteListItem, Tag } from '../types'

const getAuthConfig = () => {
  const token = readAuthToken()
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

export type Notice = {
  message: string
  action?: 'login'
}

export const useTravelData = (isAuthenticated: boolean) => {
  const [places, setPlaces] = useState<PlaceListItem[]>([])
  const [routes, setRoutes] = useState<RouteListItem[]>([])
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState<number | null>(null)
  const [favoriteRoutesLoading, setFavoriteRoutesLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [yandexApiKey, setYandexApiKey] = useState<string | null>(null)
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<Set<number>>(new Set())
  const [favoriteRouteIds, setFavoriteRouteIds] = useState<Set<number>>(new Set())
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const loadFavorites = useCallback(async () => {
    const token = readAuthToken()
    if (!token) {
      setFavoritePlaceIds(new Set())
      setFavoriteRouteIds(new Set())
      return
    }

    try {
      const [favoritePlaces, favoriteRoutes] = await Promise.all([
        fetchFavoritePlaces(token),
        fetchFavoriteRoutes(token),
      ])
      setFavoritePlaceIds(new Set(favoritePlaces.map((item) => item.place_id)))
      setFavoriteRouteIds(new Set(favoriteRoutes.map((item) => item.route_id)))
    } catch {
      setNotice({ message: 'Не удалось загрузить избранное.' })
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoritePlaceIds(new Set())
      setFavoriteRouteIds(new Set())
      return
    }
    void loadFavorites()
  }, [isAuthenticated, loadFavorites])

  useEffect(() => {
    let mounted = true

    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [placesRes, routesRes, categoriesRes, tagsRes, configRes] = await Promise.all([
          axios.get<PlaceListItem[]>(`${API_URL}/places`),
          axios.get<RouteListItem[]>(`${API_URL}/routes`),
          axios.get<Category[]>(`${API_URL}/category`),
          axios.get<Tag[]>(`${API_URL}/tag`),
          axios.get<{ yandexMapsApiKey: string | null }>(`${API_URL}/config/public`),
        ])

        if (!mounted) return

        setPlaces(placesRes.data)
        setRoutes(routesRes.data)
        setCategories(categoriesRes.data)
        setTags(tagsRes.data)
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
    if (!readAuthToken()) {
      setNotice({
        message: 'Войдите в аккаунт, чтобы добавить место в избранное.',
        action: 'login',
      })
      return
    }

    try {
      setFavoritesLoading(placeId)
      setError(null)
      const isFavorite = favoritePlaceIds.has(placeId)
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${placeId}`, getAuthConfig())
        setFavoritePlaceIds((prev) => {
          const next = new Set(prev)
          next.delete(placeId)
          return next
        })
      } else {
        await axios.post(`${API_URL}/favorite/${placeId}`, null, getAuthConfig())
        setFavoritePlaceIds((prev) => new Set(prev).add(placeId))
      }
    } catch {
      setNotice({ message: 'Не удалось обновить избранное. Проверьте вход в аккаунт.' })
    } finally {
      setFavoritesLoading(null)
    }
  }

  const toggleRouteFavorite = async (routeId: number) => {
    if (!readAuthToken()) {
      setNotice({
        message: 'Войдите в аккаунт, чтобы добавить маршрут в избранное.',
        action: 'login',
      })
      return
    }

    try {
      setFavoriteRoutesLoading(routeId)
      setError(null)
      const isFavorite = favoriteRouteIds.has(routeId)
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorite-routes/${routeId}`, getAuthConfig())
        setFavoriteRouteIds((prev) => {
          const next = new Set(prev)
          next.delete(routeId)
          return next
        })
      } else {
        await axios.post(`${API_URL}/favorite-route/${routeId}`, null, getAuthConfig())
        setFavoriteRouteIds((prev) => new Set(prev).add(routeId))
      }
    } catch {
      setNotice({ message: 'Не удалось обновить избранное. Проверьте вход в аккаунт.' })
    } finally {
      setFavoriteRoutesLoading(null)
    }
  }

  const clearNotice = () => setNotice(null)

  const closeDetails = () => {
    if (placeDetails) {
      setPlaceDetails(null)
      return
    }
    setRouteDetails(null)
  }

  const fetchPlaces = async (filters: { search?: string; category?: number; tag?: number } = {}) => {
    try {
      const params: Record<string, string | number> = {}
      if (filters.search?.trim()) params.search = filters.search.trim()
      if (filters.category) params.category = filters.category
      if (filters.tag) params.tag = filters.tag
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
    notice,
    clearNotice,
    yandexApiKey,
    favoritePlaceIds,
    favoriteRouteIds,
    openPlaceDetails,
    openRouteDetails,
    togglePlaceFavorite,
    toggleRouteFavorite,
    closeDetails,
    categories,
    tags,
    fetchPlaces,
    searchRoutes,
    loadFavorites,
  }
}
