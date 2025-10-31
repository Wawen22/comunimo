'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Championship, Race } from '@/types/database';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChampionshipRankingUpload } from '@/components/races/ChampionshipRankingUpload';
import { StageRankingUpload } from '@/components/races/StageRankingUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Download, PencilLine, Building2, Award, CheckCircle2, Clock3, MapPin, Calendar, FileCheck2, LineChart, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChampionshipRankingKind = 'society' | 'individual';

interface ChampionshipRankingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  championship: Championship;
  races: Race[];
  isAdmin: boolean;
  onUpdateChampionshipRanking: (kind: ChampionshipRankingKind, url: string | null) => void;
  onUpdateRaceRanking: (raceId: string, url: string | null) => void;
}

const CHAMPIONSHIP_RANKING_META: Array<{
  kind: ChampionshipRankingKind;
  title: string;
  description: string;
  icon: typeof Building2;
}> = [
  {
    kind: 'society',
    title: 'Classifica Società',
    description: 'Graduatoria a squadre aggiornata dopo ogni tappa.',
    icon: Building2,
  },
  {
    kind: 'individual',
    title: 'Classifica Individuale',
    description: 'Punteggio cumulativo degli atleti nel campionato.',
    icon: Award,
  },
];

function formatRaceDate(date: string | null) {
  if (!date) return 'Data da definire';
  try {
    return format(new Date(date), "d MMM yyyy", { locale: it });
  } catch (error) {
    return 'Data da definire';
  }
}

export function ChampionshipRankingsModal({
  open,
  onOpenChange,
  championship,
  races,
  isAdmin,
  onUpdateChampionshipRanking,
  onUpdateRaceRanking,
}: ChampionshipRankingsModalProps) {
  const [editingChampRanking, setEditingChampRanking] = useState<ChampionshipRankingKind | null>(null);
  const [editingRaceId, setEditingRaceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'championship' | 'stages'>('championship');

  const sortedRaces = useMemo(() => {
    return [...races].sort((a, b) => {
      const aNumber = a.event_number ?? 0;
      const bNumber = b.event_number ?? 0;
      if (aNumber === bNumber) {
        return (a.event_date ?? '').localeCompare(b.event_date ?? '');
      }
      return aNumber - bNumber;
    });
  }, [races]);

  const stageRankingsCount = sortedRaces.filter((race) => Boolean(race.results_url)).length;
  const championshipRankingsCount = [championship.society_ranking_url, championship.individual_ranking_url].filter(Boolean).length;

  const handleChampionshipChange = (kind: ChampionshipRankingKind, url: string | null) => {
    onUpdateChampionshipRanking(kind, url);
    setEditingChampRanking(null);
  };

  const handleStageChange = (raceId: string, url: string | null) => {
    onUpdateRaceRanking(raceId, url);
    setEditingRaceId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-0 p-0 overflow-hidden md:max-w-5xl">
        <div className="flex h-full max-h-[min(90vh,860px)] flex-col overflow-hidden">
          <div className="flex-shrink-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-white px-5 py-5 shadow-sm sm:px-8 sm:py-7">
            <DialogHeader className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                <BarChart3 className="h-3 w-3" />
                Classifiche
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-900 sm:text-3xl">
                Riepilogo Classifiche Campionato
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 sm:max-w-3xl">
                Consulta e gestisci tutte le classifiche ufficiali: i PDF caricati da qui saranno immediatamente disponibili per società, atleti e pubblico.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
            <div className="space-y-6">
              <div className="grid gap-4 rounded-3xl border border-blue-100 bg-white/85 p-5 shadow-sm sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                    <Layers className="h-4 w-4" />
                    Campionato
                  </span>
                  <span className="text-2xl font-bold text-slate-900">{championshipRankingsCount}/2</span>
                  <span className="text-xs text-slate-500">Classifiche campionato disponibili</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    <FileCheck2 className="h-4 w-4" />
                    Tappe
                  </span>
                  <span className="text-2xl font-bold text-slate-900">{stageRankingsCount}/{sortedRaces.length}</span>
                  <span className="text-xs text-slate-500">Classifiche tappa pubblicate</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    <LineChart className="h-4 w-4" />
                    Totale download
                  </span>
                  <span className="text-2xl font-bold text-slate-900">{championshipRankingsCount + stageRankingsCount}</span>
                  <span className="text-xs text-slate-500">PDF pronti per la condivisione</span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'championship' | 'stages')} className="space-y-5">
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

                <TabsContent value="championship" className="mt-0 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {CHAMPIONSHIP_RANKING_META.map(({ kind, title, description, icon: Icon }) => {
                      const url = kind === 'society' ? championship.society_ranking_url : championship.individual_ranking_url;
                      const isEditing = editingChampRanking === kind;
                      const isAvailable = Boolean(url);

                      return (
                        <div
                          key={kind}
                          className="group rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                                <Icon className="h-4 w-4" />
                                {title}
                              </span>
                              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  'px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                                  isAvailable ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200',
                                )}
                              >
                                {isAvailable ? 'Aggiornata' : 'In attesa'}
                              </Badge>
                              {isAdmin && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingChampRanking(isEditing ? null : kind)}
                                  className="text-slate-500 hover:text-slate-900"
                                >
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            {isAvailable ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
                                onClick={() => window.open(url!, '_blank', 'noopener,noreferrer')}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Apri PDF
                              </Button>
                            ) : (
                              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                                <Clock3 className="h-4 w-4" />
                                Non ancora pubblicata
                              </div>
                            )}
                          </div>

                          {isAdmin && isEditing && (
                            <div className="mt-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
                              <ChampionshipRankingUpload
                                championshipId={championship.id}
                                kind={kind}
                                currentUrl={url || null}
                                onChange={(value) => handleChampionshipChange(kind, value)}
                                showHeading={false}
                                className="border-0 bg-transparent p-0"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="stages" className="mt-0 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Classifiche delle Tappe</h3>
                      <p className="text-sm text-slate-600">Scarica o aggiorna i PDF pubblicati dopo ogni gara.</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      {stageRankingsCount}/{sortedRaces.length} pubblicate
                    </Badge>
                  </div>

                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 sm:max-h-[320px] md:max-h-[360px]">
                    {sortedRaces.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                        Nessuna tappa disponibile al momento.
                      </div>
                    ) : (
                      sortedRaces.map((race) => {
                        const isAvailable = Boolean(race.results_url);
                        const isEditing = editingRaceId === race.id;

                        return (
                          <div
                            key={race.id}
                            className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                                    {race.event_number ? `Tappa ${race.event_number}` : 'Tappa'}
                                  </Badge>
                                  <span className="text-base font-semibold text-slate-900">{race.title}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatRaceDate(race.event_date)}
                                  </span>
                                  {race.location && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {race.location}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  className={cn(
                                    'px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                                    isAvailable ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200',
                                  )}
                                >
                                  {isAvailable ? 'Pubblicata' : 'In attesa'}
                                </Badge>
                                {isAvailable ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:bg-blue-50"
                                    onClick={() => window.open(race.results_url!, '_blank', 'noopener,noreferrer')}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Apri PDF
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock3 className="h-4 w-4" />
                                    Non disponibile
                                  </div>
                                )}

                                {isAdmin && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setEditingRaceId(isEditing ? null : race.id)}
                                    className="text-slate-500 hover:text-slate-900"
                                  >
                                    <PencilLine className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {isAdmin && isEditing && (
                              <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
                                <StageRankingUpload
                                  championshipId={championship.id}
                                  raceId={race.id}
                                  currentUrl={race.results_url || null}
                                  onChange={(value) => handleStageChange(race.id, value)}
                                  showHeading={false}
                                  className="border-0 bg-transparent p-0"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 p-4 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-blue-900">
                  <CheckCircle2 className="h-4 w-4" />
                  Le classifiche pubblicate sono immediatamente visibili sul sito pubblico.
                </div>
                <div className="text-[11px] uppercase tracking-wider text-blue-600">
                  {championshipRankingsCount + stageRankingsCount} file disponibili in totale
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
