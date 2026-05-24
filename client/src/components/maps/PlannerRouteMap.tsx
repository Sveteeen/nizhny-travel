import { useEffect, useRef } from 'react'
import { loadYandexMaps, type YMapsMapInstance } from '../../utils/yandexMaps'

type PlannerRouteMapProps = {
  apiKey: string
  geometry: number[][]
  points: Array<{
    latitude: number
    longitude: number
    orderIndex: number
    name: string
  }>
}

export const PlannerRouteMap = ({ apiKey, geometry, points }: PlannerRouteMapProps) => {
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
          : geometry[0] ?? [56.3269, 44.0059]

        mapInstanceRef.current?.destroy()
        mapInstanceRef.current = new ymaps.Map(mapRef.current, {
          center,
          zoom: 13,
          controls: ['zoomControl'],
        })

        if (geometry.length >= 2) {
          const routeLine = new ymaps.Polyline(
            geometry,
            {},
            { strokeColor: '#2f6dff', strokeWidth: 5, strokeOpacity: 0.92 },
          )
          mapInstanceRef.current.geoObjects.add(routeLine)

          const bounds = routeLine.geometry?.getBounds()
          if (bounds) {
            mapInstanceRef.current.setBounds(bounds, {
              checkZoomRange: true,
              zoomMargin: 48,
            })
          }
        }

        points.forEach((point) => {
          const marker = new ymaps.Placemark(
            [point.latitude, point.longitude],
            { iconCaption: String(point.orderIndex), hintContent: point.name },
            { preset: 'islands#blueCircleDotIcon' },
          )
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
  }, [apiKey, geometry, points])

  return <div ref={mapRef} className="map map--big" />
}
