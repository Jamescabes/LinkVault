import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { DASHBOARD_TOUR_STEPS, type TourStep } from './tour-steps';
import { TourOverlay } from './TourOverlay';

interface TourContextValue {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep | null;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const STORAGE_KEY = 'linkvault_tour_completed';

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = DASHBOARD_TOUR_STEPS;
  const step = isActive ? steps[currentStep] || null : null;

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed) return;

    // Start tour after a short delay to let the dashboard render
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      completeTour();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, steps.length, completeTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: steps.length,
        step,
        startTour,
        nextStep,
        prevStep,
        skipTour,
      }}
    >
      {children}
      {isActive && step && <TourOverlay />}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
