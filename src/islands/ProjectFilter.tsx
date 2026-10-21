import { useState, useEffect } from 'preact/hooks';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

const FILTERS: FilterOption[] = [
  { id: 'all', label: 'All Artifacts', count: 5 },
  { id: 'ai', label: 'AI & Vision', count: 1 },
  { id: 'backend', label: 'Backend & Cloud', count: 1 },
  { id: 'security', label: 'Security & Math', count: 1 },
  { id: 'web', label: 'Web Applications', count: 2 }
];

export default function ProjectFilter() {
  const [active, setActive] = useState<string>('all');

  const handleSelect = (filterId: string) => {
    setActive(filterId);
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.setAttribute('data-active-filter', filterId);
    }
  };

  useEffect(() => {
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.setAttribute('data-active-filter', 'all');
    }
  }, []);

  return (
    <div
      class="flex flex-wrap items-center gap-2 pt-2 pb-1"
      role="group"
      aria-label="Filter technical projects by domain"
    >
      <span class="font-mono text-[11px] uppercase tracking-wider text-outline mr-2 hidden sm:inline">
        FILTER:
      </span>
      {FILTERS.map(f => {
        const isActive = active === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => handleSelect(f.id)}
            class={`px-3 py-1.5 rounded-full font-mono text-xs transition-colors duration-200 flex items-center gap-1.5 min-h-[36px] ${
              isActive
                ? 'bg-secondary-container text-secondary-fixed border border-secondary/40 font-semibold shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant/30'
            }`}
            aria-pressed={isActive}
          >
            <span>{f.label}</span>
            <span
              class={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-secondary/20 text-secondary-fixed' : 'bg-surface-container-highest text-outline'
              }`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
