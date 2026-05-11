import './App.css'
import { useMemo, useState, type SyntheticEvent } from 'react'
import { AccountModal } from './components/account/AccountModal'
import { DetailsModal } from './components/DetailsModal'
import { FiltersBar } from './components/FiltersBar'
import { Lightbox } from './components/Lightbox'
import { PlacesOverviewMap } from './components/maps/PlacesOverviewMap'
import { PlaceCard } from './components/PlaceCard'
import { RouteCard } from './components/RouteCard'
import { useTravelData } from './hooks/useTravelData'
import type { ViewerState } from './types'

const DEFAULT_ROUTE_COVER = 'http://localhost:5000/uploads/places/main/kremlin.png'
const STORAGE_KEY = 'travel-app-user'

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
  const [activeTab, setActiveTab] = useState<'places' | 'routes' | 'map' | 'planner'>('places')
  const [viewerState, setViewerState] = useState<ViewerState | null>(null)
  const [showFavoritePlacesOnly, setShowFavoritePlacesOnly] = useState(false)
  const [showFavoriteRoutesOnly, setShowFavoriteRoutesOnly] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as { name?: string; email?: string }
      if (parsed?.name && parsed?.email) {
        return { name: parsed.name, email: parsed.email }
      }
    } catch {
      // ignore broken local profile
    }
    return null
  })
  const {
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
  } = useTravelData()

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

  const visiblePlaces = useMemo(
    () => (showFavoritePlacesOnly ? places.filter((place) => favoritePlaceIds.has(place.id)) : places),
    [showFavoritePlacesOnly, places, favoritePlaceIds]
  )

  const visibleRoutes = useMemo(
    () => (showFavoriteRoutesOnly ? routes.filter((route) => favoriteRouteIds.has(route.id)) : routes),
    [showFavoriteRoutesOnly, routes, favoriteRouteIds]
  )

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__top">
          <p className="hero__eyebrow">Выбери свой путь знакомства с городом</p>
          <button
            className="profile-button"
            type="button"
            aria-label="Личный кабинет"
            title="Личный кабинет"
            onClick={() => setIsAccountOpen(true)}
          >
            <span className="profile-button__icon" aria-hidden>
              👤
            </span>
          </button>
        </div>
        <h1>Туристический гид по Нижнему Новгороду</h1>
        <p className="hero__description">
          Подборка мест и маршрутов по любым запросам
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
        <>
          <FiltersBar
            searchPlaceholder="Поиск достопримечательностей"
            searchLabel="Поиск достопримечательностей"
            categoryLabel="Фильтр по категории достопримечательностей"
            tagsLabel="Фильтр по тегам достопримечательностей"
            onSearchChange={searchPlaces}
            extraControl={
              <label className="favorite-switch" htmlFor="favorites-only-places">
                <span className="favorite-switch__label">Избранное</span>
                <input
                  id="favorites-only-places"
                  className="favorite-switch__input"
                  type="checkbox"
                  checked={showFavoritePlacesOnly}
                  onChange={(event) => setShowFavoritePlacesOnly(event.target.checked)}
                />
                <span className="favorite-switch__slider" aria-hidden />
              </label>
            }
          />
          {showFavoritePlacesOnly && visiblePlaces.length === 0 && (
            <div className="state">Пока нет избранных достопримечательностей.</div>
          )}
          <section className="grid">
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isFavorite={favoritePlaceIds.has(place.id)}
                isLoading={favoritesLoading === place.id}
                onToggleFavorite={togglePlaceFavorite}
                onOpenDetails={openPlaceDetails}
                normalizeImageUrl={normalizeImageUrl}
              />
            ))}
          </section>
        </>
      )}

      {!loading && !error && activeTab === 'routes' && (
        <>
          <FiltersBar
            searchPlaceholder="Поиск маршрутов"
            searchLabel="Поиск маршрутов"
            categoryLabel="Фильтр по категории маршрутов"
            tagsLabel="Фильтр по тегам маршрутов"
            onSearchChange={searchRoutes}
            extraControl={
              <label className="favorite-switch" htmlFor="favorites-only-routes">
                <span className="favorite-switch__label">Избранное</span>
                <input
                  id="favorites-only-routes"
                  className="favorite-switch__input"
                  type="checkbox"
                  checked={showFavoriteRoutesOnly}
                  onChange={(event) => setShowFavoriteRoutesOnly(event.target.checked)}
                />
                <span className="favorite-switch__slider" aria-hidden />
              </label>
            }
          />
          {showFavoriteRoutesOnly && visibleRoutes.length === 0 && (
            <div className="state">Пока нет избранных маршрутов.</div>
          )}
          <section className="grid">
            {visibleRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isFavorite={favoriteRouteIds.has(route.id)}
                isLoading={favoriteRoutesLoading === route.id}
                onToggleFavorite={toggleRouteFavorite}
                onOpenDetails={openRouteDetails}
                normalizeImageUrl={normalizeImageUrl}
                formatDuration={formatDuration}
                formatDistance={formatDistance}
                onImageError={handleImageFallback}
              />
            ))}
          </section>
        </>
      )}

      {!loading && !error && activeTab === 'map' && (
        <section className="map-page">
          <div className="map-page__header">
            <h2>Карта всех достопримечательностей</h2>
            <p>На карте отображены все точки из базы данных. Нажми на маркер, чтобы увидеть название и адрес.</p>
          </div>
          {yandexApiKey ? (
            <PlacesOverviewMap
              apiKey={yandexApiKey}
              places={places}
              normalizeImageUrl={normalizeImageUrl}
              onOpenDetails={openPlaceDetails}
            />
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
        <DetailsModal
          placeDetails={placeDetails}
          routeDetails={routeDetails}
          detailsLoading={detailsLoading}
          yandexApiKey={yandexApiKey}
          placePhotos={placePhotos}
          routePhotos={routePhotos}
          normalizeImageUrl={normalizeImageUrl}
          formatDuration={formatDuration}
          formatDistance={formatDistance}
          onImageError={handleImageFallback}
          onOpenViewer={openViewer}
          onClose={closeDetails}
        />
      )}

      {viewerState && (
        <Lightbox
          viewerState={viewerState}
          onImageError={handleImageFallback}
          onClose={() => setViewerState(null)}
          onPrev={() =>
            setViewerState((prev) =>
              prev
                ? { ...prev, index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1 }
                : prev
            )
          }
          onNext={() =>
            setViewerState((prev) =>
              prev
                ? { ...prev, index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1 }
                : prev
            )
          }
        />
      )}

      {isAccountOpen && (
        <AccountModal
          user={currentUser}
          onClose={() => setIsAccountOpen(false)}
          onAuthSuccess={(user) => setCurrentUser(user)}
          onLogout={() => setCurrentUser(null)}
          onUpdateProfile={(user) => setCurrentUser(user)}
        />
      )}
    </div>
  )
}

export default App
