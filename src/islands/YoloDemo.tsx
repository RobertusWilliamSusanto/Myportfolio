import { useState, useRef, useCallback, useEffect } from 'preact/hooks';

export default function YoloDemo() {
  const [sliderPos, setSliderPos] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSliderPos(0);
    }
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(Math.round(clamped * 10) / 10);
  }, []);

  const handlePointerDown = (e: PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos(prev => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos(prev => Math.min(100, prev + 5));
    }
  };

  return (
    <div
      ref={containerRef}
      class="relative w-full aspect-[16/9] bg-surface-container-lowest overflow-hidden border-t border-outline-variant/20 select-none group/yolo cursor-ew-resize"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="region"
      aria-label="Interactive YOLO Model Comparison Slider"
    >
      {/* 1. Underlying Raw Layer (Filter applied to demonstrate pre-processed tensor input) */}
      <div class="absolute inset-0 w-full h-full">
        <picture>
          <source srcset="/images/project-ai-1200.avif 1200w, /images/project-ai-800.avif 800w, /images/project-ai-480.avif 480w" sizes="(max-width: 1024px) 100vw, 800px" type="image/avif" />
          <source srcset="/images/project-ai-1200.webp 1200w, /images/project-ai-800.webp 800w, /images/project-ai-480.webp 480w" sizes="(max-width: 1024px) 100vw, 800px" type="image/webp" />
          <img
            src="/project-ai.jpg"
            alt="Raw input image"
            width={800}
            height={450}
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover object-center filter saturate-50 contrast-95 opacity-75"
          />
        </picture>
        <div class="absolute top-3 left-4 px-2 py-0.5 rounded bg-surface-container-highest/80 backdrop-blur-md text-[10px] font-mono text-on-surface-variant font-medium pointer-events-none">
          INPUT TENSOR [640x640]
        </div>
      </div>

      {/* 2. Overlying Detected Layer with Compositor clip-path reveal */}
      <div
        class="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <picture>
          <source srcset="/images/project-ai-1200.avif 1200w, /images/project-ai-800.avif 800w, /images/project-ai-480.avif 480w" sizes="(max-width: 1024px) 100vw, 800px" type="image/avif" />
          <source srcset="/images/project-ai-1200.webp 1200w, /images/project-ai-800.webp 800w, /images/project-ai-480.webp 480w" sizes="(max-width: 1024px) 100vw, 800px" type="image/webp" />
          <img
            src="/project-ai.jpg"
            alt="Visualization of YOLO object detection bounding boxes on disease dataset"
            width={800}
            height={450}
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100"
          />
        </picture>

        {/* Gradient shadow overlay */}
        <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent pointer-events-none"></div>

        <div class="absolute top-3 right-4 px-2 py-0.5 rounded bg-secondary-container/90 backdrop-blur-md text-[10px] font-mono text-secondary-fixed font-semibold pointer-events-none border border-secondary/30">
          YOLO DETECTIONS (&gt;90%)
        </div>
      </div>

      {/* 3. Draggable Split Line Handle */}
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-secondary shadow-[0_0_8px_rgba(52,211,153,0.8)] pointer-events-none z-20"
        style={{ left: `${sliderPos}%` }}
      >
        <div
          class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-surface-container-highest border border-secondary text-secondary flex items-center justify-center shadow-lg pointer-events-auto cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          tabIndex={0}
          role="slider"
          aria-label="Comparison slider position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
          onKeyDown={handleKeyDown}
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" transform="rotate(180 12 12) translate(-3, 0)" />
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" transform="translate(3, 0)" />
          </svg>
        </div>
      </div>

      {/* 4. Bottom Metric Badge */}
      <div class="absolute bottom-4 right-6 flex items-center justify-end z-10 pointer-events-none">
        <span class="px-2.5 py-1 rounded bg-secondary-container/90 text-secondary-fixed font-mono text-[11px] font-semibold border border-secondary/30 shadow">
          &gt;90% Precision
        </span>
      </div>
    </div>
  );
}
