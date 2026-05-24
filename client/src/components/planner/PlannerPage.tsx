import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildPlannerRoute,
  deleteSavedRoute,
  fetchSavedRoute,
  fetchSavedRoutes,
  savePlannerRoute,
} from '../../api/planner'
import { readAuthToken } from '../account/storage'
import { PlannerRouteMap } from '../maps/PlannerRouteMap'
import { SaveRouteModal } from './SaveRouteModal'
import type { PlaceListItem, PlannerBuildResponse, SavedRouteListItem } from '../../types'

const MAX_PLACES = 25

const toPreview = (route: PlannerBuildResponse): PlannerBuildResponse => ({
  ordered_places: route.ordered_places,
  distance_km: route.distance_km,
  duration_minutes: route.duration_minutes,
  geometry: route.geometry,
  optimized: route.optimized,
  start_place_id: route.start_place_id,
})

const defaultRouteName = () => {
  const date = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
  return `Моя прогулка — ${date}`
}

type PlannerPageProps = {
  places: PlaceListItem[]
  favoritePlaceIds: Set<number>
  yandexApiKey: string | null
  isAuthenticated: boolean
  normalizeImageUrl: (value: string) => string
  formatDuration: (minutes: number | string) => string
  formatDistance: (distance: number | string) => string
  onOpenLogin: () => void
}

export const PlannerPage = ({
  places,
  favoritePlaceIds,
  yandexApiKey,
  isAuthenticated,
  normalizeImageUrl,
  formatDuration,
  formatDistance,
  onOpenLogin,
}: PlannerPageProps) => {
  const [source, setSource] = useState<'all' | 'favorites'>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [startPlaceId, setStartPlaceId] = useState<number | null>(null)
  const [preview, setPreview] = useState<PlannerBuildResponse | null>(null)
  const [previewTitle, setPreviewTitle] = useState<string | null>(null)
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [showSavedRoutes, setShowSavedRoutes] = useState(false)
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteListItem[]>([])
  const [savedRoutesLoading, setSavedRoutesLoading] = useState(false)
  const [savedRouteActionId, setSavedRouteActionId] = useState<number | null>(null)

  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadSavedRoutes = useCallback(async () => {
    const token = readAuthToken()
    if (!token) return

    setSavedRoutesLoading(true)
    try {
      const routes = await fetchSavedRoutes(token)
      setSavedRoutes(routes)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить маршруты.')
    } finally {
      setSavedRoutesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !showSavedRoutes) return
    void loadSavedRoutes()
  }, [isAuthenticated, showSavedRoutes, loadSavedRoutes])

  const availablePlaces = useMemo(() => {
    const list =
      source === 'favorites'
        ? places.filter((place) => favoritePlaceIds.has(place.id))
        : places

    const query = search.trim().toLowerCase()
    if (!query) return list

    return list.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query),
    )
  }, [places, favoritePlaceIds, source, search])

  const selectedPlaces = useMemo(
    () =>
      selectedIds
        .map((id) => places.find((place) => place.id === id))
        .filter((place): place is PlaceListItem => Boolean(place)),
    [selectedIds, places],
  )

  const togglePlace = useCallback((placeId: number) => {
    setPreview(null)
    setPreviewTitle(null)
    setError(null)
    setSuccess(null)

    setSelectedIds((prev) => {
      if (prev.includes(placeId)) {
        const next = prev.filter((id) => id !== placeId)
        setStartPlaceId((current) => (current === placeId ? next[0] ?? null : current))
        return next
      }

      if (prev.length >= MAX_PLACES) {
        setError(`Можно выбрать не больше ${MAX_PLACES} мест.`)
        return prev
      }

      const next = [...prev, placeId]
      setStartPlaceId((current) => current ?? placeId)
      return next
    })
  }, [])

  const handleSourceChange = (nextSource: 'all' | 'favorites') => {
    if (nextSource === 'favorites' && !isAuthenticated) {
      onOpenLogin()
      return
    }

    setSource(nextSource)
    setPreview(null)
    setPreviewTitle(null)
    setError(null)
    setSuccess(null)
    setSelectedIds([])
    setStartPlaceId(null)
  }

  const handleBuild = async () => {
    if (selectedIds.length < 2) {
      setError('Выберите минимум две достопримечательности.')
      return
    }

    setBuilding(true)
    setError(null)
    setSuccess(null)
    setPreview(null)
    setPreviewTitle(null)

    try {
      const token = readAuthToken()
      const result = await buildPlannerRoute(
        {
          placeIds: selectedIds,
          startPlaceId: startPlaceId ?? selectedIds[0],
          optimize: true,
          source,
        },
        token,
      )
      setPreview(result)
    } catch (buildError) {
      setError(buildError instanceof Error ? buildError.message : 'Не удалось построить маршрут.')
    } finally {
      setBuilding(false)
    }
  }

  const handleOpenSavedRoutes = () => {
    if (!isAuthenticated) {
      onOpenLogin()
      return
    }
    setShowSavedRoutes((current) => !current)
  }

  const handleOpenSavedRoute = async (routeId: number) => {
    const token = readAuthToken()
    if (!token) {
      onOpenLogin()
      return
    }

    setSavedRouteActionId(routeId)
    setError(null)
    setSuccess(null)

    try {
      const route = await fetchSavedRoute(routeId, token)
      setPreview(toPreview(route))
      setPreviewTitle(route.name)
      setShowSavedRoutes(false)
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'Не удалось открыть маршрут.')
    } finally {
      setSavedRouteActionId(null)
    }
  }

  const handleDeleteSavedRoute = async (routeId: number) => {
    const token = readAuthToken()
    if (!token) return

    setSavedRouteActionId(routeId)
    setError(null)

    try {
      await deleteSavedRoute(routeId, token)
      setSavedRoutes((current) => current.filter((route) => route.id !== routeId))
      setSuccess('Маршрут удалён.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Не удалось удалить маршрут.')
    } finally {
      setSavedRouteActionId(null)
    }
  }

  const handleSaveRoute = async (name: string) => {
    if (!preview) return

    const token = readAuthToken()
    if (!token) {
      onOpenLogin()
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      const saved = await savePlannerRoute({ name, preview }, token)
      setSaveModalOpen(false)
      setPreviewTitle(saved.name)
      setSuccess('Маршрут сохранён.')
      if (showSavedRoutes) {
        await loadSavedRoutes()
      }
    } catch (saveRouteError) {
      setSaveError(
        saveRouteError instanceof Error ? saveRouteError.message : 'Не удалось сохранить маршрут.',
      )
    } finally {
      setSaving(false)
    }
  }

  const mapPoints = useMemo(
    () =>
      (preview?.ordered_places ?? []).map((place) => ({
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        orderIndex: place.order_index,
        name: place.name,
      })),
    [preview],
  )

  return (
    <section className="planner">
      <div className="planner__header">
        <div className="planner__header-row">
          <div>
            <h2>Планировщик маршрутов</h2>
            <p>
              Выберите места, укажите стартовую точку и постройте пеший маршрут по дорогам.
              Можно выбрать до {MAX_PLACES} точек.
            </p>
          </div>
          <button type="button" className="planner__my-routes" onClick={handleOpenSavedRoutes}>
            {showSavedRoutes ? 'Скрыть мои маршруты' : 'Мои маршруты'}
          </button>
        </div>
      </div>

      {showSavedRoutes && (
        <section className="planner-saved">
          <h3>Сохранённые маршруты</h3>
          {savedRoutesLoading && <p className="planner__hint">Загрузка…</p>}
          {!savedRoutesLoading && savedRoutes.length === 0 && (
            <p className="planner__hint">Пока нет сохранённых маршрутов.</p>
          )}
          <ul className="planner-saved__list">
            {savedRoutes.map((route) => (
              <li key={route.id} className="planner-saved__item">
                {route.main_photo && (
                  <img
                    src={normalizeImageUrl(route.main_photo)}
                    alt=""
                    className="planner-saved__photo"
                  />
                )}
                <div className="planner-saved__info">
                  <p className="planner-saved__name">{route.name}</p>
                  <p className="planner-saved__meta">
                    {formatDistance(route.distance_km)} · {formatDuration(route.duration_minutes)} ·{' '}
                    {route.places_count} точек
                  </p>
                </div>
                <div className="planner-saved__actions">
                  <button
                    type="button"
                    className="planner-saved__open"
                    disabled={savedRouteActionId === route.id}
                    onClick={() => void handleOpenSavedRoute(route.id)}
                  >
                    Открыть
                  </button>
                  <button
                    type="button"
                    className="planner-saved__delete"
                    disabled={savedRouteActionId === route.id}
                    onClick={() => void handleDeleteSavedRoute(route.id)}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="planner__source">
        <button
          type="button"
          className={`planner__source-btn ${source === 'all' ? 'planner__source-btn--active' : ''}`}
          onClick={() => handleSourceChange('all')}
        >
          Все места
        </button>
        <button
          type="button"
          className={`planner__source-btn ${source === 'favorites' ? 'planner__source-btn--active' : ''}`}
          onClick={() => handleSourceChange('favorites')}
          title={!isAuthenticated ? 'Нужен вход в аккаунт' : undefined}
        >
          Из избранного
        </button>
      </div>

      <div className="planner__layout">
        <aside className="planner__panel">
          <input
            className="filters__control"
            type="search"
            placeholder="Поиск по названию или адресу"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {source === 'favorites' && availablePlaces.length === 0 && (
            <p className="planner__hint">
              В избранном пока нет мест. Добавьте их на вкладке «Достопримечательности».
            </p>
          )}

          <ul className="planner__places">
            {availablePlaces.map((place) => {
              const checked = selectedIds.includes(place.id)
              return (
                <li key={place.id}>
                  <label className={`planner__place ${checked ? 'planner__place--selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlace(place.id)}
                    />
                    <img
                      src={normalizeImageUrl(place.main_photo)}
                      alt=""
                      className="planner__place-photo"
                    />
                    <span className="planner__place-text">
                      <span className="planner__place-name">{place.name}</span>
                      <span className="planner__place-address">{place.address}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="planner__main">
          <div className="planner__sidebar">
            <h3>Выбрано: {selectedIds.length}</h3>

            {selectedPlaces.length === 0 && (
              <p className="planner__hint">Отметьте места в списке слева.</p>
            )}

            {selectedPlaces.length > 0 && (
              <ul className="planner__selected">
                {selectedPlaces.map((place) => (
                  <li key={place.id} className="planner__selected-item">
                    <label className="planner__start">
                      <input
                        type="radio"
                        name="planner-start"
                        checked={startPlaceId === place.id}
                        onChange={() => setStartPlaceId(place.id)}
                      />
                      <span>Старт</span>
                    </label>
                    <span className="planner__selected-name">{place.name}</span>
                    <button
                      type="button"
                      className="planner__remove"
                      onClick={() => togglePlace(place.id)}
                      aria-label={`Убрать ${place.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="planner__build"
              disabled={building || selectedIds.length < 2}
              onClick={() => void handleBuild()}
            >
              {building ? 'Строим маршрут…' : 'Построить маршрут'}
            </button>

            {error && <p className="planner__error">{error}</p>}
            {success && <p className="planner__success">{success}</p>}
          </div>

          {preview && (
            <div className="planner__preview">
              {previewTitle && <h3 className="planner__preview-title">{previewTitle}</h3>}

              <div className="planner__stats">
                <span>{formatDistance(preview.distance_km)}</span>
                <span>{formatDuration(preview.duration_minutes)}</span>
                <span>{preview.ordered_places.length} точек</span>
                {!preview.optimized && (
                  <span className="planner__stats-note">Порядок как вы выбрали</span>
                )}
              </div>

              <div className="planner__preview-actions">
                <button
                  type="button"
                  className="planner__save"
                  onClick={() => {
                    if (!isAuthenticated) {
                      onOpenLogin()
                      return
                    }
                    setSaveError(null)
                    setSaveModalOpen(true)
                  }}
                >
                  Сохранить маршрут
                </button>
              </div>

              <ol className="planner__route-list">
                {preview.ordered_places.map((place) => (
                  <li key={`${place.place_id}-${place.order_index}`} className="route-point">
                    <span className="route-point__index">{place.order_index}</span>
                    <div>
                      <p className="route-point__title">{place.name}</p>
                      {place.leg_distance_km != null && place.leg_duration_minutes != null && (
                        <p className="route-point__address">
                          {formatDistance(place.leg_distance_km)} ·{' '}
                          {formatDuration(place.leg_duration_minutes)} от предыдущей точки
                        </p>
                      )}
                      {place.leg_distance_km == null && (
                        <p className="route-point__address">{place.address}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {yandexApiKey ? (
                <PlannerRouteMap
                  apiKey={yandexApiKey}
                  geometry={preview.geometry}
                  points={mapPoints}
                />
              ) : (
                <div className="map map--big map--fallback">Не настроен ключ Яндекс.Карт</div>
              )}
            </div>
          )}
        </div>
      </div>

      {saveModalOpen && preview && (
        <SaveRouteModal
          defaultName={defaultRouteName()}
          saving={saving}
          error={saveError}
          onClose={() => setSaveModalOpen(false)}
          onSave={(name) => void handleSaveRoute(name)}
        />
      )}
    </section>
  )
}
