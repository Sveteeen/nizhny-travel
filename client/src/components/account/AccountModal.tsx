import { useEffect, useRef, useState } from 'react'
import { fetchMe, getApiErrorMessage, toPublicUser } from '../../api/auth'
import { ModalShell } from './ModalShell'
import { readAuthToken, saveSession } from './storage'
import type { PublicUser } from './types'

type AccountModalProps = {
  user: PublicUser
  onClose: () => void
  onUpdateProfile: (user: PublicUser) => void
  onOpenLogin: () => void
  onOpenRegister: () => void
  onOpenFavoritePlaces: () => void
  onOpenFavoriteRoutes: () => void
  favoritePlacesCount: number
  favoriteRoutesCount: number
}

export const AccountModal = ({
  user,
  onClose,
  onUpdateProfile,
  onOpenLogin,
  onOpenRegister,
  onOpenFavoritePlaces,
  onOpenFavoriteRoutes,
  favoritePlacesCount,
  favoriteRoutesCount,
}: AccountModalProps) => {
  const [profile, setProfile] = useState(user)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(true)
  const onUpdateProfileRef = useRef(onUpdateProfile)
  onUpdateProfileRef.current = onUpdateProfile

  useEffect(() => {
    setProfile(user)
  }, [user])

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
        const apiUser = await fetchMe(token)
        if (!mounted) return
        const publicUser = toPublicUser(apiUser)
        setProfile(publicUser)
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

  return (
    <ModalShell title="Личный кабинет" onClose={onClose}>
      {error && <p className="account-modal__state account-modal__state--error">{error}</p>}
      {isRefreshing && !error && (
        <p className="account-modal__state account-modal__state--muted">Обновление профиля…</p>
      )}

      {!error && (
        <div className="account-modal__profile">
          <p className="account-modal__name">{profile.name}</p>
          <p className="account-modal__email">{profile.email}</p>
          <div className="account-modal__favorites">
            <button
              className="account-modal__favorites-button"
              type="button"
              onClick={onOpenFavoritePlaces}
            >
              Избранные места
              {favoritePlacesCount > 0 && (
                <span className="account-modal__favorites-count">{favoritePlacesCount}</span>
              )}
            </button>
            <button
              className="account-modal__favorites-button"
              type="button"
              onClick={onOpenFavoriteRoutes}
            >
              Избранные маршруты
              {favoriteRoutesCount > 0 && (
                <span className="account-modal__favorites-count">{favoriteRoutesCount}</span>
              )}
            </button>
          </div>
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
    </ModalShell>
  )
}
