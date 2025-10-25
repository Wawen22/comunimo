'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { NextEventSection } from '@/components/landing/NextEventSection';
import { CalendarSection } from '@/components/landing/CalendarSection';
import { RankingsSection } from '@/components/landing/RankingsSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { useLandingData } from '@/lib/hooks/useLandingData';

/**
 * Landing page - Public-facing homepage
 * Displays championship information, registration status, calendar, and rankings
 */
export default function Home() {
  const { championship, stages, registrationStatus, loading, error } = useLandingData();

  // Error state
  if (error && !loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Errore nel caricamento dei dati
          </h1>
          <p className="mt-4 text-muted-foreground">
            Si è verificato un errore. Riprova più tardi.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-brand-blue px-6 py-2 text-white hover:bg-brand-blue/90"
          >
            Ricarica la pagina
          </button>
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
        <HeroSection
          championship={championship}
          registrationStatus={registrationStatus}
          loading={loading}
        />

        {/* Next Event Section */}
        <NextEventSection events={stages} loading={loading} />

        {/* Calendar Section */}
        <CalendarSection stages={stages} loading={loading} />

        {/* Rankings Section */}
        <RankingsSection />

        {/* Footer */}
        <LandingFooter />
      </main>
    </>
  );
}

