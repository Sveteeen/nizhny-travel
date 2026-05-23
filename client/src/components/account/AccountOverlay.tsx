import { useEffect, useState } from 'react'
import { AccountModal } from './AccountModal'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { clearStoredUser } from './storage'
import type { AccountView, PublicUser } from './types'

type AccountOverlayProps = {
  user: PublicUser | null
  onClose: () => void
  onAuthSuccess: (user: PublicUser) => void
  onLogout: () => void
  onUpdateProfile: (user: PublicUser) => void
  onOpenFavoritePlaces: () => void
  onOpenFavoriteRoutes: () => void
}

export const AccountOverlay = ({
  user,
  onClose,
  onAuthSuccess,
  onLogout,
  onUpdateProfile,
  onOpenFavoritePlaces,
  onOpenFavoriteRoutes,
}: AccountOverlayProps) => {
  const [view, setView] = useState<AccountView>(user ? 'cabinet' : 'login')

  useEffect(() => {
    setView(user ? 'cabinet' : 'login')
  }, [user])

  const handleAuthSuccess = (nextUser: PublicUser) => {
    onAuthSuccess(nextUser)
    setView('cabinet')
  }

  const handleLogout = () => {
    clearStoredUser()
    onLogout()
    setView('login')
  }

  if (view === 'login') {
    return (
      <LoginModal
        onClose={onClose}
        onSuccess={handleAuthSuccess}
        onOpenRegister={() => setView('register')}
      />
    )
  }

  if (view === 'register') {
    return (
      <RegisterModal
        onClose={onClose}
        onSuccess={handleAuthSuccess}
        onOpenLogin={() => setView('login')}
      />
    )
  }

  if (!user) {
    return (
      <LoginModal
        onClose={onClose}
        onSuccess={handleAuthSuccess}
        onOpenRegister={() => setView('register')}
      />
    )
  }

  return (
    <AccountModal
      user={user}
      onClose={onClose}
      onUpdateProfile={onUpdateProfile}
      onOpenLogin={handleLogout}
      onOpenRegister={() => {
        clearStoredUser()
        onLogout()
        setView('register')
      }}
      onOpenFavoritePlaces={onOpenFavoritePlaces}
      onOpenFavoriteRoutes={onOpenFavoriteRoutes}
      onLogout={handleLogout}
    />
  )
}
