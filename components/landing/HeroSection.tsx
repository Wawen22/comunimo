'use client';

import { differenceInCalendarDays } from 'date-fns';
import { ArrowRight, CalendarDays, Clock, LogIn, MapPin, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Championship, Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { getNextEvent } from '@/lib/utils/registrationUtils';

interface HeroSectionProps {
  championship: Championship | null;
  stages: Event[];
  registrationStatus: 'open' | 'closed';
  loading: boolean;
}

const skeletonBlocks = ['h-6 w-28', 'h-12 w-full max-w-md', 'h-10 w-40', 'h-16 w-56'];

function formatDate(date: Date | null) {
  if (!date) return 'Da annunciare';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
  }).format(date);
}

function formatFullDate(date: string | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat('it-IT').format(new Date(date));
}

export function HeroSection({ championship, stages, registrationStatus, loading }: HeroSectionProps) {
  const router = useRouter();

  const nextEvent = getNextEvent(stages);
  const nextEventDate = nextEvent ? new Date(nextEvent.event_date) : null;
  const upcomingStages = stages.filter((stage) => {
    if (!stage.event_date) return false;
    const eventDate = new Date(stage.event_date);
    return eventDate >= new Date();
  });
  const uniqueLocations = new Set(
    stages
      .map((stage) => stage.location?.trim())
      .filter((location): location is string => Boolean(location)),
  );

  const quickStats = [
    {
      label: 'Tappe del campionato',
      value: stages.length > 0 ? String(stages.length) : '—',
      icon: CalendarDays,
    },
    {
      label: 'Prossima tappa',
      value: nextEventDate ? formatDate(nextEventDate) : 'Da annunciare',
      icon: Clock,
      description: nextEvent?.location ?? undefined,
    },
    {
      label: 'Iscrizioni',
      value: registrationStatus === 'open' ? 'Aperte' : 'Chiuse',
      icon: Sparkles,
      tone: registrationStatus === 'open' ? 'text-emerald-600' : 'text-amber-500',
    },
  ];

  const secondaryStats = [
    {
      label: 'Tappe imminenti',
      value: upcomingStages.length,
    },
    {
      label: 'Location coinvolte',
      value: uniqueLocations.size,
    },
    {
      label: 'Giorni alla prossima tappa',
      value: nextEventDate ? Math.max(differenceInCalendarDays(nextEventDate, new Date()), 0) : null,
    },
  ];

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden bg-white text-slate-900">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
        <div className="mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-center gap-10 px-4 py-24 sm:px-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="space-y-4">
              <div className="h-12 w-full max-w-xl animate-pulse rounded-3xl bg-slate-200" />
              <div className="h-12 w-full max-w-xl animate-pulse rounded-3xl bg-slate-200" />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {skeletonBlocks.map((cls) => (
                <div key={cls} className={`animate-pulse rounded-2xl bg-slate-200 ${cls}`} />
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
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

  const isOpen = registrationStatus === 'open';
  const heroTitle = championship
    ? `${championship.name}`
    : 'Il prossimo campionato sarà annunciato a breve';
  const heroDescription = championship?.description
    ?? 'Resta aggiornato sulle iniziative ufficiali del Comitato Unitario Modena e preparati alle prossime gare.';

  return (
    <section className="relative isolate overflow-hidden bg-white text-slate-900">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(239,68,68,0.12),_transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-center gap-12 px-4 py-24 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" aria-hidden />
              Piattaforma ufficiale ComUniMo
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="block bg-gradient-to-r from-slate-900 via-brand-blue/60 to-slate-900 bg-clip-text text-transparent">
                  {heroTitle}
                </span>
              </h1>
              <p className="max-w-xl text-lg text-slate-600 md:text-xl">{heroDescription}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => router.push('/dashboard')}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-4 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-brand-blue/90"
                size="lg"
              >
                <LogIn className="h-5 w-5" />
                Accedi alla dashboard
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              {!isOpen && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/register')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-900 transition hover:border-brand-blue/40 hover:bg-brand-blue/5"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 text-brand-blue" />
                  Crea un account
                </Button>
              )}
            </div>

            <div className="mt-10 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
              {secondaryStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-brand-blue" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Stato iscrizioni
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isOpen ? 'Aperte' : 'Chiuse'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {quickStats.map((item) => (
                <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                    <item.icon className={`h-6 w-6 ${item.tone ?? ''}`} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
                    {item.description && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {championship?.start_date && championship?.end_date ? (
                <p>
                  Dal {formatFullDate(championship.start_date)} al {formatFullDate(championship.end_date)}
                </p>
              ) : (
                <p>Il calendario completo sarà pubblicato a breve.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
