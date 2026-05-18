import { useRef, type ReactNode } from 'react'
import type { Category, Tag } from '../types'

type FiltersBarProps = {
  searchPlaceholder: string
  searchLabel: string
  categoryLabel: string
  tagsLabel: string
  categories?: Category[]
  tags?: Tag[]
  extraControl?: ReactNode
  onSearchChange?: (query: string) => void
  onCategoryChange?: (categoryId: number | null) => void
  onTagChange?: (tagId: number | null) => void
}

export const FiltersBar = ({
  searchPlaceholder,
  searchLabel,
  categoryLabel,
  tagsLabel,
  categories,
  tags,
  extraControl,
  onSearchChange,
  onCategoryChange,
  onTagChange,
}: FiltersBarProps) => {
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
    <select
      className="filters__control"
      aria-label={categoryLabel}
      defaultValue=""
      onChange={(e) => onCategoryChange?.(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">Все категории</option>
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
    <select
      className="filters__control"
      aria-label={tagsLabel}
      defaultValue=""
      onChange={(e) => onTagChange?.(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">Все теги</option>
      {tags?.map((tag) => (
        <option key={tag.id} value={tag.id}>{tag.name}</option>
      ))}
    </select>
    {extraControl && <div className="filters__control filters__control--switch">{extraControl}</div>}
  </section>
  )
}
