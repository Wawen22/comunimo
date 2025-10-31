'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { CalendarSection } from '@/components/landing/CalendarSection';
import { InsightsSection } from '@/components/landing/InsightsSection';
import { RankingSection } from '@/components/landing/RankingSection';
import { EngagementSection } from '@/components/landing/EngagementSection';
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

  if (error && !loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <h1 className="text-2xl font-semibold">Si è verificato un problema</h1>
          <p className="mt-4 text-sm text-white/70">
            Non riusciamo a recuperare le informazioni del campionato. Aggiorna la pagina o riprova più tardi.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
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
          stages={stages}
          registrationStatus={registrationStatus}
          loading={loading}
        />

        {/* Calendar Section */}
        <CalendarSection stages={stages} loading={loading} />

        {/* Insights & Engagement */}
        <InsightsSection championship={championship} events={stages} />

        <RankingSection championship={championship} events={stages} loading={loading} />

        <EngagementSection />

        {/* Footer */}
        <LandingFooter />
      </main>
    </>
  );
}
