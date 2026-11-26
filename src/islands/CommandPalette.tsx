import { useEffect } from 'preact/hooks';

interface Props {
  lang?: 'id' | 'en';
}

export default function CommandPalette({ lang = 'id' }: Props) {
  useEffect(() => {
    let modPromise: Promise<typeof import('../lib/commandPalette')> | null = null;
    const loadPalette = () => {
      if (!modPromise) modPromise = import('../lib/commandPalette');
      return modPromise;
    };

    const triggerOpen = async (sourceEl: HTMLElement | null) => {
      const mod = await loadPalette();
      mod.openCommandPalette(lang, sourceEl);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        void triggerOpen(document.activeElement as HTMLElement | null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-cmd-open]');
      if (!btn) return;
      e.preventDefault();
      void triggerOpen(btn);
    };

    const triggerBtn = document.querySelector<HTMLElement>('[data-cmd-open]');
    const prefetch = () => {
      void loadPalette();
    };
    triggerBtn?.addEventListener('pointerenter', prefetch, { once: true, passive: true });
    triggerBtn?.addEventListener('focusin', prefetch, { once: true, passive: true });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
    };
  }, [lang]);

  return null;
}
