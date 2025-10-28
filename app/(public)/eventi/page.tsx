'use client';

import { EventsHeroSection } from '@/components/landing/EventsHeroSection';
import { EventsGrid } from '@/components/landing/EventsGrid';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { useEventsData } from '@/lib/hooks/useEventsData';

/**
 * Eventi page - Public-facing events listing
 * Features:
 * - Modern hero section with stats
 * - Filterable events grid
 * - Search functionality
 * - Responsive design
 * - Smooth animations
 */
export default function EventiPage() {
  const { filteredEvents, loading, error, filters, setFilters, stats } = useEventsData();

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="rounded-3xl border-2 border-red-200 bg-white p-12 shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Errore nel caricamento</h2>
            <p className="mt-3 text-slate-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
            >
              Riprova
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      <main className="min-h-screen">
        {/* Hero Section */}
        <EventsHeroSection stats={stats} loading={loading} />

        {/* Events Grid with Filters */}
        <EventsGrid
          events={filteredEvents}
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
        />

        {/* Footer */}
        <LandingFooter />
      </main>
    </>
  );
}

