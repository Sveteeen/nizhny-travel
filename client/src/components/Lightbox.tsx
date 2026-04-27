import type { SyntheticEvent } from 'react'
import type { ViewerState } from '../types'

type LightboxProps = {
  viewerState: ViewerState
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onImageError: (event: SyntheticEvent<HTMLImageElement, Event>) => void
}

export const Lightbox = ({ viewerState, onClose, onPrev, onNext, onImageError }: LightboxProps) => (
  <div className="lightbox" onClick={onClose}>
    <div className="lightbox__content" onClick={(event) => event.stopPropagation()}>
      <button className="lightbox__close" onClick={onClose}>
        ×
      </button>
      <button className="lightbox__nav lightbox__nav--prev" onClick={onPrev}>
        ‹
      </button>
      <img
        className="lightbox__image"
        src={viewerState.images[viewerState.index].src}
        alt={viewerState.images[viewerState.index].alt}
        onError={onImageError}
      />
      <button className="lightbox__nav lightbox__nav--next" onClick={onNext}>
        ›
      </button>
      <p className="lightbox__caption">
        {viewerState.title} — {viewerState.index + 1} / {viewerState.images.length}
      </p>
    </div>
  </div>
)
