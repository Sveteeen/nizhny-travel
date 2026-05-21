import { useState, type FormEvent } from 'react'
import { ModalShell } from './ModalShell'
import { normalizeEmail, readStoredUser, saveStoredUser } from './storage'
import type { PublicUser } from './types'

type AccountModalProps = {
  user: PublicUser
  onClose: () => void
  onLogout: () => void
  onUpdateProfile: (user: PublicUser) => void
  onOpenLogin: () => void
  onOpenRegister: () => void
}

export const AccountModal = ({
  user,
  onClose,
  onLogout,
  onUpdateProfile,
  onOpenLogin,
  onOpenRegister,
}: AccountModalProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSaveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const nextName = name.trim()
    const nextEmail = normalizeEmail(email)
    if (!nextName || !nextEmail) {
      setError('Имя и email обязательны')
      return
    }
    const stored = readStoredUser()
    if (!stored) {
      setError('Не найден локальный профиль. Сначала зарегистрируйтесь.')
      return
    }
    const updated = { ...stored, name: nextName, email: nextEmail }
    saveStoredUser(updated)
    onUpdateProfile({ name: nextName, email: nextEmail })
    setMessage('Настройки сохранены')
    setSettingsOpen(false)
  }

  const settingsButton = (
    <button
      className={`settings-button settings-button--top ${settingsOpen ? 'settings-button--active' : ''}`}
      type="button"
      onClick={() => {
        setSettingsOpen((prev) => !prev)
        setName(user.name)
        setEmail(user.email)
      }}
      aria-label="Настройки профиля"
      title="Настройки профиля"
    >
      ⚙
    </button>
  )

  return (
    <ModalShell title="Личный кабинет" onClose={onClose} headerExtra={settingsButton}>
      {error && <p className="account-modal__state account-modal__state--error">{error}</p>}
      {message && <p className="account-modal__state">{message}</p>}

      {!settingsOpen && (
        <div className="account-modal__profile">
          <p className="account-modal__name">{user.name}</p>
          <p className="account-modal__email">{user.email}</p>
          <button className="account-modal__logout" type="button" onClick={onLogout}>
            Выйти
          </button>
          <div className="account-modal__auth-links">
            <button className="auth-modal__link" type="button" onClick={onOpenLogin}>
              Войти в другой аккаунт
            </button>
            <button className="auth-modal__link" type="button" onClick={onOpenRegister}>
              Создать новый аккаунт
            </button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <form className="account-form" onSubmit={handleSaveSettings}>
          <input
            className="filters__control"
            type="text"
            value={name}
            placeholder="Имя"
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="filters__control"
            type="email"
            value={email}
            placeholder="Email"
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="card__button account-form__submit" type="submit">
            Сохранить
          </button>
        </form>
      )}
    </ModalShell>
  )
}
