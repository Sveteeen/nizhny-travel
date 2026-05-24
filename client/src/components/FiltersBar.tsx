import { useMemo, useRef, type ReactNode } from 'react'
import { FilterSelect, type FilterSelectOption } from './FilterSelect'
import type { Category, Tag } from '../types'

type FiltersBarProps = {
  searchPlaceholder: string
  searchLabel: string
  categoryLabel?: string
  tagsLabel?: string
  categories?: Category[]
  tags?: Tag[]
  extraControl?: ReactNode
  compactSwitch?: boolean
  sortLabel?: string
  sortOptions?: FilterSelectOption[]
  onSortChange?: (value: string | null) => void
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
  compactSwitch = false,
  sortLabel,
  sortOptions,
  onSortChange,
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
    {onCategoryChange && (
      <FilterSelect
        label={categoryLabel ?? 'Категория'}
        placeholder="Все категории"
        options={categoryOptions}
        onChange={(value) => onCategoryChange(value ? Number(value) : null)}
      />
    )}
    {onTagChange && (
      <FilterSelect
        label={tagsLabel ?? 'Тег'}
        placeholder="Все теги"
        options={tagOptions}
        onChange={(value) => onTagChange(value ? Number(value) : null)}
      />
    )}
    {onSortChange && sortOptions && (
      <FilterSelect
        label={sortLabel ?? 'Сортировка'}
        placeholder="По умолчанию"
        options={sortOptions}
        onChange={onSortChange}
      />
    )}
    {extraControl && (
      <div
        className={
          compactSwitch
            ? 'filters__switch-slot filters__switch-slot--compact'
            : 'filters__control filters__control--switch'
        }
      >
        {extraControl}
      </div>
    )}
  </section>
  )
}
