import { useState, useEffect, useCallback } from 'preact/hooks';

interface FilterOption {
  id: string;
  label: { id: string; en: string };
  count: number;
}

const DEFAULT_FILTERS: FilterOption[] = [
  { id: 'all', label: { id: 'Semua Artefak', en: 'All Artifacts' }, count: 6 },
  { id: 'ai', label: { id: 'AI & Vision', en: 'AI & Vision' }, count: 1 },
  { id: 'backend', label: { id: 'Backend & Cloud', en: 'Backend & Cloud' }, count: 2 },
  { id: 'security', label: { id: 'Security & Math', en: 'Security & Math' }, count: 1 },
  { id: 'web', label: { id: 'Aplikasi Web', en: 'Web Applications' }, count: 3 }
];

interface Props {
  lang?: 'id' | 'en';
}

export default function ProjectFilter({ lang = 'id' }: Props) {
  const [active, setActive] = useState<string>('all');
  const [filters, setFilters] = useState<FilterOption[]>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [totalCount, setTotalCount] = useState<number>(6);

  const applyFilterToGrid = useCallback((filterId: string, animate: boolean) => {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.setAttribute('data-active-filter', filterId);
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-domain]'));
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let shown = 0;
    const toAnimate: HTMLElement[] = [];

    cards.forEach((card) => {
      const domains = (card.getAttribute('data-domain') || '').trim().split(/\s+/).filter(Boolean);
      const matches = filterId === 'all' || domains.includes(filterId);

      card.hidden = !matches;
      card.inert = !matches;
      card.classList.remove('filter-enter');

      if (matches) {
        shown += 1;
        card.removeAttribute('aria-hidden');
        // Ensure below-the-fold cards brought into view by filtering are never trapped at opacity: 0
        card.classList.add('revealed');
        if (animate && !reducedMotion) {
          toAnimate.push(card);
        }
      } else {
        card.setAttribute('aria-hidden', 'true');
      }
    });

    if (toAnimate.length > 0) {
      requestAnimationFrame(() => {
        toAnimate.forEach((card, idx) => {
          card.style.setProperty('--filter-stagger', `${Math.min(idx, 5) * 40}ms`);
          card.classList.add('filter-enter');
        });
      });
    }

    setVisibleCount(shown);
    setTotalCount(cards.length);
  }, []);

  const handleSelect = (filterId: string) => {
    if (filterId === active) return;
    setActive(filterId);
    applyFilterToGrid(filterId, true);
  };

  useEffect(() => {
    const grid = document.getElementById('projects-grid');
    if (grid) {
      const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-domain]'));
      if (cards.length > 0) {
        setFilters(
          DEFAULT_FILTERS.map((f) => ({
            ...f,
            count:
              f.id === 'all'
                ? cards.length
                : cards.filter((c) => (c.getAttribute('data-domain') || '').split(/\s+/).includes(f.id)).length
          }))
        );
      }
    }
    applyFilterToGrid('all', false);
  }, [applyFilterToGrid]);

  const ariaLabel = lang === 'id' ? 'Filter proyek teknis berdasarkan domain' : 'Filter technical projects by domain';
  const activeOption = filters.find((f) => f.id === active) || filters[0];
  const activeLabel = activeOption.label[lang] || activeOption.label.id;
  const statusText =
    lang === 'id'
      ? `Menampilkan ${visibleCount} dari ${totalCount} proyek (${activeLabel})`
      : `Showing ${visibleCount} of ${totalCount} projects (${activeLabel})`;

  return (
    <div class="flex flex-col gap-2 pt-2 pb-1">
      <div
        class="flex flex-wrap items-center gap-2"
        role="group"
        aria-label={ariaLabel}
      >
        <span class="font-mono text-[11px] uppercase tracking-wider text-outline mr-1 hidden sm:inline">
          FILTER:
        </span>
        {filters.map((f) => {
          const isActive = active === f.id;
          const labelText = f.label[lang] || f.label.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => handleSelect(f.id)}
              class={`px-3.5 py-2 rounded-full font-mono text-xs transition-colors duration-200 flex items-center gap-2 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                isActive
                  ? 'bg-secondary-container text-secondary-fixed border border-secondary/50 font-semibold shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant/40'
              }`}
              aria-pressed={isActive}
            >
              <span>{labelText}</span>
              <span
                class={`text-[11px] px-1.5 py-0.5 rounded-full leading-none font-semibold ${
                  isActive
                    ? 'bg-secondary/20 text-secondary-fixed'
                    : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>
      <p
        class="font-mono text-[11px] text-on-surface-variant m-0"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusText}
      </p>
    </div>
  );
}
