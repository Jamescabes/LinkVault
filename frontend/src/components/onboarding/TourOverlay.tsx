import { useEffect, useState, useCallback } from 'react';
import { useTour } from './TourProvider';
import { TourTooltip } from './TourTooltip';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const { step } = useTour();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const updatePosition = useCallback(() => {
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [step]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  if (!step) return null;

  const pad = 8;
  const r = 12;

  return (
    <div className="fixed inset-0 z-[9998]" style={{ pointerEvents: 'auto' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - pad}
                y={targetRect.top - pad}
                width={targetRect.width + 2 * pad}
                height={targetRect.height + 2 * pad}
                rx={r}
                ry={r}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.45)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border ring */}
      {targetRect && (
        <div
          className="absolute rounded-xl ring-2 ring-accent ring-offset-2 transition-all duration-300"
          style={{
            top: targetRect.top - pad,
            left: targetRect.left - pad,
            width: targetRect.width + 2 * pad,
            height: targetRect.height + 2 * pad,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip */}
      {targetRect && <TourTooltip targetRect={targetRect} />}
    </div>
  );
}
