'use client';

import { PlayCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useGuidedTour } from '@/components/guided-tour/GuidedTourProvider';
import { GUIDED_REGISTRATION_TOUR_ID } from './GuidedRegistrationTourManager';

interface GuidedRegistrationLauncherProps {
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export function GuidedRegistrationLauncher({ className, orientation = 'vertical' }: GuidedRegistrationLauncherProps) {
  const {
    start,
    restart,
    completion,
    isActive,
    activeTourId,
  } = useGuidedTour(GUIDED_REGISTRATION_TOUR_ID);

  const isRunning = isActive && activeTourId === GUIDED_REGISTRATION_TOUR_ID;
  const isVertical = orientation !== 'horizontal';

  const handleClick = () => {
    if (completion) {
      restart();
    } else {
      start();
    }
  };

  return (
    <div
      data-tour-anchor="dashboard-registration-launcher"
      className={cn(
        'inline-flex',
        isVertical
          ? 'flex-col items-end gap-1 text-right'
          : 'flex-row items-center gap-3 text-left',
        className,
      )}
    >
      <Button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
          completion && !isRunning && 'bg-slate-800 hover:bg-slate-900',
        )}
      >
        {completion && !isRunning ? <RotateCcw className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
        {completion && !isRunning ? 'Rivedi guida iscrizione' : 'Avvia guida iscrizione'}
      </Button>
      <div
        className={cn(
          'text-xs text-slate-500',
          isVertical ? 'mt-1 text-right' : 'ml-2 hidden sm:block'
        )}
      >
        {isRunning && (
          <span className="inline-flex items-center gap-1 font-medium text-blue-600">
            <PlayCircle className="h-3 w-3" />
            Tour in corso
          </span>
        )}
        {completion && !isRunning && (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Tour completato – puoi ripeterlo in qualsiasi momento
          </span>
        )}
        {isVertical && !completion && !isRunning && (
          <span className="text-slate-400">Ti accompagniamo passo passo nell’iscrizione al campionato.</span>
        )}
      </div>
      {!isVertical && (
        <div className="text-xs text-slate-400 sm:hidden">
          Guida iscrizione disponibile
        </div>
      )}
    </div>
  );
}
