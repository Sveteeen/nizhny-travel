import { useEffect, useRef } from 'react'
import { loadYandexMaps, type YMapsMapInstance } from '../../utils/yandexMaps'

type PlaceMiniMapProps = {
  apiKey: string
  latitude: number
  longitude: number
}

export const PlaceMiniMap = ({ apiKey, latitude, longitude }: PlaceMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<YMapsMapInstance | null>(null)

  useEffect(() => {
    let active = true

    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps) return

        const ymaps = window.ymaps

        mapInstanceRef.current?.destroy()
        mapInstanceRef.current = new ymaps.Map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          controls: ['zoomControl'],
        })
        const marker = new ymaps.Placemark([latitude, longitude], {}, {
          preset: 'islands#blueCircleDotIcon',
        })
        mapInstanceRef.current.geoObjects.add(marker)
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
  }, [apiKey, latitude, longitude])

  return <div ref={mapRef} className="map" />
}
