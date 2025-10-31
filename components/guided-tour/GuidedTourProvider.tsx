'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useUser } from '@/lib/hooks/useUser';

type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export interface GuidedTourStep {
  id: string;
  selector: string;
  title: string;
  description: string;
  path?: string;
  placement?: Placement;
  autoScroll?: boolean;
  advanceAction?: 'click-target';
}

export interface GuidedTourDefinition {
  id: string;
  steps: GuidedTourStep[];
  meta?: {
    title?: string;
    version?: string;
  };
}

interface StoredProgress {
  completed: boolean;
  completedAt: string;
  version?: string;
}

type ProgressState = Record<string, StoredProgress>;

interface GuidedTourContextValue {
  registerTour: (definition: GuidedTourDefinition) => () => void;
  startTour: (tourId: string) => void;
  restartTour: (tourId: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  activeTourId: string | null;
  activeStepIndex: number;
  activeStep: GuidedTourStep | null;
  isActive: boolean;
  hasCompleted: (tourId: string) => boolean;
  resetProgress: (tourId: string) => void;
}

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

const STORAGE_KEY = 'comunimo-guided-tour-state';

const DEFAULT_PLACEMENT: Placement = 'auto';

interface RectState {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

function extractRect(rect: DOMRect): RectState {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function readProgressStorage(userKey: string): ProgressState {
  if (typeof window === 'undefined') return {};

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, ProgressState>;
    return parsed[userKey] ?? {};
  } catch (error) {
    console.warn('[GuidedTour] Unable to parse stored progress', error);
    return {};
  }
}

function writeProgressStorage(userKey: string, progress: ProgressState) {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const payload = raw ? JSON.parse(raw) : {};
    payload[userKey] = progress;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[GuidedTour] Unable to persist progress', error);
  }
}

interface GuidedTourProviderProps {
  children: ReactNode;
}

export function GuidedTourProvider({ children }: GuidedTourProviderProps) {
  const { profile } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const userKey = profile?.id ?? 'anonymous';

  const toursRef = useRef<Map<string, GuidedTourDefinition>>(new Map());
  const [progress, setProgress] = useState<ProgressState>({});
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [targetRect, setTargetRect] = useState<RectState | null>(null);
  const [targetReady, setTargetReady] = useState(false);

  const targetElementRef = useRef<HTMLElement | null>(null);
  const pendingNavigationRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const stored = readProgressStorage(userKey);
    setProgress(stored);
  }, [userKey, isMounted]);

  const saveProgress = useCallback(
    (next: ProgressState) => {
      setProgress(next);
      writeProgressStorage(userKey, next);
    },
    [userKey],
  );

  const activeTour = activeTourId ? toursRef.current.get(activeTourId) ?? null : null;
  const activeStep: GuidedTourStep | null =
    activeTour && activeStepIndex >= 0 && activeStepIndex < activeTour.steps.length
      ? activeTour.steps[activeStepIndex] ?? null
      : null;

  const hasCompleted = useCallback(
    (tourId: string) => {
      const tour = toursRef.current.get(tourId);
      const entry = progress[tourId];
      if (!tour || !entry) return false;
      if (!entry.completed) return false;
      if (tour.meta?.version && entry.version && tour.meta.version !== entry.version) {
        return false;
      }
      return true;
    },
    [progress],
  );

  const registerTour = useCallback((definition: GuidedTourDefinition) => {
    if (!definition.id) {
      throw new Error('GuidedTour: definition requires a valid id');
    }
    if (definition.steps.length === 0) {
      throw new Error(`GuidedTour: tour ${definition.id} requires at least one step`);
    }

    toursRef.current.set(definition.id, definition);

    return () => {
      const current = toursRef.current.get(definition.id);
      if (current === definition) {
        toursRef.current.delete(definition.id);
      }
    };
  }, []);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setActiveTourId(null);
    setActiveStepIndex(0);
    setTargetRect(null);
    setTargetReady(false);
    targetElementRef.current = null;
  }, []);

  const completeTour = useCallback(() => {
    if (!activeTourId) return;
    const tour = toursRef.current.get(activeTourId);
    if (!tour) return;

    saveProgress({
      ...progress,
      [activeTourId]: {
        completed: true,
        completedAt: new Date().toISOString(),
        version: tour.meta?.version,
      },
    });
    stopTour();
  }, [activeTourId, progress, saveProgress, stopTour]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;

    const currentStep = activeTour.steps[activeStepIndex];

    if (currentStep?.id === 'registration-select-society') {
      const registrationButton = document.querySelector('[data-tour-anchor="championship-new-registration"]') as HTMLElement | null;
      if (!registrationButton) {
        const selectorTarget = targetElementRef.current;
        if (selectorTarget) {
          selectorTarget.classList.add('animate-pulse');
          window.dispatchEvent(new CustomEvent('guided-tour-society-open-request'));
          window.setTimeout(() => selectorTarget.classList.remove('animate-pulse'), 600);
        }
        return;
      }
    }
    if (currentStep?.advanceAction === 'click-target') {
      const target = targetElementRef.current ?? (currentStep.selector
        ? (document.querySelector(currentStep.selector) as HTMLElement | null)
        : null);
      if (target && typeof target.click === 'function') {
        pendingNavigationRef.current = true;
        target.click();
      }
    }

    const nextIndex = activeStepIndex + 1;
    if (nextIndex >= activeTour.steps.length) {
      completeTour();
      return;
    }
    setActiveStepIndex(nextIndex);
  }, [activeTour, activeStepIndex, completeTour]);

  const previousStep = useCallback(() => {
    if (!activeTour) return;
    setActiveStepIndex((index) => Math.max(0, index - 1));
  }, [activeTour]);

  const startTour = useCallback(
    (tourId: string) => {
      const tour = toursRef.current.get(tourId);
      if (!tour) {
        console.warn(`[GuidedTour] Tour ${tourId} is not registered`);
        return;
      }

      setActiveTourId(tourId);
      setActiveStepIndex(0);
      setIsActive(true);
      setTargetRect(null);
      setTargetReady(false);
    },
    [],
  );

  const restartTour = useCallback(
    (tourId: string) => {
      if (progress[tourId]) {
        const next = { ...progress };
        delete next[tourId];
        saveProgress(next);
      }
      startTour(tourId);
    },
    [progress, saveProgress, startTour],
  );

  const skipTour = useCallback(() => {
    stopTour();
  }, [stopTour]);

  const resetProgress = useCallback(
    (tourId: string) => {
      if (!progress[tourId]) return;
      const next = { ...progress };
      delete next[tourId];
      saveProgress(next);
    },
    [progress, saveProgress],
  );

  useEffect(() => {
    if (!activeStep) return;

    if (activeStep.path && activeStep.path !== pathname) {
      if (!pendingNavigationRef.current) {
        pendingNavigationRef.current = true;
        router.push(activeStep.path);
      }
      return;
    }

    if (pendingNavigationRef.current) {
      pendingNavigationRef.current = false;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const updateRect = () => {
      if (!targetElementRef.current || cancelled) return;
      const rect = extractRect(targetElementRef.current.getBoundingClientRect());
      setTargetRect(rect);
      setTargetReady(true);
    };

    const resolveTarget = () => {
      if (cancelled) return;
      const element = document.querySelector(activeStep.selector) as HTMLElement | null;

      if (!element) {
        setTargetReady(false);
        window.setTimeout(resolveTarget, 120);
        return;
      }

      targetElementRef.current = element;

      if (activeStep.autoScroll !== false) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }

      updateRect();

      resizeObserver = new ResizeObserver(updateRect);
      resizeObserver.observe(element);

      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, true);
    };

    const timer = window.setTimeout(resolveTarget, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      targetElementRef.current = null;
      setTargetReady(false);
      setTargetRect(null);
    };
  }, [activeStep, pathname, router]);

  useEffect(() => {
    if (!isActive) {
      targetElementRef.current = null;
      setTargetRect(null);
      setTargetReady(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        skipTour();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextStep();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, previousStep, skipTour]);

  const contextValue = useMemo<GuidedTourContextValue>(
    () => ({
      registerTour,
      startTour,
      restartTour,
      stopTour,
      nextStep,
      previousStep,
      skipTour,
      activeTourId,
      activeStepIndex,
      activeStep,
      isActive,
      hasCompleted,
      resetProgress,
    }),
    [
      registerTour,
      startTour,
      restartTour,
      stopTour,
      nextStep,
      previousStep,
      skipTour,
      activeTourId,
      activeStepIndex,
      activeStep,
      isActive,
      hasCompleted,
      resetProgress,
    ],
  );

  const overlay = isActive && activeTour && activeStep && isMounted
    ? (
      createPortal(
        <GuidedTourOverlay
          tourTitle={activeTour.meta?.title ?? 'Guida iscrizione campionato'}
          step={activeStep}
          stepIndex={activeStepIndex}
          totalSteps={activeTour.steps.length}
          targetRect={targetRect}
          targetReady={targetReady}
          placement={activeStep.placement ?? DEFAULT_PLACEMENT}
          onNext={nextStep}
          onPrevious={previousStep}
          onClose={skipTour}
        />,
        document.body,
      )
    )
    : null;

  return (
    <GuidedTourContext.Provider value={contextValue}>
      {children}
      {overlay}
    </GuidedTourContext.Provider>
  );
}

interface GuidedTourOverlayProps {
  tourTitle: string;
  step: GuidedTourStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: RectState | null;
  targetReady: boolean;
  placement: Placement;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

function GuidedTourOverlay({
  tourTitle,
  step,
  stepIndex,
  totalSteps,
  targetRect,
  targetReady,
  placement,
  onNext,
  onPrevious,
  onClose,
}: GuidedTourOverlayProps) {
  const hasPrevious = stepIndex > 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const calloutRef = useRef<HTMLDivElement | null>(null);
  const [calloutSize, setCalloutSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = calloutRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setCalloutSize((prev) => {
        const next = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };

        if (prev.width === next.width && prev.height === next.height) {
          return prev;
        }

        return next;
      });
    };

    updateSize();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    observer?.observe(node);

    window.addEventListener('resize', updateSize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [step.id, stepIndex]);

  const calloutStyle = useMemo(() => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      } as CSSProperties;
    }

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    const spacing = 16;
    const maxWidth = Math.min(360, viewportWidth - 32);
    const calloutHeight = calloutSize.height || 260;
    const calloutWidth = Math.min(calloutSize.width || maxWidth, maxWidth);
    const preferredPlacement = placement === 'auto' ? 'bottom' : placement;

    const isTop = preferredPlacement === 'top';
    const isBottom = preferredPlacement === 'bottom';
    const isLeft = preferredPlacement === 'left';
    const isRight = preferredPlacement === 'right';

    let top = targetRect.bottom + spacing;
    let left = targetRect.left;

    if (isTop) {
      top = targetRect.top - spacing - calloutHeight;
      if (top < 16) {
        top = Math.min(targetRect.bottom + spacing, viewportHeight - calloutHeight - 16);
      }
    } else if (isBottom) {
      top = targetRect.bottom + spacing;
      if (top + calloutHeight > viewportHeight - 16) {
        const abovePosition = targetRect.top - spacing - calloutHeight;
        top = abovePosition >= 16
          ? abovePosition
          : Math.max(16, viewportHeight - calloutHeight - 16);
      }
    } else {
      // Left or right placement: align with target but keep inside viewport
      top = targetRect.top + targetRect.height / 2 - calloutHeight / 2;
    }

    if (isLeft) {
      left = targetRect.left - calloutWidth - spacing;
      if (left < 16) {
        left = targetRect.right + spacing;
      }
    } else if (isRight) {
      left = targetRect.right + spacing;
      if (left + calloutWidth > viewportWidth) {
        left = targetRect.left - calloutWidth - spacing;
        if (left < 16) {
          left = Math.max(16, viewportWidth / 2 - calloutWidth / 2);
        }
      }
    }

    const maxTop = viewportHeight - calloutHeight - 16;
    const clampedTop = Math.min(Math.max(top, 16), Math.max(16, maxTop));
    const clampedLeft = Math.min(Math.max(left, 16), viewportWidth - calloutWidth - 16);

    return {
      top: clampedTop,
      left: clampedLeft,
      maxWidth,
    } as CSSProperties;
  }, [targetRect, placement, calloutSize.height, calloutSize.width]);

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      <div className="pointer-events-none fixed inset-0 bg-slate-900/60 transition-opacity" />

      {targetRect && targetReady && (
        <div
        className="pointer-events-none fixed rounded-3xl border-[2px] border-white/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] transition-all duration-200 ease-out"
          style={{
            top: targetRect.top - 12,
            left: targetRect.left - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
          }}
        />
      )}

      <div
        ref={calloutRef}
        className="pointer-events-auto fixed z-[95] max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        style={calloutStyle}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{tourTitle}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-1 text-slate-400 transition hover:text-slate-600"
            aria-label="Chiudi guida"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-slate-600">{step.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Passo {stepIndex + 1} di {totalSteps}</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1.5 w-6 rounded-full transition',
                    index <= stepIndex ? 'bg-blue-600' : 'bg-slate-200',
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="flex items-center gap-2 text-sm text-slate-600 disabled:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Salta tour
            </Button>
            <Button
              onClick={onNext}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Concludi' : 'Avanti'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useGuidedTour(tourId?: string) {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useGuidedTour must be used within a GuidedTourProvider');
  }

  const {
    registerTour,
    startTour,
    restartTour,
    stopTour,
    nextStep,
    previousStep,
    skipTour,
    activeTourId,
    activeStepIndex,
    activeStep,
    isActive,
    hasCompleted,
    resetProgress,
  } = context;

  const start = useCallback(() => {
    if (!tourId) {
      throw new Error('useGuidedTour start helper requires a tourId');
    }
    startTour(tourId);
  }, [startTour, tourId]);

  const restart = useCallback(() => {
    if (!tourId) {
      throw new Error('useGuidedTour restart helper requires a tourId');
    }
    restartTour(tourId);
  }, [restartTour, tourId]);

  const completion = useMemo(() => {
    if (!tourId) return false;
    return hasCompleted(tourId);
  }, [hasCompleted, tourId]);

  const reset = useCallback(() => {
    if (!tourId) {
      throw new Error('useGuidedTour reset helper requires a tourId');
    }
    resetProgress(tourId);
  }, [resetProgress, tourId]);

  return {
    registerTour,
    startTour,
    restartTour,
    stopTour,
    nextStep,
    previousStep,
    skipTour,
    activeTourId,
    activeStepIndex,
    activeStep,
    isActive,
    hasCompleted,
    resetProgress,
    start,
    restart,
    completion,
    reset,
  };
}
