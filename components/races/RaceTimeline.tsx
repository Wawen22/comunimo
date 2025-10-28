'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Race, RaceStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  FileText,
  Trophy,
  ChevronRight,
  Flag,
  CheckCircle2,
  Circle,
  ArrowLeftRight,
} from 'lucide-react';
import {
  getRaceStatus,
  getStatusLabel,
  getDaysUntilRace,
} from '@/lib/utils/raceUtils';
import { formatDate, cn } from '@/lib/utils';

interface RaceTimelineProps {
  races: Race[];
  championshipId: string;
  registrationCounts?: Record<string, number>;
}

type StatusVisual = {
  dot: string;
  card: string;
  border: string;
  ring: string;
  statusBadge: string;
  dayBadge: string;
  muted: string;
  connector: string;
};

const statusVisuals: Record<RaceStatus, StatusVisual> = {
  upcoming: {
    dot: 'bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400',
    card: 'bg-gradient-to-br from-white via-slate-50 to-white',
    border: 'border-slate-200/70',
    ring: 'ring-slate-100/80',
    statusBadge: 'border border-slate-200/70 bg-slate-100 text-slate-700',
    dayBadge: 'bg-slate-900 text-white',
    muted: 'text-slate-500',
    connector: 'from-transparent via-slate-200 to-transparent',
  },
  open: {
    dot: 'bg-gradient-to-br from-sky-500 via-blue-500 to-rose-500',
    card: 'bg-gradient-to-br from-sky-50 via-white to-rose-50',
    border: 'border-sky-200/70',
    ring: 'ring-sky-100/80',
    statusBadge: 'border border-sky-200/80 bg-sky-100 text-sky-700',
    dayBadge:
      'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.2)]',
    muted: 'text-slate-500',
    connector: 'from-sky-200/70 via-sky-100/60 to-transparent',
  },
  closed: {
    dot: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-400',
    card: 'bg-gradient-to-br from-amber-50 via-white to-amber-50',
    border: 'border-amber-200/70',
    ring: 'ring-amber-100/80',
    statusBadge: 'border border-amber-200/70 bg-amber-100 text-amber-700',
    dayBadge:
      'bg-amber-500 text-white shadow-[0_0_18px_rgba(245,158,11,0.15)]',
    muted: 'text-slate-500',
    connector: 'from-amber-200/60 via-amber-100/50 to-transparent',
  },
  completed: {
    dot: 'bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-500',
    card: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50',
    border: 'border-emerald-200/70',
    ring: 'ring-emerald-100/80',
    statusBadge: 'border border-emerald-200/70 bg-emerald-100 text-emerald-700',
    dayBadge:
      'bg-emerald-500 text-white shadow-[0_0_18px_rgba(6,148,82,0.2)]',
    muted: 'text-emerald-600/70',
    connector: 'from-emerald-200/60 via-emerald-100/50 to-transparent',
  },
};

interface InfoPillProps {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
  accentClass: string;
}

function InfoPill({ icon, label, value, helper, accentClass }: InfoPillProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur transition-colors duration-300">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-600 shadow-inner',
          accentClass
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-900 leading-tight">
          {value}
        </p>
        {helper && <p className="mt-0.5 text-xs text-slate-500">{helper}</p>}
      </div>
    </div>
  );
}

function getDaysText(race: Race) {
  const days = getDaysUntilRace(race);

  if (days < 0) {
    return 'Completata';
  }
  if (days === 0) {
    return 'Oggi';
  }
  if (days === 1) {
    return 'Domani';
  }
  if (days <= 7) {
    return `Tra ${days} giorni`;
  }
  if (days <= 30) {
    return `Tra ${Math.ceil(days / 7)} settimane`;
  }
  return `Tra ${Math.ceil(days / 30)} mesi`;
}

export function RaceTimeline({
  races,
  championshipId,
  registrationCounts = {},
}: RaceTimelineProps) {
  const [hoveredRace, setHoveredRace] = useState<string | null>(null);

  const chronologicalRaces = [...races].sort((a, b) => {
    if (a.event_number && b.event_number) {
      return a.event_number - b.event_number;
    }
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  const sortedRaces = [...chronologicalRaces].reverse();

  const nextRace = chronologicalRaces.find((race) => {
    const status = getRaceStatus(race);
    return status === 'open' || status === 'upcoming' || status === 'closed';
  });

  const raceItems = sortedRaces.map((race, index) => {
    const status = getRaceStatus(race);
    const visuals = statusVisuals[status];
    const isNextRace = nextRace?.id === race.id;
    const registrationCount = registrationCounts[race.id] || 0;
    const registrationLabel =
      race.max_participants != null
        ? `${registrationCount} / ${race.max_participants}`
        : registrationCount === 0
        ? 'Nessun iscritto'
        : registrationCount === 1
        ? '1 iscritto'
        : `${registrationCount} iscritti`;
    const registrationHelper =
      race.max_participants != null
        ? 'Capienza totale'
        : registrationCount === 0
        ? 'In attesa delle prime iscrizioni'
        : 'Iscrizioni confermate';
    const daysText = getDaysText(race);
    const statusLabel = getStatusLabel(status);
    const formattedDate = formatDate(race.event_date, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = race.event_time ? race.event_time.slice(0, 5) : null;

    const infoPills: Array<InfoPillProps & { key: string }> = [
      {
        key: 'date',
        icon: <Calendar className="h-4 w-4" />,
        label: 'Data',
        value: formattedDate,
        accentClass:
          'bg-gradient-to-br from-slate-100 via-white to-slate-50 text-slate-700 ring-1 ring-white/70',
      },
    ];

    if (formattedTime) {
      infoPills.push({
        key: 'time',
        icon: <Clock className="h-4 w-4" />,
        label: 'Orario',
        value: formattedTime,
        accentClass:
          'bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-indigo-600 ring-1 ring-indigo-100/70',
      });
    }

    if (race.location) {
      infoPills.push({
        key: 'location',
        icon: <MapPin className="h-4 w-4" />,
        label: 'Luogo',
        value: race.location,
        accentClass:
          'bg-gradient-to-br from-rose-50 via-white to-rose-100 text-rose-600 ring-1 ring-rose-100/70',
      });
    }

    infoPills.push({
      key: 'registrations',
      icon: <Users className="h-4 w-4" />,
      label: 'Iscritti',
      value: registrationLabel,
      helper: registrationHelper,
      accentClass:
        'bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-600 ring-1 ring-emerald-100/70',
    });

    const timelineIcon =
      status === 'completed' ? (
        <CheckCircle2 className="h-6 w-6 text-white" />
      ) : status === 'open' ? (
        <Flag className="h-6 w-6 text-white animate-pulse" />
      ) : (
        <Circle className="h-6 w-6 text-white" />
      );

    return {
      race,
      index,
      statusLabel,
      visuals,
      isNextRace,
      registrationLabel,
      daysText,
      infoPills,
      timelineIcon,
      formattedDate,
      formattedTime,
    };
  });

  if (raceItems.length === 0) {
    return null;
  }

  const showMobileHint = raceItems.length > 1;

  return (
    <div className="space-y-6">
      {showMobileHint && (
        <div className="-mx-4 md:hidden px-4">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-2 text-[11px] font-medium text-slate-500 shadow-sm">
            <ArrowLeftRight className="h-4 w-4 text-slate-400" />
            <span>Scorri lateralmente per vedere altre tappe</span>
          </div>
        </div>
      )}

      <div className="-mx-4 md:hidden">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6">
          {raceItems.map(
            ({
              race,
              statusLabel,
              visuals,
              isNextRace,
              registrationLabel,
              daysText,
              timelineIcon,
              formattedDate,
              formattedTime,
            }) => (
              <Link
                key={`mobile-${race.id}`}
                href={`/dashboard/races/championships/${championshipId}/races/${race.id}`}
                className="snap-start"
              >
                <article
                  className={cn(
                    'group relative flex h-full min-h-[280px] w-[82vw] min-w-[82vw] max-w-sm flex-col justify-between rounded-3xl border p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)] transition-all duration-300 ease-out backdrop-blur-sm',
                    visuals.card,
                    visuals.border,
                    'ring-1 ring-inset',
                    visuals.ring,
                    'hover:-translate-y-1 hover:shadow-[0_32px_70px_-50px_rgba(15,23,42,0.5)]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-full border border-white/70 shadow-lg',
                          visuals.dot,
                          isNextRace && 'ring-4 ring-sky-100/80 shadow-[0_0_0_6px_rgba(56,189,248,0.25)]'
                        )}
                      >
                        {timelineIcon}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {race.event_number && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 shadow-sm backdrop-blur"
                            >
                              Tappa {race.event_number}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur',
                              visuals.statusBadge
                            )}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        {isNextRace && (
                          <Badge className="w-fit rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                            Prossima tappa
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-inner',
                        visuals.dayBadge
                      )}
                    >
                      {daysText}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <h3 className="text-lg font-semibold text-slate-900 transition-colors duration-300 group-hover:text-slate-950">
                      {race.title}
                    </h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span className="font-semibold text-slate-700">{formattedDate}</span>
                      </div>
                      {formattedTime && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-slate-700">{formattedTime}</span>
                        </div>
                      )}
                      {race.location && (
                        <div className="flex items-start gap-2 text-slate-500">
                          <MapPin className="mt-0.5 h-4 w-4" />
                          <span className="font-medium text-slate-700 line-clamp-2">{race.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-500" />
                      {registrationLabel}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  {(race.poster_url || race.results_url) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {race.poster_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-white/70 bg-white/60 px-3 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition-colors duration-300 hover:border-sky-200 hover:bg-sky-50/80"
                          onClick={(event) => {
                            event.preventDefault();
                            window.open(race.poster_url as string, '_blank');
                          }}
                        >
                          <FileText className="mr-1.5 h-4 w-4" />
                          Locandina
                        </Button>
                      )}

                      {race.results_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-white/70 bg-white/60 px-3 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition-colors duration-300 hover:border-emerald-200 hover:bg-emerald-50/80"
                          onClick={(event) => {
                            event.preventDefault();
                            window.open(race.results_url as string, '_blank');
                          }}
                        >
                          <Trophy className="mr-1.5 h-4 w-4" />
                          Risultati
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              </Link>
            )
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <div className="space-y-10">
          {raceItems.map((item, _, array) => {
            const {
              race,
              index,
              statusLabel,
              visuals,
              isNextRace,
              daysText,
              infoPills,
              timelineIcon,
            } = item;
            const isLast = index === array.length - 1;

            return (
              <div key={race.id} className="relative flex items-stretch gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 shadow-lg transition-transform duration-300 sm:h-12 sm:w-12',
                      visuals.dot,
                      hoveredRace === race.id && '-translate-y-0.5 scale-105 shadow-xl',
                      isNextRace && 'ring-4 ring-sky-100/70 shadow-[0_0_0_6px_rgba(56,189,248,0.15)]'
                    )}
                  >
                    {timelineIcon}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'mt-2 w-px flex-1 bg-gradient-to-b',
                        visuals.connector
                      )}
                    />
                  )}
                </div>

                <Link
                  href={`/dashboard/races/championships/${championshipId}/races/${race.id}`}
                  className="flex-1"
                  onMouseEnter={() => setHoveredRace(race.id)}
                  onMouseLeave={() => setHoveredRace(null)}
                >
                  <article
                    className={cn(
                      'group relative h-full overflow-hidden rounded-3xl border p-6 shadow-[0_25px_60px_-48px_rgba(15,23,42,0.35)] transition-all duration-300 ease-out backdrop-blur-sm sm:p-7',
                      visuals.card,
                      visuals.border,
                      'ring-1 ring-inset',
                      visuals.ring,
                      hoveredRace === race.id && '-translate-y-1 shadow-[0_32px_70px_-50px_rgba(15,23,42,0.4)]',
                      isNextRace &&
                        'ring-2 ring-sky-200/70 shadow-[0_38px_70px_-52px_rgba(56,189,248,0.45)]'
                    )}
                  >
                    <div className="absolute inset-0 rounded-3xl bg-white/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10 space-y-5">
                      <header className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          {race.event_number && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 shadow-sm backdrop-blur"
                            >
                              Tappa {race.event_number}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur',
                              visuals.statusBadge
                            )}
                          >
                            {statusLabel}
                          </Badge>
                          {isNextRace && (
                            <Badge className="rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                              Prossima tappa
                            </Badge>
                          )}
                        </div>
                        <div
                          className={cn(
                            'ml-auto rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] shadow-inner',
                            visuals.dayBadge
                          )}
                        >
                          {daysText}
                        </div>
                      </header>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-slate-950">
                          {race.title}
                        </h3>
                        {race.description && (
                          <p className={cn('max-w-3xl text-sm leading-relaxed text-slate-600', visuals.muted)}>
                            {race.description}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {infoPills.map(({ key, ...pill }) => (
                          <InfoPill key={key} {...pill} />
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {race.poster_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-white/70 bg-white/60 px-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition-colors duration-300 hover:border-sky-200 hover:bg-sky-50/80"
                            onClick={(event) => {
                              event.preventDefault();
                              window.open(race.poster_url as string, '_blank');
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Locandina
                          </Button>
                        )}

                        {race.results_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-white/70 bg-white/60 px-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition-colors duration-300 hover:border-emerald-200 hover:bg-emerald-50/80"
                            onClick={(event) => {
                              event.preventDefault();
                              window.open(race.results_url as string, '_blank');
                            }}
                          >
                            <Trophy className="mr-2 h-4 w-4" />
                            Risultati
                          </Button>
                        )}

                        <div className="flex-1" />

                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full px-4 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-900 hover:text-white"
                        >
                          Dettagli
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
