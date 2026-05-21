import { useState, type FormEvent } from 'react'
import { ModalShell } from './ModalShell'
import { normalizeEmail, saveStoredUser } from './storage'
import type { PublicUser, StoredUser } from './types'

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
    saveStoredUser(nextUser)
    onSuccess({ name: nextUser.name, email: nextUser.email })
    setMessage('Профиль создан, вы вошли в систему')
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
          onChange={(event) => setName(event.target.value)}
        />
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
          placeholder="Пароль (минимум 6 символов)"
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <input
          className="filters__control"
          type="password"
          value={confirmPassword}
          placeholder="Повторите пароль"
          autoComplete="new-password"
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <button className="card__button account-form__submit" type="submit">
          Зарегистрироваться
        </button>
      </form>

      <p className="auth-modal__switch">
        Уже есть аккаунт?{' '}
        <button className="auth-modal__link" type="button" onClick={onOpenLogin}>
          Войти
        </button>
      </p>
    </ModalShell>
  )
}
