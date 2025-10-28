'use client';

import { Calendar, MapPin, Sparkles, TrendingUp } from 'lucide-react';

interface EventsHeroSectionProps {
  stats: {
    total: number;
    upcoming: number;
    past: number;
    thisMonth: number;
  };
  loading: boolean;
}

/**
 * Hero section for Events page
 * Features:
 * - Animated gradient background
 * - Glassmorphism stats cards
 * - Floating animations
 * - Responsive design
 */
export function EventsHeroSection({ stats, loading }: EventsHeroSectionProps) {
  if (loading) {
    return (
      <section className="relative isolate overflow-hidden bg-white text-slate-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),_transparent_70%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-center gap-12 px-4 py-20 sm:px-6">
          <div className="space-y-6">
            <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-16 w-2/3 animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-6 w-1/2 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-16 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-white text-slate-900">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),_transparent_70%)]" />
        
        {/* Animated blobs */}
        <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl motion-safe:animate-blob" />
        <div className="absolute right-1/4 top-40 h-64 w-64 rounded-full bg-pink-300/20 blur-3xl motion-safe:animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl motion-safe:animate-blob animation-delay-4000" />
      </div>

      <div className="relative mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-center gap-12 px-4 py-20 sm:px-6">
        {/* Header Content */}
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 rounded-full border border-purple-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-600 shadow-sm backdrop-blur-sm motion-safe:animate-float">
            <Sparkles className="h-4 w-4" />
            Eventi ComUniMo
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
                Scopri i Nostri Eventi
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-600 md:text-xl">
              Partecipa alle gare, manifestazioni e iniziative organizzate dal Comitato Unitario Modena.
              Resta aggiornato su tutti gli eventi in programma.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Events */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>Totale Eventi</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span>In Arrivo</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{stats.upcoming}</p>
            </div>
          </div>

          {/* This Month */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span>Questo Mese</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{stats.thisMonth}</p>
            </div>
          </div>

          {/* Past Events */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>Completati</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{stats.past}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full text-slate-50"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}

