type AlertModalProps = {
  message: string
  onClose: () => void
}

export const AlertModal = ({ message, onClose }: AlertModalProps) => (
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
    </div>
  </div>
)
