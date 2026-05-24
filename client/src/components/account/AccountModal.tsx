import { useEffect, useRef, useState, type FormEvent, type SyntheticEvent } from 'react'
import {
  fetchMe,
  getApiErrorMessage,
  toPublicUser,
  updateUser,
  type ApiUser,
} from '../../api/auth'
import { fetchSavedRoutes } from '../../api/planner'
import type { SavedRouteListItem } from '../../types'
import { ModalShell } from './ModalShell'
import { normalizeEmail, readAuthToken, saveSession } from './storage'
import type { PublicUser } from './types'

type AccountModalProps = {
  user: PublicUser
  onClose: () => void
  onUpdateProfile: (user: PublicUser) => void
  onOpenLogin: () => void
  onOpenRegister: () => void
  onOpenFavoritePlaces: () => void
  onOpenFavoriteRoutes: () => void
  onOpenPlanner: () => void
  onOpenSavedRoute: (routeId: number) => void
  normalizeImageUrl: (value: string) => string
  onImageError: (event: SyntheticEvent<HTMLImageElement, Event>) => void
  formatDuration: (value: number | string) => string
  formatDistance: (value: number | string) => string
  onLogout: () => void
}

type ProfileForm = {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const emptyForm = (): ProfileForm => ({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const formFromUser = (user: ApiUser): ProfileForm => ({
  name: user.name?.trim() || '',
  email: user.email,
  phone: user.phone?.trim() || '',
  password: '',
  confirmPassword: '',
})

export const AccountModal = ({
  user,
  onClose,
  onUpdateProfile,
  onOpenLogin,
  onOpenRegister,
  onOpenFavoritePlaces,
  onOpenFavoriteRoutes,
  onOpenPlanner,
  onOpenSavedRoute,
  normalizeImageUrl,
  onImageError,
  formatDuration,
  formatDistance,
  onLogout,
}: AccountModalProps) => {
  const [apiUser, setApiUser] = useState<ApiUser | null>(null)
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteListItem[]>([])
  const [savedRoutesLoading, setSavedRoutesLoading] = useState(false)
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const onUpdateProfileRef = useRef(onUpdateProfile)
  onUpdateProfileRef.current = onUpdateProfile

  const displayName = apiUser
    ? toPublicUser(apiUser).name
    : user.name

  useEffect(() => {
    const token = readAuthToken()
    if (!token) {
      setIsRefreshing(false)
      setError('Сессия не найдена. Войдите снова.')
      return
    }

    let mounted = true

    const loadProfile = async () => {
      try {
        setError(null)
        const loadedUser = await fetchMe(token)
        if (!mounted) return
        setApiUser(loadedUser)
        setForm(formFromUser(loadedUser))
        const publicUser = toPublicUser(loadedUser)
        saveSession({ token, user: publicUser })
        onUpdateProfileRef.current(publicUser)
      } catch (requestError) {
        if (!mounted) return
        setError(getApiErrorMessage(requestError, 'Не удалось загрузить профиль.'))
      } finally {
        if (mounted) setIsRefreshing(false)
      }
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const token = readAuthToken()
    if (!token || !apiUser) {
      setSavedRoutes([])
      return
    }

    let mounted = true

    const loadSavedRoutes = async () => {
      setSavedRoutesLoading(true)
      try {
        const routes = await fetchSavedRoutes(token)
        if (mounted) setSavedRoutes(routes)
      } catch {
        if (mounted) setSavedRoutes([])
      } finally {
        if (mounted) setSavedRoutesLoading(false)
      }
    }

    void loadSavedRoutes()
    return () => {
      mounted = false
    }
  }, [apiUser])

  const handleOpenEdit = () => {
    if (!apiUser) return
    setForm(formFromUser(apiUser))
    setError(null)
    setMessage(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (apiUser) setForm(formFromUser(apiUser))
    setError(null)
    setMessage(null)
    setIsEditing(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const token = readAuthToken()
    if (!token) {
      setError('Сессия не найдена. Войдите снова.')
      return
    }

    const normalizedEmail = normalizeEmail(form.email)
    if (!normalizedEmail) {
      setError('Введите email')
      return
    }

    if (form.password && form.password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    const payload = {
      name: form.name.trim() || undefined,
      email: normalizedEmail,
      phone: form.phone.trim() || undefined,
      ...(form.password ? { password: form.password } : {}),
    }

    try {
      setIsSubmitting(true)
      const updatedUser = await updateUser(token, payload)
      const publicUser = toPublicUser(updatedUser)
      setApiUser(updatedUser)
      setForm(formFromUser(updatedUser))
      saveSession({ token, user: publicUser })
      onUpdateProfile(publicUser)
      setIsEditing(false)
      setMessage('Профиль обновлён')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось сохранить профиль.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const settingsButton = !error && !isRefreshing && apiUser ? (
    <button
      className={`settings-button settings-button--top${isEditing ? ' settings-button--active' : ''}`}
      type="button"
      aria-label={isEditing ? 'Отменить редактирование' : 'Редактировать профиль'}
      onClick={isEditing ? handleCancelEdit : handleOpenEdit}
      disabled={isSubmitting}
    >
      {isEditing ? '×' : '⚙'}
    </button>
  ) : null

  return (
    <ModalShell
      title={isEditing ? 'Редактирование профиля' : 'Личный кабинет'}
      onClose={onClose}
      headerExtra={settingsButton}
    >
      {error && <p className="account-modal__state account-modal__state--error">{error}</p>}
      {message && <p className="account-modal__state">{message}</p>}
      {isRefreshing && !error && (
        <p className="account-modal__state account-modal__state--muted">Обновление профиля…</p>
      )}

      {!error && !isRefreshing && apiUser && !isEditing && (
        <div className="account-modal__profile">
          <p className="account-modal__name">{displayName}</p>
          <p className="account-modal__email">{apiUser.email}</p>
          {apiUser.phone && (
            <p className="account-modal__meta">Телефон: {apiUser.phone}</p>
          )}
          <button
            className="account-modal__planner-button"
            type="button"
            onClick={onOpenPlanner}
          >
            Запланировать собственный маршрут
          </button>

          {savedRoutesLoading && (
            <p className="account-modal__state account-modal__state--muted">Загрузка маршрутов…</p>
          )}

          {!savedRoutesLoading && savedRoutes.length > 0 && (
            <div className="account-modal__saved-routes">
              <h3 className="account-modal__section-title">Мои маршруты</h3>
              <ul className="account-modal__saved-list">
                {savedRoutes.map((route) => (
                  <li key={route.id}>
                    <button
                      type="button"
                      className="account-modal__saved-route"
                      onClick={() => onOpenSavedRoute(route.id)}
                    >
                      <img
                        src={normalizeImageUrl(route.main_photo || '')}
                        alt=""
                        className="account-modal__saved-route-photo"
                        onError={onImageError}
                      />
                      <span className="account-modal__saved-route-text">
                        <span className="account-modal__saved-route-name">{route.name}</span>
                        <span className="account-modal__saved-route-meta">
                          {formatDistance(route.distance_km)} · {formatDuration(route.duration_minutes)} ·{' '}
                          {route.places_count} точек
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="account-modal__favorites">
            <button
              className="account-modal__favorites-button"
              type="button"
              onClick={onOpenFavoritePlaces}
            >
              Избранные места
            </button>
            <button
              className="account-modal__favorites-button"
              type="button"
              onClick={onOpenFavoriteRoutes}
            >
              Избранные маршруты
            </button>
          </div>
          <div className="account-modal__auth-links">
            <button className="auth-modal__link" type="button" onClick={onOpenLogin}>
              Войти в другой аккаунт
            </button>
            <button className="auth-modal__link" type="button" onClick={onOpenRegister}>
              Создать новый аккаунт
            </button>
            <button className="auth-modal__link" type="button" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>
      )}

      {!error && !isRefreshing && apiUser && isEditing && (
        <form className="account-form" onSubmit={handleSubmit}>
          <input
            className="filters__control"
            type="text"
            value={form.name}
            placeholder="Имя"
            autoComplete="name"
            disabled={isSubmitting}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="filters__control"
            type="email"
            value={form.email}
            placeholder="Email"
            autoComplete="email"
            disabled={isSubmitting}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <input
            className="filters__control"
            type="tel"
            value={form.phone}
            placeholder="Телефон"
            autoComplete="tel"
            disabled={isSubmitting}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <input
            className="filters__control"
            type="password"
            value={form.password}
            placeholder="Новый пароль (необязательно)"
            autoComplete="new-password"
            disabled={isSubmitting}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <input
            className="filters__control"
            type="password"
            value={form.confirmPassword}
            placeholder="Повторите новый пароль"
            autoComplete="new-password"
            disabled={isSubmitting}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
          />
          <div className="account-modal__edit-actions">
            <button
              className="card__button account-form__submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button
              className="account-modal__favorites-button"
              type="button"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  )
}
