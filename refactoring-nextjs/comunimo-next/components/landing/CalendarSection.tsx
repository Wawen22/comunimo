'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StageCard } from './StageCard';
import { ScrollReveal } from './ScrollReveal';
import type { Event } from '@/types/database';

interface CalendarSectionProps {
  stages: Event[];
  loading: boolean;
}

/**
 * Calendar section with horizontal scrolling carousel
 * Modern, engaging way to display championship stages
 */
export function CalendarSection({ stages, loading }: CalendarSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 400;
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
          </div>
          <div className="mt-8 flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 w-80 flex-shrink-0 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-blue-dark md:text-4xl">
              Calendario Tappe
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Nessuna tappa disponibile
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 md:py-24">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-red/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-4 py-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              <span className="text-sm font-bold uppercase tracking-wider text-brand-blue">Calendario</span>
            </div>
            <h2 className="bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl lg:text-6xl">
              Tappe del Campionato
            </h2>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Scorri per scoprire tutte le tappe
            </p>
          </div>
        </ScrollReveal>

        {/* Horizontal Scroll Container */}
        <div className="relative mt-12">
          {/* Left Scroll Button - Hidden on mobile */}
          <Button
            onClick={() => scroll('left')}
            variant="outline"
            size="icon"
            className="absolute -left-6 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 rounded-full border-2 border-brand-blue/30 bg-white shadow-2xl transition-all hover:scale-110 hover:border-brand-blue hover:bg-brand-blue hover:text-white md:flex"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Scrollable Container with Snap */}
          <div
            ref={scrollContainerRef}
            className="snap-x flex gap-8 overflow-x-auto pb-8 pt-4 scrollbar-hide md:px-16"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="snap-center w-[340px] flex-shrink-0 md:w-[360px]"
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <StageCard stage={stage} allStages={stages} />
              </div>
            ))}
          </div>

          {/* Right Scroll Button - Hidden on mobile */}
          <Button
            onClick={() => scroll('right')}
            variant="outline"
            size="icon"
            className="absolute -right-6 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 rounded-full border-2 border-brand-blue/30 bg-white shadow-2xl transition-all hover:scale-110 hover:border-brand-blue hover:bg-brand-blue hover:text-white md:flex"
            aria-label="Scorri a destra"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Scroll Indicator - Mobile Only */}
        <div className="mt-6 flex justify-center gap-2 md:hidden">
          <div className="flex items-center gap-2 rounded-full bg-brand-blue/10 px-4 py-2">
            <ChevronLeft className="h-4 w-4 text-brand-blue" />
            <span className="text-xs font-medium text-brand-blue">Scorri per vedere tutte le tappe</span>
            <ChevronRight className="h-4 w-4 text-brand-blue" />
          </div>
        </div>

        {/* Mobile Scroll Hint */}
        <div className="mt-4 text-center md:hidden">
          <p className="text-sm text-muted-foreground">
            ← Scorri per vedere tutte le tappe →
          </p>
        </div>

        {/* Desktop Grid View (Alternative - commented out) */}
        {/* Uncomment this and comment out the horizontal scroll if you prefer a grid layout */}
        {/*
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage) => (
            <StageCard key={stage.id} stage={stage} allStages={stages} />
          ))}
        </div>
        */}
      </div>

      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

