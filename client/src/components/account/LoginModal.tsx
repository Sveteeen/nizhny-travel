import { useState, type FormEvent } from 'react'
import { getApiErrorMessage, login, toPublicUser } from '../../api/auth'
import { ModalShell } from './ModalShell'
import { saveSession } from './storage'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!email.trim() || !password) {
      setError('Введите почту и пароль.')
      return
    }

    try {
      setIsSubmitting(true)
      const { user, token } = await login(email, password)
      const publicUser = toPublicUser(user)
      saveSession({ token, user: publicUser })
      onSuccess(publicUser)
      setMessage('Успешный вход')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось войти. Проверьте данные и сервер.'))
    } finally {
      setIsSubmitting(false)
    }
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
          disabled={isSubmitting}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="filters__control"
          type="password"
          value={password}
          placeholder="Пароль"
          autoComplete="current-password"
          disabled={isSubmitting}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="card__button account-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Вход…' : 'Войти'}
        </button>
      </form>

      <p className="auth-modal__switch">
        Нет аккаунта?{' '}
        <button className="auth-modal__link" type="button" onClick={onOpenRegister} disabled={isSubmitting}>
          Зарегистрироваться
        </button>
      </p>
    </ModalShell>
  )
}
