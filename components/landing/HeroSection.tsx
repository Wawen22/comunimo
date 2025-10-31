'use client';

import { differenceInCalendarDays } from 'date-fns';
import { ArrowRight, CalendarDays, Clock, FileText, LogIn, MapPin, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Championship, Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { getNextEvent } from '@/lib/utils/registrationUtils';
import { CountdownTimer } from './CountdownTimer';

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

  const secondaryStats = [
    {
      label: 'Tappe imminenti',
      value: upcomingStages.length,
    },
    {
      label: 'Location coinvolte',
      value: uniqueLocations.size,
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

  const nextEventFullDate = nextEventDate
    ? new Intl.DateTimeFormat('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(nextEventDate)
    : null;

  const nextEventTimeLabel = nextEvent?.event_time
    ? new Intl.DateTimeFormat('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(`2000-01-01T${nextEvent.event_time}`))
    : null;

  const registrationDeadlineLabel = nextEvent?.registration_end_date
    ? new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(nextEvent.registration_end_date))
    : null;

  return (
    <section className="relative isolate overflow-hidden bg-white text-slate-900">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(239,68,68,0.12),_transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-center gap-12 px-4 py-16 sm:px-6">
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

            <div className="mt-10 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:gap-4">
              {secondaryStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{stat.value ?? '—'}</p>
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

            <div className="mt-6 space-y-5">
              {nextEvent ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                    <span>Prossima tappa</span>
                    {nextEvent.event_number && (
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        Tappa {nextEvent.event_number}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{nextEvent.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 capitalize">
                    {nextEventFullDate || 'Data da definire'}
                    {nextEventTimeLabel ? ` · ore ${nextEventTimeLabel}` : ''}
                  </p>
                  {nextEvent.location && (
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-brand-blue" />
                      {nextEvent.location}
                    </p>
                  )}
                  {registrationDeadlineLabel && (
                    <p className="mt-4 text-xs text-slate-500">
                      Iscrizioni aperte fino al{' '}
                      <span className="font-semibold text-slate-900">{registrationDeadlineLabel}</span>
                    </p>
                  )}
                  {nextEvent.poster_url && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-400 hover:bg-blue-50"
                      onClick={() => window.open(nextEvent.poster_url!, '_blank', 'noopener,noreferrer')}
                    >
                      <FileText className="h-4 w-4" />
                      Locandina ufficiale
                    </Button>
                  )}
                  {nextEventDate && (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-blue-600">Countdown</p>
                      <CountdownTimer
                        targetDate={nextEventDate}
                        variant="compact"
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                  Non c'è ancora una prossima tappa programmata. Resta aggiornato!
                </div>
              )}

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="h-4 w-4 text-brand-blue" />
                  Tappe del campionato
                </span>
                  <span className="font-semibold text-slate-900">{stages.length > 0 ? stages.length : '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-brand-blue" />
                    Location coinvolte
                  </span>
                  <span className="font-semibold text-slate-900">{uniqueLocations.size}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4 text-brand-blue" />
                    Giorni alla prossima tappa
                  </span>
                  <span className="font-semibold text-slate-900">
                    {nextEventDate ? Math.max(differenceInCalendarDays(nextEventDate, new Date()), 0) : '—'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {championship?.start_date && championship?.end_date ? (
                  <p>
                    Dal {formatFullDate(championship.start_date)} al {formatFullDate(championship.end_date)}
                  </p>
                ) : (
                  <p>Il calendario completo sarà pubblicato a breve.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
