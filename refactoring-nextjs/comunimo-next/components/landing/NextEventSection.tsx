'use client';

import { useState } from 'react';
import { Calendar, MapPin, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { PDFViewerModal } from './PDFViewerModal';
import { ScrollReveal } from './ScrollReveal';
import type { Event } from '@/types/database';
import { getNextEvent } from '@/lib/utils/registrationUtils';

interface NextEventSectionProps {
  events: Event[];
  loading: boolean;
}

/**
 * Section displaying the next upcoming championship event
 */
export function NextEventSection({ events, loading }: NextEventSectionProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const nextEvent = getNextEvent(events);

  if (loading) {
    return (
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-auto mt-4 h-12 w-96 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-auto mt-8 h-24 w-full max-w-md animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  if (!nextEvent) {
    return (
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-blue-dark md:text-4xl">
              Prossima Tappa
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Nessuna gara in programma al momento
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Controlla più tardi per aggiornamenti
            </p>
          </div>
        </div>
      </section>
    );
  }

  const eventDate = new Date(nextEvent.event_date);
  const formattedDate = format(eventDate, "d MMMM yyyy", { locale: it });
  const formattedTime = nextEvent.event_time
    ? format(new Date(`2000-01-01T${nextEvent.event_time}`), 'HH:mm')
    : null;

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-4 py-2">
                <Clock className="h-5 w-5 text-brand-blue" />
                <span className="text-sm font-bold uppercase tracking-wider text-brand-blue">Prossima Tappa</span>
              </div>
              <h2 className="bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl lg:text-6xl">
                {nextEvent.title}
              </h2>

              {/* Event Details */}
              <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
                <div className="flex items-center gap-2 rounded-full bg-brand-blue/5 px-4 py-2 text-lg text-muted-foreground">
                  <Calendar className="h-5 w-5 text-brand-blue" />
                  <span>
                    {formattedDate}
                    {formattedTime && ` - ${formattedTime}`}
                  </span>
                </div>
                {nextEvent.location && (
                  <div className="flex items-center gap-2 rounded-full bg-brand-blue/5 px-4 py-2 text-lg text-muted-foreground">
                    <MapPin className="h-5 w-5 text-brand-blue" />
                    <span>{nextEvent.location}</span>
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              <div className="mt-12">
                <p className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Mancano
                </p>
                <CountdownTimer targetDate={eventDate} />
              </div>

            {/* Registration Deadline */}
            {nextEvent.registration_end_date && (
              <p className="mt-8 text-sm text-muted-foreground">
                Iscrizioni entro il{' '}
                {format(new Date(nextEvent.registration_end_date), "d MMMM yyyy 'alle' HH:mm", {
                  locale: it,
                })}
              </p>
            )}

              {/* Poster Button */}
              {nextEvent.poster_url && (
                <Button
                  onClick={() => setPdfModalOpen(true)}
                  size="lg"
                  className="group mt-10 border-brand-blue/30 bg-brand-blue/5 px-8 py-6 text-lg font-semibold text-brand-blue transition-all hover:scale-105 hover:border-brand-blue hover:bg-brand-blue hover:text-white hover:shadow-xl"
                  variant="outline"
                >
                  <FileText className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                  Visualizza Locandina
                </Button>
              )}

              {/* Description */}
              {nextEvent.description && (
                <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {nextEvent.description}
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {nextEvent.poster_url && (
        <PDFViewerModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={nextEvent.poster_url}
          title={`Locandina - ${nextEvent.title}`}
        />
      )}
    </>
  );
}

