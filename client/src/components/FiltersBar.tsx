import type { ReactNode } from 'react'

type FiltersBarProps = {
  searchPlaceholder: string
  searchLabel: string
  categoryLabel: string
  tagsLabel: string
  extraControl?: ReactNode
}

export const FiltersBar = ({ searchPlaceholder, searchLabel, categoryLabel, tagsLabel, extraControl }: FiltersBarProps) => (
  <section className="filters">
    <input className="filters__control" type="search" placeholder={searchPlaceholder} aria-label={searchLabel} />
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
