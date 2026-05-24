import { useEffect, useRef } from 'react'
import {
  loadYandexRouter,
  type YMapsMapInstance,
  type YMapsMultiRoute,
} from '../../utils/yandexMaps'

type RouteMiniMapProps = {
  apiKey: string
  points: Array<{ latitude: number; longitude: number }>
}

const ROUTE_STYLE = {
  routeActiveStrokeColor: '#2f6dff',
  routeActiveStrokeWidth: 4,
  routeOpenStrokeColor: '#2f6dff',
  routeOpenStrokeWidth: 4,
  boundsAutoApply: true,
  wayPointVisible: true,
}

const addStraightLineFallback = (
  map: YMapsMapInstance,
  ymaps: NonNullable<typeof window.ymaps>,
  points: RouteMiniMapProps['points'],
) => {
  const routeLine = new ymaps.Polyline(
    points.map((point) => [point.latitude, point.longitude]),
    {},
    { strokeColor: '#2f6dff', strokeWidth: 4, strokeOpacity: 0.9 },
  )

  map.geoObjects.add(routeLine)
  map.setBounds(routeLine.geometry!.getBounds(), {
    checkZoomRange: true,
    zoomMargin: 20,
  })
}

export const RouteMiniMap = ({ apiKey, points }: RouteMiniMapProps) => {
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

        mapInstanceRef.current = new ymaps.Map(mapRef.current, {
          center: [center.latitude, center.longitude],
          zoom: 13,
          controls: ['zoomControl'],
        })

        if (points.length < 2) {
          const marker = new ymaps.Placemark(
            [center.latitude, center.longitude],
            { iconCaption: '1' },
            { preset: 'islands#blueCircleDotIcon' },
          )
          mapInstanceRef.current.geoObjects.add(marker)
          return
        }

        const referencePoints = points.map((point) => [
          point.latitude,
          point.longitude,
        ])

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
  }, [apiKey, points])

  return <div ref={mapRef} className="map" />
}
