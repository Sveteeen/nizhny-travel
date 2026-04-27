import type { SyntheticEvent } from 'react'
import type { RouteListItem } from '../types'

type RouteCardProps = {
  route: RouteListItem
  isFavorite: boolean
  isLoading: boolean
  onToggleFavorite: (id: number) => void
  onOpenDetails: (id: number) => void
  normalizeImageUrl: (value: string) => string
  formatDuration: (value: number | string) => string
  formatDistance: (value: number | string) => string
  onImageError: (event: SyntheticEvent<HTMLImageElement, Event>) => void
}

export const RouteCard = ({
  route,
  isFavorite,
  isLoading,
  onToggleFavorite,
  onOpenDetails,
  normalizeImageUrl,
  formatDuration,
  formatDistance,
  onImageError,
}: RouteCardProps) => (
  <article className="card" key={route.id}>
    <button
      className={`card__favorite ${isFavorite ? 'card__favorite--active' : ''}`}
      onClick={() => onToggleFavorite(route.id)}
      disabled={isLoading}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {isFavorite ? '♥' : '♡'}
    </button>
    <img src={normalizeImageUrl(route.main_photo)} alt={route.name} className="card__image" onError={onImageError} />
    <div className="card__body">
      <p className="card__meta">
        {formatDuration(route.duration_minutes)} • {formatDistance(route.distance_km)}
      </p>
      <h3>{route.name}</h3>
      <p className="card__text">{route.description}</p>
      <div className="card__actions">
        <button className="card__button" onClick={() => onOpenDetails(route.id)}>
          Открыть маршрут
        </button>
      </div>
    </div>
  </article>
)
