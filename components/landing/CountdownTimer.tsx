'use client';

import { useEffect, useState } from 'react';
import { calculateTimeRemaining } from '@/lib/utils/registrationUtils';

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
}

/**
 * Countdown timer component
 * Updates every minute to reduce re-renders
 * Respects prefers-reduced-motion
 */
export function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
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
      <div className={`text-center ${className}`}>
        <p className="text-lg font-semibold text-muted-foreground">
          L'evento è iniziato!
        </p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeRemaining.days, label: 'Giorni', singular: 'Giorno', color: 'from-blue-500 to-blue-600' },
    { value: timeRemaining.hours, label: 'Ore', singular: 'Ora', color: 'from-purple-500 to-purple-600' },
    { value: timeRemaining.minutes, label: 'Minuti', singular: 'Minuto', color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className={`flex items-center justify-center gap-4 md:gap-6 ${className}`} role="timer" aria-live="polite">
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
            <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${unit.color} shadow-2xl md:h-24 md:w-24`}>
              <span
                className="text-3xl font-extrabold text-white md:text-4xl"
                aria-label={`${unit.value} ${unit.value === 1 ? unit.singular : unit.label}`}
              >
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Label */}
          <span className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {unit.value === 1 ? unit.singular : unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

