import { useEffect, useRef } from 'react'
import type { PlaceListItem } from '../../types'
import {
  fitMapToPoints,
  loadYandexMaps,
  NIZHNY_NOVGOROD_CENTER,
  type YMapsGeoObject,
  type YMapsMapInstance,
} from '../../utils/yandexMaps'

type PlannerSelectionMapProps = {
  apiKey: string
  places: PlaceListItem[]
  selectedIds: number[]
  normalizeImageUrl: (value: string) => string
  onTogglePlace: (placeId: number) => void
}

const createPlaceMarker = (
  ymaps: NonNullable<typeof window.ymaps>,
  place: PlaceListItem,
  isSelected: boolean,
  normalizeImageUrl: (value: string) => string,
) => {
  const latitude = Number(place.latitude)
  const longitude = Number(place.longitude)
  const imageUrl = normalizeImageUrl(place.main_photo)
  const markerLayout = ymaps.templateLayoutFactory.createClass(`
    <div style="
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 3px solid ${isSelected ? '#2f6dff' : '#e9f2ff'};
      box-shadow: 0 8px 16px rgba(9, 15, 28, 0.45);
      background-image: url('${imageUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      ${isSelected ? 'transform: scale(1.08);' : ''}
    "></div>
  `)

  return new ymaps.Placemark(
    [latitude, longitude],
    {
      hintContent: `${isSelected ? '✓ ' : ''}${place.name}`,
      balloonContentHeader: place.name,
      balloonContentBody: isSelected
        ? 'Нажмите, чтобы убрать из маршрута'
        : 'Нажмите, чтобы добавить в маршрут',
    },
    {
      iconLayout: markerLayout,
      iconShape: {
        type: 'Circle',
        coordinates: [26, 26],
        radius: 26,
      },
      iconOffset: [-26, -26],
    },
  )
}

export const PlannerSelectionMap = ({
  apiKey,
  places,
  selectedIds,
  normalizeImageUrl,
  onTogglePlace,
}: PlannerSelectionMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<YMapsMapInstance | null>(null)
  const markersRef = useRef<Map<number, YMapsGeoObject>>(new Map())
  const onTogglePlaceRef = useRef(onTogglePlace)
  const normalizeImageUrlRef = useRef(normalizeImageUrl)
  const placesRef = useRef(places)
  const selectedIdsRef = useRef(selectedIds)

  useEffect(() => {
    onTogglePlaceRef.current = onTogglePlace
    normalizeImageUrlRef.current = normalizeImageUrl
    placesRef.current = places
    selectedIdsRef.current = selectedIds
  }, [onTogglePlace, normalizeImageUrl, places, selectedIds])

  useEffect(() => {
    let active = true

    const initMap = async () => {
      try {
        await loadYandexMaps(apiKey)
        if (!active || !mapRef.current || !window.ymaps || places.length === 0) return

        const ymaps = window.ymaps
        const selectedSet = new Set(selectedIdsRef.current)

        mapInstanceRef.current?.destroy()
        const markers = markersRef.current
        markers.clear()

        const map = new ymaps.Map(
          mapRef.current,
          {
            center: NIZHNY_NOVGOROD_CENTER,
            zoom: 12,
            controls: ['zoomControl'],
          },
          { minZoom: 10 },
        )
        mapInstanceRef.current = map

        const bounds: number[][] = []

        places.forEach((place) => {
          const latitude = Number(place.latitude)
          const longitude = Number(place.longitude)
          if (Number.isNaN(latitude) || Number.isNaN(longitude)) return

          bounds.push([latitude, longitude])

          const marker = createPlaceMarker(
            ymaps,
            place,
            selectedSet.has(place.id),
            normalizeImageUrl,
          )
          marker.events.add('click', () => onTogglePlaceRef.current(place.id))
          map.geoObjects.add(marker)
          markers.set(place.id, marker)
        })

        fitMapToPoints(map, bounds, { zoomMargin: 48 })
      } catch {
        // no-op
      }
    }

    initMap()

    const markers = markersRef.current

    return () => {
      active = false
      mapInstanceRef.current?.destroy()
      mapInstanceRef.current = null
      markers.clear()
    }
  }, [apiKey, places, normalizeImageUrl])

  useEffect(() => {
    const map = mapInstanceRef.current
    const ymaps = window.ymaps
    if (!map || !ymaps) return

    const selectedSet = new Set(selectedIds)

    markersRef.current.forEach((marker, placeId) => {
      const place = placesRef.current.find((item) => item.id === placeId)
      if (!place) return

      map.geoObjects.remove(marker)

      const nextMarker = createPlaceMarker(
        ymaps,
        place,
        selectedSet.has(placeId),
        normalizeImageUrlRef.current,
      )
      nextMarker.events.add('click', () => onTogglePlaceRef.current(place.id))
      map.geoObjects.add(nextMarker)
      markersRef.current.set(placeId, nextMarker)
    })
  }, [selectedIds])

  return (
    <div className="planner-map-wrap">
      <p className="planner__hint planner-map-wrap__hint">
        Нажмите на маркер на карте, чтобы добавить или убрать место.
      </p>
      <div ref={mapRef} className="map map--big planner-selection-map" />
    </div>
  )
}
