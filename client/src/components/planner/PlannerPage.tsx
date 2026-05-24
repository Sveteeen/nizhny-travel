import { useCallback, useMemo, useState } from 'react'
import { buildPlannerRoute } from '../../api/planner'
import { readAuthToken } from '../account/storage'
import { PlannerRouteMap } from '../maps/PlannerRouteMap'
import type { PlaceListItem, PlannerBuildResponse } from '../../types'

const MAX_PLACES = 25

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
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setError(null)

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
    setError(null)
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
    setPreview(null)

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
        <h2>Планировщик маршрутов</h2>
        <p>
          Выберите места, укажите стартовую точку и постройте пеший маршрут по дорогам.
          Можно выбрать до {MAX_PLACES} точек.
        </p>
      </div>

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
            <p className="planner__hint">В избранном пока нет мест. Добавьте их на вкладке «Достопримечательности».</p>
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
          </div>

          {preview && (
            <div className="planner__preview">
              <div className="planner__stats">
                <span>{formatDistance(preview.distance_km)}</span>
                <span>{formatDuration(preview.duration_minutes)}</span>
                <span>{preview.ordered_places.length} точек</span>
                {!preview.optimized && (
                  <span className="planner__stats-note">Порядок как вы выбрали</span>
                )}
              </div>

              <ol className="planner__route-list">
                {preview.ordered_places.map((place) => (
                  <li key={`${place.place_id}-${place.order_index}`} className="route-point">
                    <span className="route-point__index">{place.order_index}</span>
                    <div>
                      <p className="route-point__title">{place.name}</p>
                      {place.leg_distance_km != null && place.leg_duration_minutes != null && (
                        <p className="route-point__address">
                          {formatDistance(place.leg_distance_km)} · {formatDuration(place.leg_duration_minutes)} от
                          предыдущей точки
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
    </section>
  )
}
