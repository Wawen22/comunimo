'use client';

import type { Championship, Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  FileBarChart,
  FileText,
  Flag,
  Hourglass,
  MapPin,
  Trophy,
} from 'lucide-react';

interface RankingSectionProps {
  championship: Championship | null;
  events: Event[];
  loading: boolean;
  sectionId?: string;
}

const championshipCards = [
  {
    key: 'society' as const,
    title: 'Classifica Società',
    description: 'Graduatoria complessiva delle società iscritte al campionato.',
    icon: Building2,
    emptyMessage: 'La classifica società sarà pubblicata dopo le prossime tappe.',
  },
  {
    key: 'individual' as const,
    title: 'Classifica Individuale',
    description: 'Andamento dei punteggi individuali aggiornati gara dopo gara.',
    icon: Award,
    emptyMessage: 'La classifica individuale sarà disponibile a breve.',
  },
];

function formatStageDate(date: string | null | undefined) {
  if (!date) return 'Data da definire';
  try {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  } catch (error) {
    return 'Data da definire';
  }
}

export function RankingSection({ championship, events, loading, sectionId }: RankingSectionProps) {
  if (!championship && !loading) {
    return null;
  }

  const championshipEntries = championshipCards.map((card) => {
    const url =
      card.key === 'society'
        ? championship?.society_ranking_url
        : championship?.individual_ranking_url;

    return {
      ...card,
      url: url || null,
    };
  });

  const availableChampionshipRankings = championshipEntries.filter((entry) => Boolean(entry.url)).length;

  const stageItems = events
    .filter((event) => Boolean(event.event_date))
    .sort((a, b) => {
      if (!a.event_date || !b.event_date) return 0;
      return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
    });

  const now = new Date();
  const completedStages = stageItems.filter((stage) => stage.event_date && new Date(stage.event_date) < now).length;
  const availableStageRankings = stageItems.filter((stage) => Boolean(stage.results_url)).length;

  return (
    <section
      id={sectionId}
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-100 py-24"
    >
      <div className="absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="space-y-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                <FileBarChart className="h-3.5 w-3.5" />
                Classifiche ufficiali
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                  Una vista completa su tutte le classifiche del campionato
                </h2>
                <p className="max-w-2xl text-base text-slate-600">
                  Consulta rapidamente le classifiche aggregate del campionato oppure esplora i risultati delle singole tappe: tutto aggiornato in tempo reale man mano che vengono pubblicati i PDF ufficiali.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-4 rounded-3xl border border-blue-100 bg-white/85 p-5 shadow-sm sm:grid-cols-3 lg:w-auto">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  <Trophy className="h-4 w-4" />
                  Campionato
                </span>
                <span className="text-2xl font-bold text-slate-900">{availableChampionshipRankings}/2</span>
                <span className="text-xs text-slate-500">Classifiche aggregate pubblicate</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Tappe
                </span>
                <span className="text-2xl font-bold text-slate-900">{availableStageRankings}/{stageItems.length}</span>
                <span className="text-xs text-slate-500">Risultati tappa disponibili</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  <Flag className="h-4 w-4" />
                  Avanzamento
                </span>
                <span className="text-2xl font-bold text-slate-900">{completedStages}/{stageItems.length}</span>
                <span className="text-xs text-slate-500">Tappe concluse finora</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="championship" className="space-y-6">
            <TabsList className="w-full justify-start rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <TabsTrigger
                value="championship"
                className="flex-1 rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Classifiche campionato
              </TabsTrigger>
              <TabsTrigger
                value="stages"
                className="flex-1 rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Classifiche tappe
              </TabsTrigger>
            </TabsList>

            <TabsContent value="championship" className="mt-0">
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {championshipEntries.map((entry) => (
                    <div key={entry.key} className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="mt-4 h-3 w-48 animate-pulse rounded bg-slate-200" />
                      <div className="mt-6 h-10 w-full animate-pulse rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {championshipEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                          <entry.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                        </div>
                      </div>

                      {entry.url ? (
                        <div className="mt-6 flex items-center justify-between">
                          <Badge className="bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                            Disponibile
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
                            onClick={() => window.open(entry.url!, '_blank', 'noopener,noreferrer')}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Apri PDF
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                          <div className="inline-flex items-center gap-2">
                            <Hourglass className="h-4 w-4" />
                            {entry.emptyMessage}
                          </div>
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400">
                            In aggiornamento
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stages" className="mt-0 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-48 animate-pulse rounded bg-slate-200" />
                      <div className="mt-4 h-9 w-full animate-pulse rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : stageItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  Nessuna tappa disponibile al momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {stageItems.map((stage) => {
                    const isAvailable = Boolean(stage.results_url);
                    const isCompleted = stage.event_date ? new Date(stage.event_date) < now : false;

                    return (
                      <div
                        key={stage.id}
                        className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                              {stage.event_number ?? '—'}
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-slate-900">{stage.title}</h4>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatStageDate(stage.event_date)}
                                </span>
                                {stage.location && (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {stage.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              className={cn(
                                'px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                                isCompleted
                                  ? isAvailable
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                  : 'bg-blue-100 text-blue-700 border-blue-200',
                              )}
                            >
                              {isCompleted ? (isAvailable ? 'Pubblicata' : 'In attesa') : 'In programma'}
                            </Badge>

                            {isAvailable ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
                                onClick={() => window.open(stage.results_url!, '_blank', 'noopener,noreferrer')}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Apri PDF
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
