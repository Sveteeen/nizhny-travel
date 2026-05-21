import { useState, type FormEvent } from 'react'
import { ModalShell } from './ModalShell'
import { normalizeEmail, readStoredUser } from './storage'
import type { PublicUser } from './types'

type LoginModalProps = {
  onClose: () => void
  onSuccess: (user: PublicUser) => void
  onOpenRegister: () => void
}

export const LoginModal = ({ onClose, onSuccess, onOpenRegister }: LoginModalProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    onSuccess({ name: stored.name, email: stored.email })
    setMessage('Успешный вход')
  }

  return (
    <ModalShell title="Вход" onClose={onClose}>
      {error && <p className="account-modal__state account-modal__state--error">{error}</p>}
      {message && <p className="account-modal__state">{message}</p>}

      <form className="account-form" onSubmit={handleLogin}>
        <input
          className="filters__control"
          type="email"
          value={email}
          placeholder="Email"
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="filters__control"
          type="password"
          value={password}
          placeholder="Пароль"
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="card__button account-form__submit" type="submit">
          Войти
        </button>
      </form>

      <p className="auth-modal__switch">
        Нет аккаунта?{' '}
        <button className="auth-modal__link" type="button" onClick={onOpenRegister}>
          Зарегистрироваться
        </button>
      </p>
    </ModalShell>
  )
}
