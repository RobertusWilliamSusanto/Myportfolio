type AnimateFn = (typeof import('motion/mini'))['animate'];

let cachedModulePromise: Promise<{ animate: AnimateFn }> | null = null;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Lazy-load motion/mini strictly on demand after LCP / interaction.
 * Returns null when reduced motion is active or unavailable.
 */
export async function loadMotionMini(): Promise<AnimateFn | null> {
  if (typeof window === 'undefined' || prefersReducedMotion()) return null;
  if (!cachedModulePromise) {
    cachedModulePromise = import('motion/mini');
  }
  const mod = await cachedModulePromise;
  return mod.animate;
}

export async function lazyAnimate(
  target: Element | Element[],
  keyframes: Record<string, string | number | Array<string | number>>,
  options?: { duration?: number; delay?: number; easing?: string | number[] }
): Promise<void> {
  const animate = await loadMotionMini();
  if (!animate) return;
  const ctrl = animate(target, keyframes, options as Parameters<AnimateFn>[2]);
  if (ctrl && typeof ctrl.finished?.then === 'function') {
    await ctrl.finished.catch(() => {});
  }
}
