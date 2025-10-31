'use client';

import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingNavigationSection {
  id: string;
  label: string;
}

interface LandingNavigationProps {
  sections: LandingNavigationSection[];
}

const NAV_HEIGHT = 72;

/**
 * Sticky landing navigation.
 * Provides smooth scrolling between landing sections and highlights the active one.
 */
export function LandingNavigation({ sections }: LandingNavigationProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '');
  const navRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showStartFade, setShowStartFade] = useState(false);
  const [showEndFade, setShowEndFade] = useState(false);

  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);

  useEffect(() => {
    const updateFromScroll = () => {
      const scrollY = window.scrollY;
      const rect = navRef.current?.getBoundingClientRect();
      const navOffset = rect ? rect.height + rect.top : NAV_HEIGHT;
      const targetOffset = scrollY + navOffset + 8;
      let latestVisible = sections[0]?.id ?? '';

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        const { top } = element.getBoundingClientRect();
        const absoluteTop = top + scrollY;

        if (targetOffset >= absoluteTop) {
          latestVisible = section.id;
        }
      }

      setActiveSection(latestVisible);
    };

    if (sections.length === 0) return;

    updateFromScroll();

    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);

    return () => {
      window.removeEventListener('scroll', updateFromScroll);
      window.removeEventListener('resize', updateFromScroll);
    };
  }, [sections]);

  useEffect(() => {
    if (!sectionIds.includes(activeSection) && sectionIds.length > 0) {
      setActiveSection(sectionIds[0]);
    }
  }, [activeSection, sectionIds]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const updateFadeIndicators = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      setShowStartFade(scrollLeft > 4);
      setShowEndFade(scrollLeft + clientWidth < scrollWidth - 4);
    };

    updateFadeIndicators();
    scrollContainer.addEventListener('scroll', updateFadeIndicators, { passive: true });
    window.addEventListener('resize', updateFadeIndicators);

    return () => {
      scrollContainer.removeEventListener('scroll', updateFadeIndicators);
      window.removeEventListener('resize', updateFadeIndicators);
    };
  }, [sectionIds]);

  const handleNavigation = (id: string) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    const { top } = element.getBoundingClientRect();
    const rect = navRef.current?.getBoundingClientRect();
    const navOffset = rect ? rect.height + rect.top : NAV_HEIGHT;
    const offsetTop = window.scrollY + top - navOffset + 12;

    window.scrollTo({
      top: offsetTop,
      left: 0,
      behavior: 'smooth',
    });
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 sm:top-6">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <nav
          ref={navRef}
          aria-label="Navigazione sezioni landing"
          className="pointer-events-auto relative flex h-12 items-center gap-1 overflow-hidden rounded-full border border-slate-200/70 bg-white/90 pl-3 pr-2 shadow-lg ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:h-14 sm:gap-3 sm:pl-5 md:h-16 dark:border-slate-800/50 dark:bg-slate-900/70"
        >
          <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 sm:flex">
            <Sparkles className="h-4 w-4 text-brand-blue" />
            ComUniMo
            <span className="hidden text-[0.55rem] tracking-[0.42em] text-slate-400 sm:inline">
              Landing
            </span>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex flex-1 snap-x snap-mandatory items-center justify-start gap-1 overflow-x-auto pl-3 pr-3 text-[11px] font-medium text-slate-600 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:text-sm md:justify-center"
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
          >
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  onClick={handleNavigation(section.id)}
                  className={cn(
                    'snap-start snap-always relative inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1.5 transition-colors duration-200 sm:px-4',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60',
                    isActive
                      ? 'bg-gradient-to-r from-brand-blue to-brand-red text-white shadow-md shadow-brand-blue/20'
                      : 'bg-white/80 text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {section.label}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border border-white/40" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className={cn(
              'pointer-events-none absolute inset-y-1 left-1 w-6 rounded-full bg-gradient-to-r from-white to-transparent dark:from-slate-900',
              showStartFade ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-200 ease-out',
            )}
            aria-hidden
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-y-1 right-1 w-6 rounded-full bg-gradient-to-l from-white to-transparent dark:from-slate-900',
              showEndFade ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-200 ease-out',
            )}
            aria-hidden
          />
        </nav>
      </div>
    </header>
  );
}
