import { useRef, type ReactNode } from 'react'

type FiltersBarProps = {
  searchPlaceholder: string
  searchLabel: string
  categoryLabel: string
  tagsLabel: string
  extraControl?: ReactNode
  onSearchChange?: (query: string) => void
}

export const FiltersBar = ({ searchPlaceholder, searchLabel, categoryLabel, tagsLabel, extraControl, onSearchChange }: FiltersBarProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = (value: string) => {
    if (!onSearchChange) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearchChange(value), 350)
  }

  return (
  <section className="filters">
    <input
      className="filters__control"
      type="search"
      placeholder={searchPlaceholder}
      aria-label={searchLabel}
      onChange={(e) => handleSearchChange(e.target.value)}
    />
    <select className="filters__control" aria-label={categoryLabel} defaultValue="">
      <option value="" disabled>
        Категория
      </option>
    </select>
    <select className="filters__control" aria-label={tagsLabel} defaultValue="">
      <option value="" disabled>
        Теги
      </option>
    </select>
    {extraControl && <div className="filters__control filters__control--switch">{extraControl}</div>}
  </section>
  )
}
