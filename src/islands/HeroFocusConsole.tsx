import { useState, useRef } from 'preact/hooks';
import { lazyAnimate } from '../lib/lazyMotion';

export interface ConsoleTab {
  id: string;
  label: string;
  heading: string;
  items: string[];
  actionLabel?: string;
  triggerId?: string;
}

interface Props {
  lang?: 'id' | 'en';
  tabs: ConsoleTab[];
}

export default function HeroFocusConsole({ lang = 'id', tabs }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = async (nextIdx: number, moveFocus = false) => {
    const bounded = (nextIdx + tabs.length) % tabs.length;
    if (moveFocus) tabRefs.current[bounded]?.focus();
    if (bounded === activeIdx) return;
    setActiveIdx(bounded);
    if (panelRef.current) {
      await lazyAnimate(
        panelRef.current,
        { opacity: [0.35, 1], transform: ['translateY(6px)', 'translateY(0px)'] },
        { duration: 0.22 }
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      void selectTab(idx + 1, true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      void selectTab(idx - 1, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      void selectTab(0, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      void selectTab(tabs.length - 1, true);
    }
  };

  const active = tabs[activeIdx] || tabs[0];
  const ariaTablist = lang === 'id' ? 'Fokus keahlian portofolio' : 'Portfolio engineering focus';

  return (
    <div
      id="hero-focus-console"
      class="mt-7 w-full max-w-2xl rounded-xl bg-surface-container-low/95 border border-outline-variant/40 p-4 text-left shadow-lg"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant/20">
        <div class="flex flex-wrap items-center gap-1.5" role="tablist" aria-label={ariaTablist}>
          {tabs.map((tab, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                id={`hero-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls="hero-tabpanel"
                tabIndex={isSelected ? 0 : -1}
                onClick={() => void selectTab(idx, false)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                class={`btn-interactive px-3 py-2 rounded-md font-mono text-[11px] min-h-[44px] cursor-pointer ${
                  isSelected
                    ? 'bg-secondary-container text-secondary-fixed font-semibold border border-secondary/40'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {active.actionLabel && active.triggerId && (
          <button
            type="button"
            data-project-trigger={active.triggerId}
            class="btn-interactive font-mono text-[11px] text-secondary hover:underline px-2 py-2 min-h-[44px] cursor-pointer"
          >
            {active.actionLabel}
          </button>
        )}
      </div>

      <div
        ref={panelRef}
        id="hero-tabpanel"
        role="tabpanel"
        aria-labelledby={`hero-tab-${active.id}`}
        tabIndex={0}
        class="pt-3 min-h-[108px] flex flex-col gap-1.5 focus-visible:outline-2 focus-visible:outline-secondary rounded"
      >
        <div class="font-mono text-xs text-secondary font-semibold">{active.heading}</div>
        {active.items.map((item, idx) => (
          <div key={idx} class="text-xs sm:text-sm text-on-surface-variant leading-relaxed flex items-start gap-2">
            <span class="text-secondary font-mono shrink-0" aria-hidden="true">&gt;</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
