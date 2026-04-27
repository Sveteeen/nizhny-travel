import type { PlaceListItem } from '../types'

type PlaceCardProps = {
  place: PlaceListItem
  isFavorite: boolean
  isLoading: boolean
  onToggleFavorite: (id: number) => void
  onOpenDetails: (id: number) => void
  normalizeImageUrl: (value: string) => string
}

export const PlaceCard = ({
  place,
  isFavorite,
  isLoading,
  onToggleFavorite,
  onOpenDetails,
  normalizeImageUrl,
}: PlaceCardProps) => (
  <article className="card" key={place.id}>
    <button
      className={`card__favorite ${isFavorite ? 'card__favorite--active' : ''}`}
      onClick={() => onToggleFavorite(place.id)}
      disabled={isLoading}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {isFavorite ? '♥' : '♡'}
    </button>
    <img src={normalizeImageUrl(place.main_photo)} alt={place.name} className="card__image" />
    <div className="card__body">
      <p className="card__meta">{place.category?.name ?? 'Без категории'}</p>
      <h3>{place.name}</h3>
      <div className="card__actions">
        <button className="card__button" onClick={() => onOpenDetails(place.id)}>
          Подробнее
        </button>
      </div>
    </div>
  </article>
)
