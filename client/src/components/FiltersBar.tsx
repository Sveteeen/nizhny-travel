import { useMemo, useRef, type ReactNode } from 'react'
import { FilterSelect } from './FilterSelect'
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

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Все категории' },
      ...(categories?.map((cat) => ({ value: String(cat.id), label: cat.name })) ?? []),
    ],
    [categories],
  )

  const tagOptions = useMemo(
    () => [
      { value: '', label: 'Все теги' },
      ...(tags?.map((tag) => ({ value: String(tag.id), label: tag.name })) ?? []),
    ],
    [tags],
  )

  return (
  <section className="filters">
    <input
      className="filters__control"
      type="search"
      placeholder={searchPlaceholder}
      aria-label={searchLabel}
      onChange={(e) => handleSearchChange(e.target.value)}
    />
    <FilterSelect
      label={categoryLabel}
      placeholder="Все категории"
      options={categoryOptions}
      onChange={(value) => onCategoryChange?.(value ? Number(value) : null)}
    />
    <FilterSelect
      label={tagsLabel}
      placeholder="Все теги"
      options={tagOptions}
      onChange={(value) => onTagChange?.(value ? Number(value) : null)}
    />
    {extraControl && <div className="filters__control filters__control--switch">{extraControl}</div>}
  </section>
  )
}
