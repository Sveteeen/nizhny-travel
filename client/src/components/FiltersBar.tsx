type FiltersBarProps = {
  searchPlaceholder: string
  searchLabel: string
  categoryLabel: string
  tagsLabel: string
}

export const FiltersBar = ({ searchPlaceholder, searchLabel, categoryLabel, tagsLabel }: FiltersBarProps) => (
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
  </section>
)
