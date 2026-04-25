import './App.css'
import { useEffect, useState, type SyntheticEvent } from 'react'
import axios from 'axios'
import { CircleMarker, MapContainer, Polyline, TileLayer } from 'react-leaflet'

type Category = {
  id: number
  name: string
}

type PlaceListItem = {
  id: number
  name: string
  main_photo: string
  category: Category | null
}

type PlaceDetails = {
  id: number
  name: string
  description: string
  address: string
  latitude: number | string
  longitude: number | string
  main_photo: string
  category: Category | null
  photos: { id: number; photo: string; order: number }[]
  tags: { id: number; name: string }[]
}

type RouteListItem = {
  id: number
  name: string
  description: string
  duration_minutes: number | string
  distance_km: number | string
  main_photo: string
}

type RouteDetails = {
  id: number
  name: string
  description: string
  duration_minutes: number | string
  distance_km: number | string
  main_photo: string
  points: {
    order_index: number
    place: {
      id: number
      name: string
      address: string
      latitude: number | string
      longitude: number | string
      main_photo: string
    } | null
  }[]
}

const API_URL = 'http://localhost:5000/api'
const DEFAULT_ROUTE_COVER = 'http://localhost:5000/uploads/places/main/kremlin.png'

const normalizeImageUrl = (value: string) => {
  if (!value) return value
  if (value.startsWith('http')) return value
  return `http://localhost:5000${value}`
}

const formatDuration = (minutes: number | string) => `${Number(minutes)} мин`
const formatDistance = (distance: number | string) => `${Number(distance)} км`
const handleImageFallback = (event: SyntheticEvent<HTMLImageElement, Event>) => {
  event.currentTarget.src = DEFAULT_ROUTE_COVER
}

function App() {
  const [activeTab, setActiveTab] = useState<'places' | 'routes'>('places')
  const [places, setPlaces] = useState<PlaceListItem[]>([])
  const [routes, setRoutes] = useState<RouteListItem[]>([])
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState<number | null>(null)
  const [favoriteRoutesLoading, setFavoriteRoutesLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
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

        if (!mounted) return

        setPlaces(placesRes.data)
        setRoutes(routesRes.data)
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

  return (
    <div className="app">
      <header className="hero">
        <p className="hero__eyebrow">Городские маршруты и точки интереса</p>
        <h1>Туристический гид по Нижнему Новгороду</h1>
        <p className="hero__description">
          Современный гид с красивыми карточками, маршрутами и подробными описаниями мест.
        </p>
      </header>

      <section className="tabs">
        <button
          className={`tab ${activeTab === 'places' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('places')}
        >
          Достопримечательности
        </button>
        <button
          className={`tab ${activeTab === 'routes' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          Маршруты
        </button>
      </section>

      {loading && (
        <section className="grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <article className="card card--skeleton" key={`skeleton-${index}`}>
              <div className="skeleton skeleton__image" />
              <div className="card__body">
                <div className="skeleton skeleton__line skeleton__line--short" />
                <div className="skeleton skeleton__line" />
                <div className="skeleton skeleton__line skeleton__line--button" />
              </div>
            </article>
          ))}
        </section>
      )}
      {error && <div className="state state--error">{error}</div>}

      {!loading && !error && activeTab === 'places' && (
        <section className="grid">
          {places.map((place) => (
            <article className="card" key={place.id}>
              <img src={normalizeImageUrl(place.main_photo)} alt={place.name} className="card__image" />
              <div className="card__body">
                <p className="card__meta">{place.category?.name ?? 'Без категории'}</p>
                <h3>{place.name}</h3>
                <div className="card__actions">
                  <button className="card__button" onClick={() => openPlaceDetails(place.id)}>
                    Подробнее
                  </button>
                  <button
                    className={`like-button ${favoritePlaceIds.has(place.id) ? 'like-button--active' : ''}`}
                    onClick={() => togglePlaceFavorite(place.id)}
                    disabled={favoritesLoading === place.id}
                  >
                    {favoritePlaceIds.has(place.id) ? 'В избранном' : 'В избранное'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !error && activeTab === 'routes' && (
        <section className="grid">
          {routes.map((route) => (
            <article className="card" key={route.id}>
              <img
                src={normalizeImageUrl(route.main_photo)}
                alt={route.name}
                className="card__image"
                onError={handleImageFallback}
              />
              <div className="card__body">
                <p className="card__meta">
                  {formatDuration(route.duration_minutes)} • {formatDistance(route.distance_km)}
                </p>
                <h3>{route.name}</h3>
                <p className="card__text">{route.description}</p>
                <div className="card__actions">
                  <button className="card__button" onClick={() => openRouteDetails(route.id)}>
                    Открыть маршрут
                  </button>
                  <button
                    className={`like-button ${favoriteRouteIds.has(route.id) ? 'like-button--active' : ''}`}
                    onClick={() => toggleRouteFavorite(route.id)}
                    disabled={favoriteRoutesLoading === route.id}
                  >
                    {favoriteRouteIds.has(route.id) ? 'В избранном' : 'В избранное'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {(placeDetails || routeDetails) && (
        <div className="modal" onClick={() => (placeDetails ? setPlaceDetails(null) : setRouteDetails(null))}>
          <div className="modal__content" onClick={(event) => event.stopPropagation()}>
            <button className="modal__close" onClick={() => (placeDetails ? setPlaceDetails(null) : setRouteDetails(null))}>
              ×
            </button>

            {detailsLoading && <p>Загрузка деталей...</p>}

            {!detailsLoading && placeDetails && (
              <>
                <img
                  src={normalizeImageUrl(placeDetails.main_photo)}
                  alt={placeDetails.name}
                  className="modal__image"
                />
                <h2>{placeDetails.name}</h2>
                <p className="modal__meta">{placeDetails.category?.name ?? 'Без категории'}</p>
                <p>{placeDetails.description}</p>
                <p>
                  <strong>Адрес:</strong> {placeDetails.address}
                </p>
                <p>
                  <strong>Координаты:</strong> {placeDetails.latitude}, {placeDetails.longitude}
                </p>
                <div className="map-wrap">
                  <MapContainer
                    center={[Number(placeDetails.latitude), Number(placeDetails.longitude)]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="map"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[Number(placeDetails.latitude), Number(placeDetails.longitude)]}
                      radius={8}
                      pathOptions={{ color: '#2f6dff', fillColor: '#77a2ff', fillOpacity: 0.9 }}
                    />
                  </MapContainer>
                </div>
                <div className="tags">
                  {placeDetails.tags.map((tag) => (
                    <span key={tag.id} className="tag">
                      {tag.name}
                    </span>
                  ))}
                </div>
                {!!placeDetails.photos.length && (
                  <div className="gallery">
                    {placeDetails.photos.map((photo) => (
                      <img key={photo.id} src={normalizeImageUrl(photo.photo)} alt={placeDetails.name} />
                    ))}
                  </div>
                )}
              </>
            )}

            {!detailsLoading && routeDetails && (
              <>
                <img
                  src={normalizeImageUrl(routeDetails.main_photo)}
                  alt={routeDetails.name}
                  className="modal__image"
                  onError={handleImageFallback}
                />
                <h2>{routeDetails.name}</h2>
                <p className="modal__meta">
                  {formatDuration(routeDetails.duration_minutes)} • {formatDistance(routeDetails.distance_km)}
                </p>
                <p>{routeDetails.description}</p>
                {!!routeDetails.points.length && (
                  <div className="map-wrap">
                    <MapContainer
                      center={[
                        Number(routeDetails.points[0].place?.latitude ?? 56.3269),
                        Number(routeDetails.points[0].place?.longitude ?? 44.0059),
                      ]}
                      zoom={13}
                      scrollWheelZoom={false}
                      className="map"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Polyline
                        positions={routeDetails.points
                          .filter((point) => point.place)
                          .map((point) => [Number(point.place!.latitude), Number(point.place!.longitude)])}
                        pathOptions={{ color: '#2f6dff', weight: 4 }}
                      />
                      {routeDetails.points
                        .filter((point) => point.place)
                        .map((point) => (
                          <CircleMarker
                            key={`route-point-map-${point.order_index}`}
                            center={[Number(point.place!.latitude), Number(point.place!.longitude)]}
                            radius={7}
                            pathOptions={{ color: '#1d4bb4', fillColor: '#7ea6ff', fillOpacity: 0.9 }}
                          />
                        ))}
                    </MapContainer>
                  </div>
                )}

                <h3>Точки маршрута</h3>
                <div className="route-points">
                  {routeDetails.points.map((point) => (
                    <div className="route-point" key={`${routeDetails.id}-${point.order_index}`}>
                      <span className="route-point__index">{point.order_index}</span>
                      <div>
                        <p className="route-point__title">{point.place?.name ?? 'Точка недоступна'}</p>
                        {point.place && <p className="route-point__address">{point.place.address}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <h3>Фото по маршруту</h3>
                <div className="gallery">
                  {routeDetails.points
                    .filter((point) => point.place?.main_photo)
                    .map((point) => (
                      <img
                        key={`route-photo-${routeDetails.id}-${point.order_index}`}
                        src={normalizeImageUrl(point.place!.main_photo)}
                        alt={point.place!.name}
                        onError={handleImageFallback}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
