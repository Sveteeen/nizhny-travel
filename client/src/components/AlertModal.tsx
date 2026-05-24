type AlertModalProps = {
  message: string
  onClose: () => void
  actionLabel?: string
  onAction?: () => void
  onRegister?: () => void
}

export const AlertModal = ({
  message,
  onClose,
  actionLabel,
  onAction,
  onRegister,
}: AlertModalProps) => (
  <div className="modal" onClick={onClose} role="presentation">
    <div
      className="modal__content alert-modal"
      onClick={(event) => event.stopPropagation()}
      role="alertdialog"
      aria-labelledby="alert-modal-message"
      aria-modal="true"
    >
      <button className="modal__close" type="button" onClick={onClose} aria-label="Закрыть">
        ×
      </button>
      <p id="alert-modal-message" className="alert-modal__message">
        {message}
      </p>
      {actionLabel && onAction && (
        <button className="card__button alert-modal__action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {onRegister && (
        <p className="auth-modal__switch">
          Нет аккаунта?{' '}
          <button className="auth-modal__link" type="button" onClick={onRegister}>
            Зарегистрироваться
          </button>
        </p>
      )}
    </div>
  </div>
)
