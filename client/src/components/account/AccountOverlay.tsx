import { useState, type SyntheticEvent } from 'react'
import { AccountModal } from './AccountModal'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { clearStoredUser } from './storage'
import type { PublicUser } from './types'

type AccountOverlayProps = {
  user: PublicUser | null
  initialView?: 'login' | 'register'
  onClose: () => void
  onAuthSuccess: (user: PublicUser) => void
  onLogout: () => void
  onUpdateProfile: (user: PublicUser) => void
  onOpenFavoritePlaces: () => void
  onOpenFavoriteRoutes: () => void
  onOpenPlanner: () => void
  onOpenSavedRoute: (routeId: number) => void
  normalizeImageUrl: (value: string) => string
  onImageError: (event: SyntheticEvent<HTMLImageElement, Event>) => void
  formatDuration: (value: number | string) => string
  formatDistance: (value: number | string) => string
}

export const AccountOverlay = ({
  user,
  initialView = 'login',
  onClose,
  onAuthSuccess,
  onLogout,
  onUpdateProfile,
  onOpenFavoritePlaces,
  onOpenFavoriteRoutes,
  onOpenPlanner,
  onOpenSavedRoute,
  normalizeImageUrl,
  onImageError,
  formatDuration,
  formatDistance,
}: AccountOverlayProps) => {
  const [authView, setAuthView] = useState<'login' | 'register'>(initialView)

  const handleAuthSuccess = (nextUser: PublicUser) => {
    onAuthSuccess(nextUser)
  }

  const handleLogout = () => {
    clearStoredUser()
    onLogout()
    setAuthView('login')
  }

  if (user) {
    return (
      <AccountModal
        user={user}
        onClose={onClose}
        onUpdateProfile={onUpdateProfile}
        onOpenLogin={handleLogout}
        onOpenRegister={() => {
          clearStoredUser()
          onLogout()
          setAuthView('register')
        }}
        onOpenFavoritePlaces={onOpenFavoritePlaces}
        onOpenFavoriteRoutes={onOpenFavoriteRoutes}
        onOpenPlanner={onOpenPlanner}
        onOpenSavedRoute={onOpenSavedRoute}
        normalizeImageUrl={normalizeImageUrl}
        onImageError={onImageError}
        formatDuration={formatDuration}
        formatDistance={formatDistance}
        onLogout={handleLogout}
      />
    )
  }

  if (authView === 'register') {
    return (
      <RegisterModal
        onClose={onClose}
        onSuccess={handleAuthSuccess}
        onOpenLogin={() => setAuthView('login')}
      />
    )
  }

  return (
    <LoginModal
      onClose={onClose}
      onSuccess={handleAuthSuccess}
      onOpenRegister={() => setAuthView('register')}
    />
  )
}
