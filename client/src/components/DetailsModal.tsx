import type { SyntheticEvent } from 'react'
import { PlaceMiniMap } from './maps/PlaceMiniMap'
import { RouteMiniMap } from './maps/RouteMiniMap'
import type { PlaceDetails, RouteDetails } from '../types'

type DetailsModalProps = {
  placeDetails: PlaceDetails | null
  routeDetails: RouteDetails | null
  detailsLoading: boolean
  yandexApiKey: string | null
  placePhotos: { src: string; alt: string }[]
  routePhotos: { src: string; alt: string }[]
  normalizeImageUrl: (value: string) => string
  formatDuration: (value: number | string) => string
  formatDistance: (value: number | string) => string
  onImageError: (event: SyntheticEvent<HTMLImageElement, Event>) => void
  onClose: () => void
  onOpenViewer: (images: { src: string; alt: string }[], startIndex: number, title: string) => void
}

export const DetailsModal = ({
  placeDetails,
  routeDetails,
  detailsLoading,
  yandexApiKey,
  placePhotos,
  routePhotos,
  normalizeImageUrl,
  formatDuration,
  formatDistance,
  onImageError,
  onClose,
  onOpenViewer,
}: DetailsModalProps) => (
  <div className="modal" onClick={onClose}>
    <div className="modal__content" onClick={(event) => event.stopPropagation()}>
      <button className="modal__close" onClick={onClose}>
        ×
      </button>

      {detailsLoading && <p>Загрузка деталей...</p>}

      {!detailsLoading && placeDetails && (
        <>
          <img
            src={normalizeImageUrl(placeDetails.main_photo)}
            alt={placeDetails.name}
            className="modal__image"
            onClick={() => onOpenViewer(placePhotos, 0, placeDetails.name)}
          />
          <h2>{placeDetails.name}</h2>
          <p className="modal__meta">{placeDetails.category?.name ?? 'Без категории'}</p>
          <p>{placeDetails.description}</p>
          <p>
            <strong>Адрес:</strong> {placeDetails.address}
          </p>
          <p>
            <strong>Координаты:</strong> {placeDetails.latitude}, {placeDetails.longitude}
          </p>
          <div className="map-wrap">
            {yandexApiKey ? (
              <PlaceMiniMap
                apiKey={yandexApiKey}
                latitude={Number(placeDetails.latitude)}
                longitude={Number(placeDetails.longitude)}
              />
            ) : (
              <div className="map map--fallback">Не настроен ключ Яндекс.Карт</div>
            )}
          </div>
          <div className="tags">
            {placeDetails.tags.map((tag) => (
              <span key={tag.id} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
          {!!placeDetails.photos.length && (
            <div className="gallery">
              {placeDetails.photos.map((photo, idx) => (
                <img
                  key={photo.id}
                  src={normalizeImageUrl(photo.photo)}
                  alt={placeDetails.name}
                  onClick={() => onOpenViewer(placePhotos, idx + 1, placeDetails.name)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!detailsLoading && routeDetails && (
        <>
          <img
            src={normalizeImageUrl(routeDetails.main_photo)}
            alt={routeDetails.name}
            className="modal__image"
            onError={onImageError}
            onClick={() =>
              onOpenViewer(
                [{ src: normalizeImageUrl(routeDetails.main_photo), alt: routeDetails.name }, ...routePhotos],
                0,
                routeDetails.name
              )
            }
          />
          <h2>{routeDetails.name}</h2>
          <p className="modal__meta">
            {formatDuration(routeDetails.duration_minutes)} • {formatDistance(routeDetails.distance_km)}
          </p>
          <p>{routeDetails.description}</p>
          {!!routeDetails.points.length && (
            <div className="map-wrap">
              {yandexApiKey ? (
                <RouteMiniMap
                  apiKey={yandexApiKey}
                  normalizeImageUrl={normalizeImageUrl}
                  points={routeDetails.points
                    .filter((point) => point.place)
                    .map((point) => ({
                      latitude: Number(point.place!.latitude),
                      longitude: Number(point.place!.longitude),
                      orderIndex: point.order_index,
                      name: point.place!.name,
                      mainPhoto: point.place!.main_photo,
                    }))}
                />
              ) : (
                <div className="map map--fallback">Не настроен ключ Яндекс.Карт</div>
              )}
            </div>
          )}

          <h3>Точки маршрута</h3>
          <div className="route-points">
            {routeDetails.points.map((point) => (
              <div className="route-point" key={`${routeDetails.id}-${point.order_index}`}>
                <span className="route-point__index">{point.order_index}</span>
                <div>
                  <p className="route-point__title">{point.place?.name ?? 'Точка недоступна'}</p>
                  {point.place && <p className="route-point__address">{point.place.address}</p>}
                </div>
              </div>
            ))}
          </div>
          <h3>Фото по маршруту</h3>
          <div className="gallery">
            {routePhotos.map((photo, index) => (
              <img
                key={`route-photo-${routeDetails.id}-${index}`}
                src={photo.src}
                alt={photo.alt}
                onError={onImageError}
                onClick={() =>
                  onOpenViewer(
                    [{ src: normalizeImageUrl(routeDetails.main_photo), alt: routeDetails.name }, ...routePhotos],
                    index + 1,
                    routeDetails.name
                  )
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  </div>
)
