'use client';

import { useEffect, useState } from 'react';
import { calculateTimeRemaining } from '@/lib/utils/registrationUtils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Countdown timer component
 * Updates every minute to reduce re-renders
 * Respects prefers-reduced-motion
 */
export function CountdownTimer({ targetDate, className = '', variant = 'default' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(targetDate));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Update immediately
    setTimeRemaining(calculateTimeRemaining(targetDate));

    // Update every minute (60000ms)
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 60000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeRemaining.total <= 0) {
    return (
      <div className={cn('text-center text-sm font-semibold text-muted-foreground', className)}>
        L'evento è iniziato!
      </div>
    );
  }

  const timeUnits = [
    { value: timeRemaining.days, label: 'Giorni', singular: 'Giorno', color: 'from-blue-500 to-blue-600' },
    { value: timeRemaining.hours, label: 'Ore', singular: 'Ora', color: 'from-purple-500 to-purple-600' },
    { value: timeRemaining.minutes, label: 'Minuti', singular: 'Minuto', color: 'from-pink-500 to-pink-600' },
  ];

  const containerGap = variant === 'compact' ? 'gap-3 md:gap-4' : 'gap-4 md:gap-6';
  const boxSize = variant === 'compact' ? 'h-14 w-14 md:h-16 md:w-16' : 'h-20 w-20 md:h-24 md:w-24';
  const numberSize = variant === 'compact' ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl';
  const labelSize = variant === 'compact' ? 'text-[10px] md:text-xs' : 'text-sm';
  const labelMargin = variant === 'compact' ? 'mt-2' : 'mt-3';

  return (
    <div className={cn('flex items-center justify-center', containerGap, className)} role="timer" aria-live="polite">
      {timeUnits.map((unit, index) => (
        <div
          key={unit.label}
          className={`group flex flex-col items-center ${
            prefersReducedMotion ? '' : 'transition-all duration-300 hover:scale-110'
          }`}
        >
          {/* Timer Box with Gradient and Glow */}
          <div className="relative">
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${unit.color} opacity-50 blur-xl ${prefersReducedMotion ? '' : 'group-hover:opacity-75 transition-opacity'}`} />

            {/* Main Box */}
            <div className={cn('relative flex items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl', unit.color, boxSize)}>
              <span
                className={cn('font-extrabold text-white', numberSize)}
                aria-label={`${unit.value} ${unit.value === 1 ? unit.singular : unit.label}`}
              >
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Label */}
        <span className={cn(labelMargin, 'font-semibold uppercase tracking-wide text-muted-foreground', labelSize)}>
          {unit.value === 1 ? unit.singular : unit.label}
        </span>
      </div>
    ))}
    </div>
  );
}
