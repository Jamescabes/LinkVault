import { useEffect, useRef, useState } from 'react';
import { useTour } from './TourProvider';
import { Button } from '../ui/Button';

interface TourTooltipProps {
  targetRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

const GAP = 16;
const TOOLTIP_WIDTH = 320;

export function TourTooltip({ targetRect }: TourTooltipProps) {
  const { step, currentStep, totalSteps, nextStep, prevStep, skipTour } =
    useTour();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!step || !tooltipRef.current) return;

    const tooltipHeight = tooltipRef.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0;
    let left = 0;

    const placement = step.placement;

    // Calculate initial position based on placement
    if (placement === 'bottom') {
      top = targetRect.top + targetRect.height + GAP;
      left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
    } else if (placement === 'top') {
      top = targetRect.top - tooltipHeight - GAP;
      left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
    } else if (placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left + targetRect.width + GAP;
    } else if (placement === 'left') {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - TOOLTIP_WIDTH - GAP;
    }

    // Flip if overflowing
    if (top + tooltipHeight > vh - 16) {
      top = targetRect.top - tooltipHeight - GAP;
    }
    if (top < 16) {
      top = targetRect.top + targetRect.height + GAP;
    }

    // Horizontal bounds
    left = Math.max(16, Math.min(left, vw - TOOLTIP_WIDTH - 16));

    setPosition({ top, left });
  }, [step, targetRect]);

  if (!step) return null;

  const isLast = currentStep >= totalSteps - 1;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] bg-surface rounded-2xl shadow-xl border border-border/50 p-5 transition-all duration-300"
      style={{
        top: position.top,
        left: position.left,
        width: TOOLTIP_WIDTH,
        pointerEvents: 'auto',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-colors ${
              i <= currentStep ? 'bg-accent' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-text-tertiary mb-1">
        Step {currentStep + 1} of {totalSteps}
      </p>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        {step.title}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {step.description}
      </p>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={skipTour}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button variant="secondary" size="sm" onClick={prevStep}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={nextStep}>
            {isLast ? 'Done' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
