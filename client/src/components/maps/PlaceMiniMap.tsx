import { useEffect, useRef } from 'react'
import { loadYandexMaps } from '../../utils/yandexMaps'

type PlaceMiniMapProps = {
  apiKey: string
  latitude: number
  longitude: number
}

export const PlaceMiniMap = ({ apiKey, latitude, longitude }: PlaceMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    let active = true

    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps) return

        mapInstanceRef.current?.destroy()
        mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          controls: ['zoomControl'],
        })
        const marker = new window.ymaps.Placemark([latitude, longitude], {}, {
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
