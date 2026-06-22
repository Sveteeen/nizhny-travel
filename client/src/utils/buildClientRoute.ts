import { loadYandexMaps } from './yandexMaps'
import type { PlannerBuildResponse, PlannerOrderedPlace } from '../types'
import type { PlaceListItem } from '../types'

type BuildClientRouteParams = {
  apiKey: string
  places: PlaceListItem[]
  selectedIds: number[]
  startPlaceId: number | null
}

type RouteProperty = { text: string; value: number } | undefined

type MultiRouteActiveRoute = {
  properties: {
    get: (key: string) => RouteProperty
  }
  getPaths: () => {
    getLength: () => number
    get: (index: number) => {
      properties: {
        get: (key: string) => RouteProperty
      }
      geometry: { getCoordinates: () => number[][] } | null
      getSegments: () => {
        getLength: () => number
        get: (index: number) => {
          geometry: { getCoordinates: () => number[][] } | null
        } | undefined
      }
    } | undefined
  }
  geometry: { getCoordinates: () => number[][] } | null
}

type MultiRouteInstance = {
  model: {
    events: {
      add: (event: string, handler: () => void) => void
      remove: (event: string, handler: () => void) => void
    }
  }
  getActiveRoute: () => MultiRouteActiveRoute | null
  getWayPoints: () => {
    getLength: () => number
    get: (index: number) => {
      geometry: { getCoordinates: () => number[] }
    } | undefined
  }
}

const ROUTE_BUILD_TIMEOUT_MS = 20000

const orderPlaces = (
  places: PlaceListItem[],
  selectedIds: number[],
  startPlaceId: number | null,
): PlaceListItem[] => {
  const placeMap = new Map(places.map((p) => [p.id, p]))
  const ordered = selectedIds
    .map((id) => placeMap.get(id))
    .filter((p): p is PlaceListItem => Boolean(p))

  if (startPlaceId != null && ordered.length > 0 && ordered[0].id !== startPlaceId) {
    const idx = ordered.findIndex((p) => p.id === startPlaceId)
    if (idx > 0) {
      const [start] = ordered.splice(idx, 1)
      ordered.unshift(start)
    }
  }

  return ordered
}

export const buildClientRoute = (
  params: BuildClientRouteParams,
): Promise<PlannerBuildResponse> => {
  const { apiKey, places, selectedIds, startPlaceId } = params

  const orderedPlaces = orderPlaces(places, selectedIds, startPlaceId)

  if (orderedPlaces.length < 2) {
    return Promise.reject(new Error('Выберите минимум две достопримечательности.'))
  }

  return new Promise<PlannerBuildResponse>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let cleanedUp = false

    const cleanup = (container: HTMLDivElement, map: unknown) => {
      if (cleanedUp) return
      cleanedUp = true
      if (timeoutId) clearTimeout(timeoutId)
      try {
        ;(map as { destroy: () => void })?.destroy?.()
      } catch { /* ignore */ }
      container.remove()
    }

    const run = async () => {
      await loadYandexMaps(apiKey)
      const ymaps = window.ymaps
      if (!ymaps) throw new Error('Yandex Maps не загружены')

      await new Promise<void>((rdy) => ymaps.ready(rdy))

      const container = document.createElement('div')
      container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:600px;height:400px;'
      document.body.appendChild(container)

      const map = new ymaps.Map(container, {
        center: [Number(orderedPlaces[0].latitude), Number(orderedPlaces[0].longitude)],
        zoom: 12,
        controls: [],
      })

      const referencePoints = orderedPlaces.map((p) => [Number(p.latitude), Number(p.longitude)])

      const multiRoute = new (ymaps as unknown as {
        multiRouter: {
          MultiRoute: new (
            data: Record<string, unknown>,
            opts?: Record<string, unknown>,
          ) => MultiRouteInstance
        }
      }).multiRouter.MultiRoute(
        {
          referencePoints,
          params: { routingMode: 'pedestrian' },
        },
        { boundsAutoApply: false },
      ) as unknown as MultiRouteInstance

      map.geoObjects.add(multiRoute as unknown as import('./yandexMaps').YMapsGeoObject)

      timeoutId = setTimeout(() => {
        cleanup(container, map)
        reject(new Error('Время ожидания построения маршрута истекло.'))
      }, ROUTE_BUILD_TIMEOUT_MS)

      const onSuccess = () => {
        try {
          const activeRoute = multiRoute.getActiveRoute()
          if (!activeRoute) {
            cleanup(container, map)
            reject(new Error('Не удалось построить маршрут для выбранных точек.'))
            return
          }

          const distanceValue = activeRoute.properties.get('distance')?.value ?? 0
          const durationValue = activeRoute.properties.get('duration')?.value ?? 0

          const paths = activeRoute.getPaths()
          let geometry: number[][] = []
          const legMetrics: { distanceM: number; durationSec: number }[] = []

          const appendCoords = (coords: number[][]) => {
            for (const coord of coords) {
              if (
                geometry.length === 0 ||
                Math.abs(geometry[geometry.length - 1][0] - coord[0]) > 1e-6 ||
                Math.abs(geometry[geometry.length - 1][1] - coord[1]) > 1e-6
              ) {
                geometry.push(coord)
              }
            }
          }

          for (let i = 0; i < paths.getLength(); i++) {
            const path = paths.get(i)
            if (!path) continue

            const pathDistance = path.properties.get('distance')?.value ?? 0
            const pathDuration = path.properties.get('duration')?.value ?? 0
            legMetrics.push({ distanceM: pathDistance, durationSec: pathDuration })

            if (path.geometry) {
              appendCoords(path.geometry.getCoordinates())
            } else {
              const segments = path.getSegments()
              for (let s = 0; s < segments.getLength(); s++) {
                const segment = segments.get(s)
                if (segment?.geometry) {
                  appendCoords(segment.geometry.getCoordinates())
                }
              }
            }
          }

          if (geometry.length === 0 && activeRoute.geometry) {
            geometry = activeRoute.geometry.getCoordinates()
          }

          const distanceKm = Number((distanceValue / 1000).toFixed(2))
          const durationMinutes = Math.round(durationValue / 60)

          const orderedResult: PlannerOrderedPlace[] = orderedPlaces.map((place, index) => ({
            place_id: place.id,
            order_index: index + 1,
            name: place.name,
            address: place.address,
            latitude: Number(place.latitude),
            longitude: Number(place.longitude),
            main_photo: place.main_photo,
            leg_duration_minutes:
              index === 0 ? null : Math.round((legMetrics[index - 1]?.durationSec ?? 0) / 60),
            leg_distance_km:
              index === 0
                ? null
                : Number(((legMetrics[index - 1]?.distanceM ?? 0) / 1000).toFixed(2)),
          }))

          const result: PlannerBuildResponse = {
            ordered_places: orderedResult,
            distance_km: distanceKm,
            duration_minutes: durationMinutes,
            geometry,
            optimized: false,
            start_place_id: orderedPlaces[0].id,
          }

          cleanup(container, map)
          resolve(result)
        } catch (extractError) {
          cleanup(container, map)
          reject(extractError instanceof Error ? extractError : new Error('Ошибка при извлечении маршрута'))
        }
      }

      const onFail = () => {
        cleanup(container, map)
        reject(new Error('Не удалось построить пеший маршрут для выбранных точек.'))
      }

      multiRoute.model.events.add('requestsuccess', onSuccess)
      multiRoute.model.events.add('requestfail', onFail)
    }

    run().catch((err) => {
      reject(err instanceof Error ? err : new Error(String(err)))
    })
  })
}
