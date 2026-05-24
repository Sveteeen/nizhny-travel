import { useState } from 'react'
import { ModalShell } from '../account/ModalShell'

type SaveRouteModalProps = {
  defaultName: string
  saving: boolean
  error: string | null
  onClose: () => void
  onSave: (name: string) => void
}

export const SaveRouteModal = ({
  defaultName,
  saving,
  error,
  onClose,
  onSave,
}: SaveRouteModalProps) => {
  const [name, setName] = useState(defaultName)

  return (
    <ModalShell title="Сохранить маршрут" onClose={onClose}>
      <form
        className="planner-save"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(name.trim())
        }}
      >
        <label className="planner-save__label" htmlFor="saved-route-name">
          Название маршрута
        </label>
        <input
          id="saved-route-name"
          className="filters__control"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={255}
          autoFocus
        />
        {error && <p className="planner__error">{error}</p>}
        <div className="planner-save__actions">
          <button type="button" className="planner-save__cancel" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="planner__build" disabled={saving || !name.trim()}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
