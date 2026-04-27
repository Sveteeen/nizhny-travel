import { useEffect, useRef } from 'react'
import { loadYandexMaps } from '../../utils/yandexMaps'

type RouteMiniMapProps = {
  apiKey: string
  points: Array<{ latitude: number; longitude: number }>
}

export const RouteMiniMap = ({ apiKey, points }: RouteMiniMapProps) => {
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
