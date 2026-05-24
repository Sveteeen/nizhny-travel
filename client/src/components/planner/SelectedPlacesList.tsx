import { useState, type DragEvent } from 'react'
import type { PlaceListItem } from '../../types'

type SelectedPlacesListProps = {
  places: PlaceListItem[]
  startPlaceId: number | null
  onStartChange: (placeId: number) => void
  onRemove: (placeId: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

export const SelectedPlacesList = ({
  places,
  startPlaceId,
  onStartChange,
  onRemove,
  onReorder,
}: SelectedPlacesListProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault()
    if (dragIndex == null || dragIndex === targetIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }

    onReorder(dragIndex, targetIndex)
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <ul className="planner__selected">
      {places.map((place, index) => (
        <li
          key={place.id}
          className={`planner__selected-item ${
            dragIndex === index ? 'planner__selected-item--dragging' : ''
          } ${overIndex === index ? 'planner__selected-item--over' : ''}`}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragEnd={() => {
            setDragIndex(null)
            setOverIndex(null)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setOverIndex(index)
          }}
          onDrop={(event) => handleDrop(event, index)}
        >
          <span className="planner__drag-handle" aria-hidden>
            ⋮⋮
          </span>
          <label className="planner__start">
            <input
              type="radio"
              name="planner-start"
              checked={startPlaceId === place.id}
              onChange={() => onStartChange(place.id)}
            />
            <span>Старт</span>
          </label>
          <span className="planner__selected-name">{place.name}</span>
          <button
            type="button"
            className="planner__remove"
            onClick={() => onRemove(place.id)}
            aria-label={`Убрать ${place.name}`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
