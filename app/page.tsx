'use client';

import { useMemo } from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { CalendarSection } from '@/components/landing/CalendarSection';
import { InsightsSection } from '@/components/landing/InsightsSection';
import { RankingSection } from '@/components/landing/RankingSection';
import { EngagementSection } from '@/components/landing/EngagementSection';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { useLandingData } from '@/lib/hooks/useLandingData';

/**
 * Landing page - Public-facing homepage
 * Displays championship information, registration status, calendar, and rankings
 */
export default function Home() {
  const { championship, stages, registrationStatus, loading, error } = useLandingData();
  const navigationSections = useMemo(() => {
    const sections = [
      { id: 'landing-hero', label: 'Intro' },
      { id: 'landing-calendar', label: 'Calendario' },
      { id: 'landing-insights', label: 'Statistiche' },
    ];

    if (loading || championship) {
      sections.push({ id: 'landing-rankings', label: 'Classifiche' });
    }

    sections.push({ id: 'landing-engagement', label: 'Community' });
    return sections;
  }, [championship, loading]);

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
      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Landing navigation */}
      <LandingNavigation sections={navigationSections} />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection
          championship={championship}
          stages={stages}
          registrationStatus={registrationStatus}
          loading={loading}
          sectionId="landing-hero"
          className="pt-14 sm:pt-20"
        />

        {/* Calendar Section */}
        <CalendarSection stages={stages} loading={loading} sectionId="landing-calendar" />

        {/* Insights & Engagement */}
        <InsightsSection
          championship={championship}
          events={stages}
          sectionId="landing-insights"
        />

        <RankingSection
          championship={championship}
          events={stages}
          loading={loading}
          sectionId="landing-rankings"
        />

        <EngagementSection sectionId="landing-engagement" />

        {/* Footer */}
        <LandingFooter />
      </main>
    </>
  );
}
