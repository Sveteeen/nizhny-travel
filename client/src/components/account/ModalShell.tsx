import type { ReactNode } from 'react'

type ModalShellProps = {
  title: string
  onClose: () => void
  children: ReactNode
  headerExtra?: ReactNode
}

export const ModalShell = ({ title, onClose, children, headerExtra }: ModalShellProps) => (
  <div className="modal" onClick={onClose}>
    <div className="modal__content account-modal" onClick={(event) => event.stopPropagation()}>
      {headerExtra}
      <button className="modal__close" type="button" onClick={onClose} aria-label="Закрыть">
        ×
      </button>
      <div className="account-modal__header">
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  </div>
)
