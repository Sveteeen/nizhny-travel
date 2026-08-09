import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type FilterSelectOption = {
  value: string
  label: string
}

type FilterSelectBaseProps = {
  label: string
  placeholder: string
  options: FilterSelectOption[]
}

type FilterSelectSingleProps = FilterSelectBaseProps & {
  multiple?: false
  onChange?: (value: string | null) => void
}

type FilterSelectMultipleProps = FilterSelectBaseProps & {
  multiple: true
  onChange?: (values: string[]) => void
}

type FilterSelectProps = FilterSelectSingleProps | FilterSelectMultipleProps

export const FilterSelect = (props: FilterSelectProps) => {
  const { label, placeholder, options, multiple = false, onChange } = props
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selectableOptions = useMemo(
    () => options.filter((option) => option.value !== ''),
    [options],
  )

  const clearOption = useMemo(
    () => options.find((option) => option.value === ''),
    [options],
  )

  const displayLabel = useMemo(() => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) {
        return selectableOptions.find((option) => option.value === selectedValues[0])?.label ?? placeholder
      }
      return `Выбрано: ${selectedValues.length}`
    }

    return options.find((option) => option.value === selectedValue)?.label ?? placeholder
  }, [multiple, options, placeholder, selectableOptions, selectedValue, selectedValues])

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

  const emitMultipleChange = (values: string[]) => {
    if (multiple && onChange) {
      ;(onChange as (values: string[]) => void)(values)
    }
  }

  const emitSingleChange = (value: string | null) => {
    if (!multiple && onChange) {
      ;(onChange as (value: string | null) => void)(value)
    }
  }

  const handleSelect = (value: string) => {
    if (multiple) {
      if (value === '') {
        setSelectedValues([])
        emitMultipleChange([])
        return
      }

      const next = selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]
      setSelectedValues(next)
      emitMultipleChange(next)
      return
    }

    setSelectedValue(value)
    emitSingleChange(value ? value : null)
    setIsOpen(false)
  }

  const isOptionSelected = (value: string) => {
    if (multiple) {
      if (value === '') return selectedValues.length === 0
      return selectedValues.includes(value)
    }
    return value === selectedValue
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
        <span className="filter-select__value">{displayLabel}</span>
        <span className="filter-select__chevron" aria-hidden />
      </button>

      {isOpen && (
        <ul
          className="filter-select__menu"
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiple || undefined}
        >
          {(clearOption ? [clearOption, ...selectableOptions] : selectableOptions).map((option) => {
            const isSelected = isOptionSelected(option.value)
            return (
              <li key={option.value || 'all'} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`filter-select__option ${multiple ? 'filter-select__option--multi' : ''} ${isSelected ? 'filter-select__option--active' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {multiple && (
                    <span
                      className={`filter-select__check ${isSelected ? 'filter-select__check--on' : ''}`}
                      aria-hidden
                    />
                  )}
                  <span>{option.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
