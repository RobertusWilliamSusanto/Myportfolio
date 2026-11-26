import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { loadMotionMini, prefersReducedMotion } from '../lib/lazyMotion';

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
  const groupRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const syncIndicator = useCallback((filterId: string) => {
    const group = groupRef.current;
    const indicator = indicatorRef.current;
    const btn = chipRefs.current[filterId];
    if (!group || !indicator || !btn) return;
    const gRect = group.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    if (bRect.width === 0) return;
    const x = Math.round((bRect.left - gRect.left + 12) * 10) / 10;
    const y = Math.round((bRect.bottom - gRect.top - 2) * 10) / 10;
    const w = Math.max(12, Math.round((bRect.width - 24) * 10) / 10);
    indicator.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${w})`;
    indicator.style.opacity = '1';
  }, []);

  const applyFilterToGrid = useCallback((filterId: string, animateFlip: boolean) => {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-domain]'));
    const reducedMotion = prefersReducedMotion();

    // First: capture rects of currently visible cards before DOM filter mutation (FLIP)
    const prevRects = new Map<HTMLElement, DOMRect>();
    if (animateFlip && !reducedMotion) {
      cards.forEach((card) => {
        if (!card.hidden) prevRects.set(card, card.getBoundingClientRect());
      });
    }

    grid.setAttribute('data-active-filter', filterId);

    let shown = 0;
    const staying: HTMLElement[] = [];
    const entering: HTMLElement[] = [];

    cards.forEach((card) => {
      const domains = (card.getAttribute('data-domain') || '').trim().split(/\s+/).filter(Boolean);
      const matches = filterId === 'all' || domains.includes(filterId);
      const wasHidden = card.hidden;

      card.hidden = !matches;
      card.inert = !matches;
      card.classList.remove('filter-enter');

      if (matches) {
        shown += 1;
        card.removeAttribute('aria-hidden');
        card.classList.add('revealed');
        if (animateFlip && !reducedMotion) {
          if (!wasHidden && prevRects.has(card)) staying.push(card);
          else entering.push(card);
        }
      } else {
        card.setAttribute('aria-hidden', 'true');
      }
    });

    if (animateFlip && !reducedMotion && (staying.length > 0 || entering.length > 0)) {
      requestAnimationFrame(async () => {
        const flipMoves = staying
          .map((card) => {
            const prev = prevRects.get(card);
            const next = card.getBoundingClientRect();
            const dx = prev ? Math.round(prev.left - next.left) : 0;
            const dy = prev ? Math.round(prev.top - next.top) : 0;
            return { card, dx, dy };
          })
          .filter((m) => m.dx !== 0 || m.dy !== 0);

        const animate = await loadMotionMini();
        if (!animate) return;

        flipMoves.forEach(({ card, dx, dy }) => {
          animate(
            card,
            { transform: [`translate3d(${dx}px, ${dy}px, 0)`, 'translate3d(0, 0, 0)'] },
            { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
          );
        });
        entering.forEach((card, idx) => {
          animate(
            card,
            { opacity: [0, 1], transform: ['translate3d(0, 10px, 0) scale(0.985)', 'translate3d(0, 0, 0) scale(1)'] },
            { duration: 0.24, delay: Math.min(idx, 5) * 0.035, ease: [0.22, 1, 0.36, 1] }
          );
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
    syncIndicator('all');
  }, [applyFilterToGrid, syncIndicator]);

  useEffect(() => {
    syncIndicator(active);
    const onResize = () => syncIndicator(active);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [active, filters, syncIndicator]);

  useEffect(() => {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const onToggle = async (e: Event) => {
      const target = e.target as HTMLDetailsElement | null;
      if (!target || !target.classList.contains('project-peek-details') || !target.open) return;
      const body = target.querySelector<HTMLElement>('.peek-body');
      if (!body || prefersReducedMotion()) return;
      const animate = await loadMotionMini();
      if (animate) {
        animate(
          body,
          { opacity: [0, 1], transform: ['translate3d(0, -6px, 0)', 'translate3d(0, 0, 0)'] },
          { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        );
      }
    };
    grid.addEventListener('toggle', onToggle, { capture: true });
    return () => grid.removeEventListener('toggle', onToggle, { capture: true });
  }, []);

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
        ref={groupRef}
        class="relative flex flex-wrap items-center gap-2 pb-1"
        role="group"
        aria-label={ariaLabel}
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          class="filter-indicator-pill pointer-events-none"
        />
        <span class="font-mono text-[11px] uppercase tracking-wider text-outline mr-1 hidden sm:inline">
          FILTER:
        </span>
        {filters.map((f) => {
          const isActive = active === f.id;
          const labelText = f.label[lang] || f.label.id;
          return (
            <button
              key={f.id}
              ref={(el) => {
                chipRefs.current[f.id] = el;
              }}
              type="button"
              data-filter-btn={f.id}
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
