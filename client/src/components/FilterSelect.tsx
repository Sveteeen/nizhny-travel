import { useEffect, useId, useRef, useState } from 'react'

export type FilterSelectOption = {
  value: string
  label: string
}

type FilterSelectProps = {
  label: string
  placeholder: string
  options: FilterSelectOption[]
  onChange?: (value: string | null) => void
}

export const FilterSelect = ({ label, placeholder, options, onChange }: FilterSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selectedOption = options.find((option) => option.value === selectedValue)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    onChange?.(value ? value : null)
    setIsOpen(false)
  }

  return (
    <div className={`filter-select ${isOpen ? 'filter-select--open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="filters__control filter-select__trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="filter-select__value">{selectedOption?.label ?? placeholder}</span>
        <span className="filter-select__chevron" aria-hidden />
      </button>

      {isOpen && (
        <ul className="filter-select__menu" id={listboxId} role="listbox" aria-label={label}>
          {options.map((option) => {
            const isSelected = option.value === selectedValue
            return (
              <li key={option.value || 'all'} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`filter-select__option ${isSelected ? 'filter-select__option--active' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
