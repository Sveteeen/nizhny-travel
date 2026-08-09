import { useEffect, useRef } from 'react'
import {
  fitMapToPoints,
  loadYandexMaps,
  NIZHNY_NOVGOROD_CENTER,
  type YMapsMapInstance,
} from '../../utils/yandexMaps'
import { createPhotoRouteMarker, type PhotoRouteMarkerPoint } from './photoRouteMarker'

type PlannerRouteMapProps = {
  apiKey: string
  geometry: number[][]
  normalizeImageUrl: (value: string) => string
  points: PhotoRouteMarkerPoint[]
}

export const PlannerRouteMap = ({
  apiKey,
  geometry,
  points,
  normalizeImageUrl,
}: PlannerRouteMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<YMapsMapInstance | null>(null)

  useEffect(() => {
    let active = true

    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps) return

        const ymaps = window.ymaps
        const center = points[0]
          ? [points[0].latitude, points[0].longitude]
          : geometry[0] ?? NIZHNY_NOVGOROD_CENTER

        mapInstanceRef.current?.destroy()
        mapInstanceRef.current = new ymaps.Map(
          mapRef.current,
          {
            center,
            zoom: 13,
            controls: ['zoomControl'],
          },
          { minZoom: 10 },
        )

        if (geometry.length >= 2) {
          const routeLine = new ymaps.Polyline(
            geometry,
            {},
            { strokeColor: '#c2410c', strokeWidth: 5, strokeOpacity: 0.92 },
          )
          mapInstanceRef.current.geoObjects.add(routeLine)

          const routeBounds = routeLine.geometry?.getBounds()
          if (routeBounds) {
            fitMapToPoints(mapInstanceRef.current, routeBounds, { zoomMargin: 48 })
          }
        } else if (points.length > 0) {
          fitMapToPoints(
            mapInstanceRef.current,
            points.map((point) => [point.latitude, point.longitude]),
            { zoomMargin: 48 },
          )
        }

        points.forEach((point) => {
          const marker = createPhotoRouteMarker(ymaps, point, normalizeImageUrl)
          mapInstanceRef.current!.geoObjects.add(marker)
        })
      } catch {
        // empty map container on failure
      }
    }

    initMap()

    return () => {
      active = false
      mapInstanceRef.current?.destroy()
      mapInstanceRef.current = null
    }
  }, [apiKey, geometry, points, normalizeImageUrl])

  return <div ref={mapRef} className="map map--big planner-route-map planner-route-map--animate" />
}
