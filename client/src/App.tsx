import './App.css'
import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react'
import axios from 'axios'

type Category = {
  id: number
  name: string
}

type PlaceListItem = {
  id: number
  name: string
  address: string
  latitude: number | string
  longitude: number | string
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
const YMAPS_SCRIPT_ID = 'yandex-maps-script'

declare global {
  interface Window {
    ymaps?: any
  }
}

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

const loadYandexMaps = (apiKey: string) =>
  new Promise<void>((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve())
      return
    }

    const existingScript = document.getElementById(YMAPS_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.ymaps?.ready(() => resolve())
      })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Yandex Maps')))
      return
    }

    const script = document.createElement('script')
    script.id = YMAPS_SCRIPT_ID
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    script.async = true
    script.onload = () => window.ymaps?.ready(() => resolve())
    script.onerror = () => reject(new Error('Failed to load Yandex Maps'))
    document.head.appendChild(script)
  })

type PlaceMiniMapProps = {
  apiKey: string
  latitude: number
  longitude: number
}

const PlaceMiniMap = ({ apiKey, latitude, longitude }: PlaceMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    let active = true

    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps) return

        mapInstanceRef.current?.destroy()
        mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          controls: ['zoomControl'],
        })
        const marker = new window.ymaps.Placemark([latitude, longitude], {}, {
          preset: 'islands#blueCircleDotIcon',
        })
        mapInstanceRef.current.geoObjects.add(marker)
      } catch {
        // no-op, graceful fallback below
      }
    }

    initMap()
    return () => {
      active = false
      mapInstanceRef.current?.destroy()
      mapInstanceRef.current = null
    }
  }, [apiKey, latitude, longitude])

  return <div ref={mapRef} className="map" />
}

type RouteMiniMapProps = {
  apiKey: string
  points: Array<{ latitude: number; longitude: number }>
}

const RouteMiniMap = ({ apiKey, points }: RouteMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    let active = true
    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps || points.length === 0) return

        mapInstanceRef.current?.destroy()
        const center = points[0]
        mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
          center: [center.latitude, center.longitude],
          zoom: 13,
          controls: ['zoomControl'],
        })

        const routeLine = new window.ymaps.Polyline(
          points.map((point) => [point.latitude, point.longitude]),
          {},
          { strokeColor: '#2f6dff', strokeWidth: 4, strokeOpacity: 0.9 }
        )

        mapInstanceRef.current.geoObjects.add(routeLine)
        points.forEach((point, index) => {
          const marker = new window.ymaps.Placemark(
            [point.latitude, point.longitude],
            { iconCaption: `${index + 1}` },
            { preset: 'islands#blueCircleDotIcon' }
          )
          mapInstanceRef.current.geoObjects.add(marker)
        })

        mapInstanceRef.current.setBounds(routeLine.geometry.getBounds(), {
          checkZoomRange: true,
          zoomMargin: 20,
        })
      } catch {
        // no-op, graceful fallback below
      }
    }

    initMap()
    return () => {
      active = false
      mapInstanceRef.current?.destroy()
      mapInstanceRef.current = null
    }
  }, [apiKey, points])

  return <div ref={mapRef} className="map" />
}

type PlacesOverviewMapProps = {
  apiKey: string
  places: PlaceListItem[]
}

const PlacesOverviewMap = ({ apiKey, places }: PlacesOverviewMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    let active = true
    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps || places.length === 0) return

        mapInstanceRef.current?.destroy()
        mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
          center: [56.3269, 44.0059],
          zoom: 12,
          controls: ['zoomControl'],
        })

        const bounds: number[][] = []
        places.forEach((place) => {
          const latitude = Number(place.latitude)
          const longitude = Number(place.longitude)
          if (Number.isNaN(latitude) || Number.isNaN(longitude)) return
          bounds.push([latitude, longitude])

          const marker = new window.ymaps.Placemark(
            [latitude, longitude],
            {
              hintContent: place.name,
              balloonContentHeader: place.name,
              balloonContentBody: place.address,
            },
            { preset: 'islands#blueIcon' }
          )
          mapInstanceRef.current.geoObjects.add(marker)
        })

        if (bounds.length > 1) {
          mapInstanceRef.current.setBounds(bounds, {
            checkZoomRange: true,
            zoomMargin: 30,
          })
        } else if (bounds.length === 1) {
          mapInstanceRef.current.setCenter(bounds[0], 14)
        }
      } catch {
        // no-op
      }
    }

    initMap()
    return () => {
      active = false
      mapInstanceRef.current?.destroy()
      mapInstanceRef.current = null
    }
  }, [apiKey, places])

  return <div className="map map--big" ref={mapRef} />
}

function App() {
  const [activeTab, setActiveTab] = useState<'places' | 'routes' | 'map' | 'planner'>('places')
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
  const [viewerState, setViewerState] = useState<{
    images: { src: string; alt: string }[]
    index: number
    title: string
  } | null>(null)

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

  const openViewer = (images: { src: string; alt: string }[], startIndex: number, title: string) => {
    if (!images.length) return
    setViewerState({ images, index: startIndex, title })
  }

  const routePhotos = useMemo(() => {
    if (!routeDetails) return []
    return routeDetails.points
      .filter((point) => point.place?.main_photo)
      .map((point) => ({
        src: normalizeImageUrl(point.place!.main_photo),
        alt: point.place!.name,
      }))
  }, [routeDetails])

  const placePhotos = useMemo(() => {
    if (!placeDetails) return []
    return [
      { src: normalizeImageUrl(placeDetails.main_photo), alt: placeDetails.name },
      ...placeDetails.photos.map((photo) => ({
        src: normalizeImageUrl(photo.photo),
        alt: placeDetails.name,
      })),
    ]
  }, [placeDetails])

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__top">
          <p className="hero__eyebrow">Городские маршруты и точки интереса</p>
          <button className="profile-button" type="button" aria-label="Личный кабинет" title="Личный кабинет">
            <span className="profile-button__icon" aria-hidden>
              👤
            </span>
          </button>
        </div>
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
        <button className={`tab ${activeTab === 'map' ? 'tab--active' : ''}`} onClick={() => setActiveTab('map')}>
          Карта
        </button>
        <button
          className={`tab ${activeTab === 'planner' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          Планировщик маршрутов
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
              <button
                className={`card__favorite ${favoritePlaceIds.has(place.id) ? 'card__favorite--active' : ''}`}
                onClick={() => togglePlaceFavorite(place.id)}
                disabled={favoritesLoading === place.id}
                aria-label={favoritePlaceIds.has(place.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                title={favoritePlaceIds.has(place.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                {favoritePlaceIds.has(place.id) ? '♥' : '♡'}
              </button>
              <img src={normalizeImageUrl(place.main_photo)} alt={place.name} className="card__image" />
              <div className="card__body">
                <p className="card__meta">{place.category?.name ?? 'Без категории'}</p>
                <h3>{place.name}</h3>
                <div className="card__actions">
                  <button className="card__button" onClick={() => openPlaceDetails(place.id)}>
                    Подробнее
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
              <button
                className={`card__favorite ${favoriteRouteIds.has(route.id) ? 'card__favorite--active' : ''}`}
                onClick={() => toggleRouteFavorite(route.id)}
                disabled={favoriteRoutesLoading === route.id}
                aria-label={favoriteRouteIds.has(route.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                title={favoriteRouteIds.has(route.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                {favoriteRouteIds.has(route.id) ? '♥' : '♡'}
              </button>
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
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !error && activeTab === 'map' && (
        <section className="map-page">
          <div className="map-page__header">
            <h2>Карта всех достопримечательностей</h2>
            <p>На карте отображены все точки из базы данных. Нажми на маркер, чтобы увидеть название и адрес.</p>
          </div>
          {yandexApiKey ? (
            <PlacesOverviewMap apiKey={yandexApiKey} places={places} />
          ) : (
            <div className="map map--big map--fallback">Не настроен ключ Яндекс.Карт</div>
          )}
        </section>
      )}

      {!loading && !error && activeTab === 'planner' && (
        <section className="state">
          Планировщик маршрутов скоро появится. Сейчас раздел в разработке и ожидает бэкенд.
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
                  onClick={() => openViewer(placePhotos, 0, placeDetails.name)}
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
                  {yandexApiKey ? (
                    <PlaceMiniMap
                      apiKey={yandexApiKey}
                      latitude={Number(placeDetails.latitude)}
                      longitude={Number(placeDetails.longitude)}
                    />
                  ) : (
                    <div className="map map--fallback">Не настроен ключ Яндекс.Карт</div>
                  )}
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
                    {placeDetails.photos.map((photo, idx) => (
                      <img
                        key={photo.id}
                        src={normalizeImageUrl(photo.photo)}
                        alt={placeDetails.name}
                        onClick={() => openViewer(placePhotos, idx + 1, placeDetails.name)}
                      />
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
                  onClick={() =>
                    openViewer(
                      [{ src: normalizeImageUrl(routeDetails.main_photo), alt: routeDetails.name }, ...routePhotos],
                      0,
                      routeDetails.name
                    )
                  }
                />
                <h2>{routeDetails.name}</h2>
                <p className="modal__meta">
                  {formatDuration(routeDetails.duration_minutes)} • {formatDistance(routeDetails.distance_km)}
                </p>
                <p>{routeDetails.description}</p>
                {!!routeDetails.points.length && (
                  <div className="map-wrap">
                    {yandexApiKey ? (
                      <RouteMiniMap
                        apiKey={yandexApiKey}
                        points={routeDetails.points
                          .filter((point) => point.place)
                          .map((point) => ({
                            latitude: Number(point.place!.latitude),
                            longitude: Number(point.place!.longitude),
                          }))}
                      />
                    ) : (
                      <div className="map map--fallback">Не настроен ключ Яндекс.Карт</div>
                    )}
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
                  {routePhotos.map((photo, index) => (
                      <img
                        key={`route-photo-${routeDetails.id}-${index}`}
                        src={photo.src}
                        alt={photo.alt}
                        onError={handleImageFallback}
                        onClick={() =>
                          openViewer(
                            [{ src: normalizeImageUrl(routeDetails.main_photo), alt: routeDetails.name }, ...routePhotos],
                            index + 1,
                            routeDetails.name
                          )
                        }
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {viewerState && (
        <div className="lightbox" onClick={() => setViewerState(null)}>
          <div className="lightbox__content" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox__close" onClick={() => setViewerState(null)}>
              ×
            </button>
            <button
              className="lightbox__nav lightbox__nav--prev"
              onClick={() =>
                setViewerState((prev) =>
                  prev
                    ? { ...prev, index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1 }
                    : prev
                )
              }
            >
              ‹
            </button>
            <img
              className="lightbox__image"
              src={viewerState.images[viewerState.index].src}
              alt={viewerState.images[viewerState.index].alt}
              onError={handleImageFallback}
            />
            <button
              className="lightbox__nav lightbox__nav--next"
              onClick={() =>
                setViewerState((prev) =>
                  prev
                    ? { ...prev, index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1 }
                    : prev
                )
              }
            >
              ›
            </button>
            <p className="lightbox__caption">
              {viewerState.title} — {viewerState.index + 1} / {viewerState.images.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
