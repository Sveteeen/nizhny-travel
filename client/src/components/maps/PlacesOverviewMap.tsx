import { useEffect, useRef } from 'react'
import type { PlaceListItem } from '../../types'
import { loadYandexMaps, type YMapsMapInstance } from '../../utils/yandexMaps'

type PlacesOverviewMapProps = {
  apiKey: string
  places: PlaceListItem[]
  normalizeImageUrl: (value: string) => string
  onOpenDetails: (id: number) => void
}

export const PlacesOverviewMap = ({ apiKey, places, normalizeImageUrl, onOpenDetails }: PlacesOverviewMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<YMapsMapInstance | null>(null)

  useEffect(() => {
    let active = true
    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps || places.length === 0) return

        const ymaps = window.ymaps

        mapInstanceRef.current?.destroy()
        const map = new ymaps.Map(mapRef.current, {
          center: [56.3269, 44.0059],
          zoom: 12,
          controls: ['zoomControl'],
        })
        mapInstanceRef.current = map

        const bounds: number[][] = []
        places.forEach((place) => {
          const latitude = Number(place.latitude)
          const longitude = Number(place.longitude)
          if (Number.isNaN(latitude) || Number.isNaN(longitude)) return
          bounds.push([latitude, longitude])

          const imageUrl = normalizeImageUrl(place.main_photo)
          const markerLayout = ymaps.templateLayoutFactory.createClass(`
            <div style="
              width: 56px;
              height: 56px;
              border-radius: 50%;
              border: 2px solid #e9f2ff;
              box-shadow: 0 8px 16px rgba(9, 15, 28, 0.45);
              background-image: url('${imageUrl}');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
            "></div>
          `)

          const marker = new ymaps.Placemark(
            [latitude, longitude],
            {
              hintContent: place.name,
              balloonContentHeader: place.name,
              balloonContentBody: place.address,
            },
            {
              iconLayout: markerLayout,
              iconShape: {
                type: 'Circle',
                coordinates: [28, 28],
                radius: 28,
              },
              iconOffset: [-28, -28],
            }
          )
          marker.events.add('click', () => onOpenDetails(place.id))
          map.geoObjects.add(marker)
        })

        if (bounds.length > 1) {
          const fitResult = map.setBounds(bounds, {
            checkZoomRange: true,
            zoomMargin: 45,
          })

          const limitOverviewZoom = () => {
            const currentZoom = map.getZoom()
            if (typeof currentZoom === 'number' && currentZoom > 12) {
              map.setZoom(11, { duration: 0 })
            }
          }

          if (fitResult && typeof fitResult.then === 'function') {
            fitResult.then(limitOverviewZoom)
          } else {
            limitOverviewZoom()
          }
        } else if (bounds.length === 1) {
          map.setCenter(bounds[0], 13)
        }
      } catch {
        // no-op
      }
    }

    initMap()
    return () => {
      active = false
      mapInstanceRef.current?.destroy()
      mapInstanceRef.current = null
    }
  }, [apiKey, places, normalizeImageUrl, onOpenDetails])

  return <div className="map map--big" ref={mapRef} />
}
