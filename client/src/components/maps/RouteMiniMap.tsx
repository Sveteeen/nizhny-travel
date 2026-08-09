import { useEffect, useRef } from 'react'
import {
  fitMapToPoints,
  loadYandexRouter,
  type YMapsMapInstance,
  type YMapsMultiRoute,
} from '../../utils/yandexMaps'
import { createPhotoRouteMarker, type PhotoRouteMarkerPoint } from './photoRouteMarker'

type RouteMiniMapProps = {
  apiKey: string
  normalizeImageUrl: (value: string) => string
  points: PhotoRouteMarkerPoint[]
}

const ROUTE_STYLE = {
  routeActiveStrokeColor: '#c2410c',
  routeActiveStrokeWidth: 4,
  routeOpenStrokeColor: '#c2410c',
  routeOpenStrokeWidth: 4,
  boundsAutoApply: true,
  wayPointVisible: false,
}

const addPhotoMarkers = (
  map: YMapsMapInstance,
  ymaps: NonNullable<typeof window.ymaps>,
  points: PhotoRouteMarkerPoint[],
  normalizeImageUrl: (value: string) => string,
) => {
  points.forEach((point) => {
    map.geoObjects.add(createPhotoRouteMarker(ymaps, point, normalizeImageUrl))
  })
}

const addStraightLineFallback = (
  map: YMapsMapInstance,
  ymaps: NonNullable<typeof window.ymaps>,
  points: PhotoRouteMarkerPoint[],
) => {
  const routeLine = new ymaps.Polyline(
    points.map((point) => [point.latitude, point.longitude]),
    {},
    { strokeColor: '#c2410c', strokeWidth: 4, strokeOpacity: 0.9 },
  )

  map.geoObjects.add(routeLine)
  const routeBounds = routeLine.geometry?.getBounds()
  if (routeBounds) {
    fitMapToPoints(map, routeBounds, { zoomMargin: 20 })
  }
}

export const RouteMiniMap = ({ apiKey, points, normalizeImageUrl }: RouteMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<YMapsMapInstance | null>(null)
  const multiRouteRef = useRef<YMapsMultiRoute | null>(null)

  useEffect(() => {
    let active = true

    const initMap = async () => {
      try {
        await loadYandexRouter(apiKey)
        if (!active || !mapRef.current || !window.ymaps || points.length === 0) return

        const ymaps = window.ymaps
        const center = points[0]

        mapInstanceRef.current?.destroy()
        mapInstanceRef.current = null
        multiRouteRef.current = null

        mapInstanceRef.current = new ymaps.Map(
          mapRef.current,
          {
            center: [center.latitude, center.longitude],
            zoom: 13,
            controls: ['zoomControl'],
          },
          { minZoom: 10 },
        )

        addPhotoMarkers(mapInstanceRef.current, ymaps, points, normalizeImageUrl)

        if (points.length < 2) {
          fitMapToPoints(mapInstanceRef.current, [[center.latitude, center.longitude]], {
            zoomMargin: 20,
          })
          return
        }

        const referencePoints = points.map((point) => [point.latitude, point.longitude])

        const multiRoute = new ymaps.multiRouter!.MultiRoute(
          {
            referencePoints,
            params: { routingMode: 'pedestrian' },
          },
          ROUTE_STYLE,
        )

        multiRouteRef.current = multiRoute
        mapInstanceRef.current.geoObjects.add(multiRoute)

        multiRoute.model.events.add('requestfail', () => {
          if (!active || !mapInstanceRef.current || !window.ymaps) return

          mapInstanceRef.current.geoObjects.remove(multiRoute)
          multiRouteRef.current = null
          addStraightLineFallback(mapInstanceRef.current, window.ymaps, points)
        })
      } catch {
        // graceful fallback: empty map container
      }
    }

    initMap()

    return () => {
      active = false
      multiRouteRef.current = null
      mapInstanceRef.current?.destroy()
      mapInstanceRef.current = null
    }
  }, [apiKey, points, normalizeImageUrl])

  return <div ref={mapRef} className="map" />
}
