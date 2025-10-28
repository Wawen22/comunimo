'use client';

import { useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { AlarmClock, CalendarClock, FileText, MapPin } from 'lucide-react';
import type { Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { PDFViewerModal } from './PDFViewerModal';
import { getNextEvent } from '@/lib/utils/registrationUtils';

interface NextEventSectionProps {
  events: Event[];
  loading: boolean;
}

export function NextEventSection({ events, loading }: NextEventSectionProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const nextEvent = getNextEvent(events);

  if (loading) {
    return (
      <section className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="space-y-6">
            <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-12 w-2/3 animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-24 w-full animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (!nextEvent) {
    return (
      <section className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
              <AlarmClock className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight">Prossima tappa in arrivo</h2>
            <p className="mt-4 text-base text-slate-600">
              Stiamo definendo le prossime gare. Torna presto per trovare tutti i dettagli aggiornati.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const eventDate = new Date(nextEvent.event_date);
  const formattedDate = format(eventDate, "EEEE d MMMM yyyy", { locale: it });
  const formattedTime = nextEvent.event_time
    ? format(new Date(`2000-01-01T${nextEvent.event_time}`), 'HH:mm')
    : null;
  const registrationDeadline = nextEvent.registration_end_date
    ? format(new Date(nextEvent.registration_end_date), "d MMMM yyyy 'alle' HH:mm", { locale: it })
    : null;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
              <CalendarClock className="h-4 w-4 text-brand-blue" />
              Prossima tappa ufficiale
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-semibold tracking-tight md:text-[42px] text-slate-900">
                {nextEvent.title}
              </h2>
              <p className="text-lg text-slate-600">
                {nextEvent.description ?? 'Preparati alla prossima gara del campionato provinciale.'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Data e orario</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{formattedDate}</p>
                {formattedTime && <p className="text-sm text-slate-600">Ore {formattedTime}</p>}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <MapPin className="h-5 w-5 text-brand-blue" />
                  {nextEvent.location ?? 'Da definire'}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Countdown</p>
              <CountdownTimer targetDate={eventDate} className="mt-6" />
            </div>

            {registrationDeadline && (
              <p className="text-sm text-slate-600">
                Iscrizioni aperte fino al <span className="font-semibold text-slate-900">{registrationDeadline}</span>
              </p>
            )}

            {nextEvent.poster_url && (
              <Button
                onClick={() => setPdfModalOpen(true)}
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-white px-6 py-3 text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue/5"
              >
                <FileText className="h-5 w-5" />
                Scarica la locandina
              </Button>
            )}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Perché non puoi perderla</h3>
            <p className="mt-3 leading-relaxed">
              Questa tappa assegna punti fondamentali per la classifica generale e coinvolge tutte le società affiliate.
              Presentati con il team al completo e assicurati che le iscrizioni siano confermate entro il termine previsto.
            </p>
            <hr className="my-6 border-slate-200" />
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>Assistenza iscrizioni in loco.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <span>Sintesi risultati pubblicati entro 24 ore.</span>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs uppercase tracking-wide text-slate-500">
              Mancano {Math.max(differenceInCalendarDays(eventDate, new Date()), 0)} giorni alla gara
            </div>
          </aside>
        </div>
      </div>

      {nextEvent.poster_url && (
        <PDFViewerModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={nextEvent.poster_url}
          title={`Locandina - ${nextEvent.title}`}
        />
      )}
    </section>
  );
}
