import { useMemo, useState, type FormEvent } from 'react'

type StoredUser = {
  name: string
  email: string
  password: string
}

type PublicUser = {
  name: string
  email: string
}

type AccountModalProps = {
  user: PublicUser | null
  onClose: () => void
  onAuthSuccess: (user: PublicUser) => void
  onLogout: () => void
  onUpdateProfile: (user: PublicUser) => void
}

const STORAGE_KEY = 'travel-app-user'
const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const AccountModal = ({
  user,
  onClose,
  onAuthSuccess,
  onLogout,
  onUpdateProfile,
}: AccountModalProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => {
    if (user) return 'Личный кабинет'
    return authMode === 'login' ? 'Вход' : 'Регистрация'
  }, [authMode, user])

  const readStoredUser = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as StoredUser
    } catch {
      return null
    }
  }

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const normalizedEmail = normalizeEmail(email)
    if (!name.trim()) {
      setError('Введите имя')
      return
    }
    if (!normalizedEmail) {
      setError('Введите email')
      return
    }
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    const nextUser: StoredUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    onAuthSuccess({ name: nextUser.name, email: nextUser.email })
    setName(nextUser.name)
    setEmail(nextUser.email)
    setMessage('Профиль создан, вы вошли в систему')
  }

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const stored = readStoredUser()
    if (!stored) {
      setError('Пользователь не найден. Зарегистрируйтесь.')
      return
    }
    if (normalizeEmail(email) !== normalizeEmail(stored.email) || password !== stored.password) {
      setError('Неверный email или пароль')
      return
    }
    onAuthSuccess({ name: stored.name, email: stored.email })
    setName(stored.name)
    setEmail(stored.email)
    setMessage('Успешный вход')
  }

  const handleSaveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (!user) return
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
    const updated: StoredUser = {
      ...stored,
      name: nextName,
      email: nextEmail,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    onUpdateProfile({ name: nextName, email: nextEmail })
    setMessage('Настройки сохранены')
    setSettingsOpen(false)
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__content account-modal" onClick={(event) => event.stopPropagation()}>
        {user && (
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
        )}
        <button className="modal__close" type="button" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <div className="account-modal__header">
          <h2>{title}</h2>
        </div>

        {!user && (
          <div className="account-modal__tabs">
            <button
              className={`tab ${authMode === 'login' ? 'tab--active' : ''}`}
              type="button"
              onClick={() => setAuthMode('login')}
            >
              Войти
            </button>
            <button
              className={`tab ${authMode === 'register' ? 'tab--active' : ''}`}
              type="button"
              onClick={() => setAuthMode('register')}
            >
              Зарегистрироваться
            </button>
          </div>
        )}

        {error && <p className="account-modal__state account-modal__state--error">{error}</p>}
        {message && <p className="account-modal__state">{message}</p>}

        {!user && authMode === 'login' && (
          <form className="account-form" onSubmit={handleLogin}>
            <input
              className="filters__control"
              type="email"
              value={email}
              placeholder="Email"
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="filters__control"
              type="password"
              value={password}
              placeholder="Пароль"
              onChange={(event) => setPassword(event.target.value)}
            />
            <button className="card__button account-form__submit" type="submit">
              Войти
            </button>
          </form>
        )}

        {!user && authMode === 'register' && (
          <form className="account-form" onSubmit={handleRegister}>
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
            <input
              className="filters__control"
              type="password"
              value={password}
              placeholder="Пароль (минимум 6 символов)"
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              className="filters__control"
              type="password"
              value={confirmPassword}
              placeholder="Повторите пароль"
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button className="card__button account-form__submit" type="submit">
              Зарегистрироваться
            </button>
          </form>
        )}

        {user && !settingsOpen && (
          <div className="account-modal__profile">
            <p className="account-modal__name">{user.name}</p>
            <p className="account-modal__email">{user.email}</p>
            <button className="account-modal__logout" type="button" onClick={onLogout}>
              Выйти
            </button>
          </div>
        )}

        {user && settingsOpen && (
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
      </div>
    </div>
  )
}
