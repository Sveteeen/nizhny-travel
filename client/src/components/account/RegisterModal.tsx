import { useState, type FormEvent } from 'react'
import { getApiErrorMessage, register, toPublicUser } from '../../api/auth'
import { ModalShell } from './ModalShell'
import { normalizeEmail, saveSession } from './storage'
import type { PublicUser } from './types'

type RegisterModalProps = {
  onClose: () => void
  onSuccess: (user: PublicUser) => void
  onOpenLogin: () => void
}

export const RegisterModal = ({ onClose, onSuccess, onOpenLogin }: RegisterModalProps) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) {
      setError('Введите email')
      return
    }
    if (!password) {
      setError('Введите пароль')
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

    try {
      setIsSubmitting(true)
      const { user, token } = await register({
        email: normalizedEmail,
        password,
        name: name.trim() || undefined,
      })
      const publicUser = toPublicUser(user)
      saveSession({ token, user: publicUser })
      onSuccess(publicUser)
      setMessage('Профиль создан, вы вошли в систему')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось зарегистрироваться.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalShell title="Регистрация" onClose={onClose}>
      {error && <p className="account-modal__state account-modal__state--error">{error}</p>}
      {message && <p className="account-modal__state">{message}</p>}

      <form className="account-form" onSubmit={handleRegister}>
        <input
          className="filters__control"
          type="text"
          value={name}
          placeholder="Имя"
          autoComplete="name"
          disabled={isSubmitting}
          onChange={(event) => setName(event.target.value)}
        />
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
          placeholder="Пароль (минимум 6 символов)"
          autoComplete="new-password"
          disabled={isSubmitting}
          onChange={(event) => setPassword(event.target.value)}
        />
        <input
          className="filters__control"
          type="password"
          value={confirmPassword}
          placeholder="Повторите пароль"
          autoComplete="new-password"
          disabled={isSubmitting}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <button className="card__button account-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Регистрация…' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="auth-modal__switch">
        Уже есть аккаунт?{' '}
        <button className="auth-modal__link" type="button" onClick={onOpenLogin} disabled={isSubmitting}>
          Войти
        </button>
      </p>
    </ModalShell>
  )
}
