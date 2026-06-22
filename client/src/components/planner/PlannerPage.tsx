import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteSavedRoute,
  fetchSavedRoute,
  fetchSavedRoutes,
  savePlannerRoute,
} from '../../api/planner'
import { buildClientRoute } from '../../utils/buildClientRoute'
import { readAuthToken } from '../account/storage'
import { PlannerRouteMap } from '../maps/PlannerRouteMap'
import { PlannerSelectionMap } from '../maps/PlannerSelectionMap'
import { buildYandexMapsUrl } from './plannerUtils'
import { SaveRouteModal } from './SaveRouteModal'
import { SelectedPlacesList } from './SelectedPlacesList'
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
  onOpenPlaceDetails: (placeId: number) => void
  pendingSavedRouteId?: number | null
  onPendingSavedRouteHandled?: () => void
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
  onOpenPlaceDetails,
  pendingSavedRouteId = null,
  onPendingSavedRouteHandled,
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

  const clearPreview = useCallback(() => {
    setPreview(null)
    setPreviewTitle(null)
  }, [])

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

  useEffect(() => {
    if (!pendingSavedRouteId) return

    let active = true

    const openPendingRoute = async () => {
      const token = readAuthToken()
      if (!token) {
        onOpenLogin()
        onPendingSavedRouteHandled?.()
        return
      }

      setError(null)
      setSuccess(null)

      try {
        const route = await fetchSavedRoute(pendingSavedRouteId, token)
        if (!active) return
        setPreview(toPreview(route))
        setPreviewTitle(route.name)
        setShowSavedRoutes(false)
      } catch (openError) {
        if (!active) return
        setError(openError instanceof Error ? openError.message : 'Не удалось открыть маршрут.')
      } finally {
        if (active) onPendingSavedRouteHandled?.()
      }
    }

    void openPendingRoute()

    return () => {
      active = false
    }
  }, [pendingSavedRouteId, onOpenLogin, onPendingSavedRouteHandled])

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

  const togglePlace = useCallback(
    (placeId: number) => {
      clearPreview()
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
    },
    [clearPreview],
  )

  const reorderSelected = useCallback(
    (fromIndex: number, toIndex: number) => {
      clearPreview()
      setError(null)
      setSuccess(null)
      setSelectedIds((prev) => {
        const next = [...prev]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        return next
      })
    },
    [clearPreview],
  )

  const handleSourceChange = (nextSource: 'all' | 'favorites') => {
    if (nextSource === 'favorites' && !isAuthenticated) {
      onOpenLogin()
      return
    }

    setSource(nextSource)
    clearPreview()
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

    if (!yandexApiKey) {
      setError('Не настроен ключ Яндекс.Карт.')
      return
    }

    setBuilding(true)
    setError(null)
    setSuccess(null)
    clearPreview()

    try {
      const result = await buildClientRoute({
        apiKey: yandexApiKey,
        places,
        selectedIds,
        startPlaceId: startPlaceId ?? selectedIds[0],
      })
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
        mainPhoto: place.main_photo ?? '',
      })),
    [preview],
  )

  const yandexMapsUrl = useMemo(
    () =>
      preview
        ? buildYandexMapsUrl(
            preview.ordered_places.map((place) => ({
              latitude: Number(place.latitude),
              longitude: Number(place.longitude),
            })),
          )
        : null,
    [preview],
  )

  return (
    <section className="planner">
      <div className="planner__header">
        <div className="planner__header-row">
          <div>
            <h2>Планировщик маршрутов</h2>
            <p>
              Выберите места на карте или в списке, перетащите их для изменения порядка и постройте
              пеший маршрут. Можно выбрать до {MAX_PLACES} точек.
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

      <div className="planner__layout planner__layout--extended">
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

        <div className="planner__center">
          {!preview && yandexApiKey && availablePlaces.length > 0 && (
            <PlannerSelectionMap
              apiKey={yandexApiKey}
              places={availablePlaces}
              selectedIds={selectedIds}
              normalizeImageUrl={normalizeImageUrl}
              onTogglePlace={togglePlace}
            />
          )}

          {!preview && !yandexApiKey && (
            <div className="map map--big map--fallback">Не настроен ключ Яндекс.Карт</div>
          )}

          {preview && (
            <div className="planner__preview planner__preview--animate">
              {previewTitle && <h3 className="planner__preview-title">{previewTitle}</h3>}

              <div className="planner__stats">
                <span>{formatDistance(preview.distance_km)}</span>
                <span>{formatDuration(preview.duration_minutes)}</span>
                <span>{preview.ordered_places.length} точек</span>
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
                {yandexMapsUrl && (
                  <a
                    className="planner__external-link"
                    href={yandexMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть в Яндекс.Картах
                  </a>
                )}
              </div>

              {yandexApiKey ? (
                <PlannerRouteMap
                  apiKey={yandexApiKey}
                  geometry={preview.geometry}
                  points={mapPoints}
                  normalizeImageUrl={normalizeImageUrl}
                />
              ) : (
                <div className="map map--big map--fallback">Не настроен ключ Яндекс.Карт</div>
              )}

              <ol className="planner__route-list">
                {preview.ordered_places.map((place) => (
                  <li key={`${place.place_id}-${place.order_index}`}>
                    <button
                      type="button"
                      className="route-point route-point--clickable"
                      onClick={() => onOpenPlaceDetails(place.place_id)}
                    >
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
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <aside className="planner__sidebar">
          <h3>Выбрано: {selectedIds.length}</h3>

          {selectedPlaces.length === 0 && (
            <p className="planner__hint">Отметьте места в списке или на карте.</p>
          )}

          {selectedPlaces.length > 0 && (
            <>
              <p className="planner__hint">Перетащите строки, чтобы изменить порядок.</p>
              <SelectedPlacesList
                places={selectedPlaces}
                startPlaceId={startPlaceId}
                onStartChange={(placeId) => {
                  clearPreview()
                  setStartPlaceId(placeId)
                }}
                onRemove={togglePlace}
                onReorder={reorderSelected}
              />
            </>
          )}

          <button
            type="button"
            className="planner__build"
            disabled={building || selectedIds.length < 2}
            onClick={() => void handleBuild()}
          >
            {building ? 'Строим маршрут…' : preview ? 'Пересчитать маршрут' : 'Построить маршрут'}
          </button>

          {error && <p className="planner__error">{error}</p>}
          {success && <p className="planner__success">{success}</p>}
        </aside>
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
