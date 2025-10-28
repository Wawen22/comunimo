'use client';

import { useEffect, useState } from 'react';
import type { Championship, Event } from '@/types/database';
import { CalendarRange, Globe2, History, Route, Trophy, Users, Building2, Award } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/lib/api/supabase';

interface InsightsSectionProps {
  championship: Championship | null;
  events: Event[];
}

interface LiveStats {
  totalAthletes: number;
  totalSocieties: number;
  uniqueCategories: number;
  loading: boolean;
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start || !end) return 'Calendario in definizione';
  const startDate = format(new Date(start), "d MMMM", { locale: it });
  const endDate = format(new Date(end), "d MMMM yyyy", { locale: it });
  return `${startDate} → ${endDate}`;
}

export function InsightsSection({ championship, events }: InsightsSectionProps) {
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalAthletes: 0,
    totalSocieties: 0,
    uniqueCategories: 0,
    loading: true,
  });

  const upcoming = events.filter((event) => {
    if (!event.event_date) return false;
    return new Date(event.event_date) >= new Date();
  });

  const uniqueLocations = new Set(
    events
      .map((event) => event.location?.trim())
      .filter((location): location is string => Boolean(location)),
  );

  const totalStages = events.length;
  const completed = events.filter((event) => {
    if (!event.event_date) return false;
    return new Date(event.event_date) < new Date();
  });
  const coveragePeriod = formatPeriod(championship?.start_date, championship?.end_date);

  // Fetch live statistics from championship_registrations
  useEffect(() => {
    async function fetchLiveStats() {
      if (!championship?.id) {
        setLiveStats({ totalAthletes: 0, totalSocieties: 0, uniqueCategories: 0, loading: false });
        return;
      }

      try {
        // Fetch all confirmed registrations for this championship
        const { data: registrations, error } = await supabase
          .from('championship_registrations')
          .select('society_id, category')
          .eq('championship_id', championship.id)
          .eq('status', 'confirmed');

        if (error) throw error;

        const totalAthletes = registrations?.length || 0;

        // Count unique societies
        const uniqueSocietyIds = new Set(
          registrations?.map(r => r.society_id).filter(Boolean)
        );
        const totalSocieties = uniqueSocietyIds.size;

        // Count unique categories
        const uniqueCategorySet = new Set(
          registrations?.map(r => r.category?.trim()).filter(Boolean)
        );
        const uniqueCategories = uniqueCategorySet.size;

        setLiveStats({
          totalAthletes,
          totalSocieties,
          uniqueCategories,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching live stats:', error);
        setLiveStats({ totalAthletes: 0, totalSocieties: 0, uniqueCategories: 0, loading: false });
      }
    }

    fetchLiveStats();
  }, [championship?.id]);

  const stats = [
    {
      label: 'Tappe confermate',
      value: totalStages,
      icon: Route,
    },
    {
      label: 'Tappe imminenti',
      value: upcoming.length,
      icon: Trophy,
    },
    {
      label: 'Location coinvolte',
      value: uniqueLocations.size,
      icon: Globe2,
    },
    {
      label: 'Tappe concluse',
      value: completed.length,
      icon: History,
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950">Panoramica del campionato</h2>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Una visione d'insieme per società, allenatori e atleti. Comprendi subito l'estensione della stagione e le tappe ancora da disputare.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <CalendarRange className="h-4 w-4" />
            {coveragePeriod}
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2 md:hidden" style={{ scrollbarWidth: 'none' }}>
            {stats.map((stat) => (
              <div
                key={`${stat.label}-mobile`}
                className="min-w-[160px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <stat.icon className="h-4 w-4 text-brand-blue" />
                  <span className="text-xs uppercase tracking-wide">{stat.label}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {Number.isFinite(stat.value) ? stat.value : '—'}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-red/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="relative mt-6 text-4xl font-semibold tracking-tight text-slate-950">
                  {Number.isFinite(stat.value) ? stat.value : '—'}
                </p>
                <p className="relative mt-2 text-sm font-medium uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-red">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Statistiche Live</h3>
            </div>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Dati in tempo reale sulle iscrizioni al campionato. Le statistiche vengono aggiornate automaticamente ad ogni nuova registrazione.
            </p>

            {liveStats.loading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-300" />
                    <div className="h-6 w-16 animate-pulse rounded bg-slate-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-blue/40 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10">
                      <Users className="h-4 w-4 text-brand-blue" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Atleti iscritti</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {liveStats.totalAthletes > 0 ? liveStats.totalAthletes : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-blue/40 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Società partecipanti</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {liveStats.totalSocieties > 0 ? liveStats.totalSocieties : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-blue/40 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Categorie rappresentate</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {liveStats.uniqueCategories > 0 ? liveStats.uniqueCategories : '—'}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-blue">
                📊 Aggiornamento automatico
              </p>
              <p className="mt-2 text-sm text-slate-600">
                I dati vengono sincronizzati in tempo reale dal database. Ultimo aggiornamento: {format(new Date(), "HH:mm", { locale: it })}
              </p>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            <h3 className="text-base font-semibold text-slate-900">Informazioni chiave</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt>Stagione</dt>
                <dd className="font-semibold text-slate-900">{championship?.season ?? 'Da confermare'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Ultimo aggiornamento</dt>
                <dd className="font-semibold text-slate-900">{format(new Date(), "d MMM yyyy", { locale: it })}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Copertura geografica</dt>
                <dd className="font-semibold text-slate-900">{uniqueLocations.size > 0 ? `${uniqueLocations.size} comuni` : 'In definizione'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Prossime tappe</dt>
                <dd className="font-semibold text-slate-900">{upcoming.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tipologia prove</dt>
                <dd className="font-semibold text-slate-900">Pista · Strada · Cross*</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs uppercase tracking-wide text-slate-400">
              Dati sincronizzati con Supabase in tempo reale.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
