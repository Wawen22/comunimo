'use client';

import {
  useState,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { format, isPast, isFuture, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, MapPin, Clock, Users, FileText, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import type { Event } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PDFViewerModal } from './PDFViewerModal';

interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
}

/**
 * Modern event card component
 * Features:
 * - Glassmorphism effect
 * - Gradient overlays on hover
 * - Status badges (upcoming/past)
 * - Registration info
 * - Poster preview
 * - Smooth animations
 */
export function EventCard({ event, onSelect }: EventCardProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const eventDate = new Date(event.event_date);
  const isEventPast = isPast(eventDate);
  const isEventUpcoming = isFuture(eventDate);
  const daysUntil = differenceInDays(eventDate, new Date());

  // Registration status
  const registrationOpen = event.registration_start_date && event.registration_end_date
    ? new Date() >= new Date(event.registration_start_date) && new Date() <= new Date(event.registration_end_date)
    : false;

  const registrationClosed = event.registration_end_date
    ? new Date() > new Date(event.registration_end_date)
    : false;

  // Format dates
  const formattedDate = format(eventDate, "EEEE d MMMM yyyy", { locale: it });
  const formattedTime = event.event_time
    ? format(new Date(`2000-01-01T${event.event_time}`), 'HH:mm')
    : null;

  const registrationDeadline = event.registration_end_date
    ? format(new Date(event.registration_end_date), "d MMM yyyy", { locale: it })
    : null;

  // Gradient based on status
  const gradientClass = isEventPast
    ? 'from-slate-500/5 to-slate-600/5'
    : isEventUpcoming && daysUntil <= 7
    ? 'from-orange-500/5 to-red-500/5'
    : 'from-purple-500/5 to-pink-500/5';

  const borderClass = isEventPast
    ? 'border-slate-200 hover:border-slate-400'
    : isEventUpcoming && daysUntil <= 7
    ? 'border-orange-200 hover:border-orange-400'
    : 'border-purple-200 hover:border-purple-400';

  const interactivityClasses = onSelect
    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2'
    : '';

  const handleSelect = () => {
    if (onSelect) {
      onSelect(event);
    }
  };

  const handlePosterClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPdfModalOpen(true);
  };

  const handleModalClose = () => {
    setPdfModalOpen(false);
  };

  const handleKeyDown = (keyboardEvent: ReactKeyboardEvent<HTMLElement>) => {
    if (!onSelect) return;
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      onSelect(event);
    }
  };

  return (
    <>
      <article
        className={`group relative overflow-hidden rounded-[24px] border-2 ${borderClass} bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${interactivityClasses}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleSelect}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

        {/* Content */}
        <div className="relative flex flex-col gap-5 p-6">
          {/* Header with Badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {/* Status Badge */}
              {isEventPast ? (
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-300">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completato
                </Badge>
              ) : daysUntil <= 7 && daysUntil >= 0 ? (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  <Clock className="mr-1 h-3 w-3" />
                  Tra {daysUntil} {daysUntil === 1 ? 'giorno' : 'giorni'}
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  <Calendar className="mr-1 h-3 w-3" />
                  In Programma
                </Badge>
              )}

              {/* Registration Badge */}
              {!isEventPast && registrationOpen && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                  <Users className="mr-1 h-3 w-3" />
                  Iscrizioni Aperte
                </Badge>
              )}
              {!isEventPast && registrationClosed && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 border border-red-300">
                  <XCircle className="mr-1 h-3 w-3" />
                  Iscrizioni Chiuse
                </Badge>
              )}
            </div>

            {/* Event Number */}
            {event.event_number && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-sm font-bold text-purple-700">
                #{event.event_number}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-purple-600">
              {event.title}
            </h3>
            {event.description && (
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {event.description}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{formattedDate}</p>
                {formattedTime && (
                  <p className="text-xs text-slate-600">Ore {formattedTime}</p>
                )}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
                <p className="text-sm text-slate-700">{event.location}</p>
              </div>
            )}

            {/* Registration Deadline */}
            {!isEventPast && registrationDeadline && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600">Scadenza iscrizioni</p>
                  <p className="text-sm font-medium text-slate-900">{registrationDeadline}</p>
                </div>
              </div>
            )}

            {/* Max Participants */}
            {event.max_participants && (
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-sm text-slate-700">
                  Max {event.max_participants} partecipanti
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            {/* Poster Button */}
            {event.poster_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePosterClick}
                className="flex-1 border-2 border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Locandina
              </Button>
            )}

            {/* Results Button */}
            {isEventPast && event.results_url && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 border-2 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                <a
                  href={event.results_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Classifiche
                </a>
              </Button>
            )}
          </div>

          {/* Specialties Badge */}
          {event.has_specialties && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 px-3 py-2">
              <p className="text-xs font-medium text-purple-700">
                ✨ Evento con specialità multiple
              </p>
            </div>
          )}
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-[24px] border-2 border-transparent bg-gradient-to-br from-purple-400 via-pink-400 to-violet-400 opacity-0 transition-opacity duration-300 group-hover:opacity-20" style={{ zIndex: -1 }} />
      </article>

      {/* PDF Viewer Modal */}
      {event.poster_url && (
        <PDFViewerModal
          isOpen={pdfModalOpen}
          onClose={handleModalClose}
          pdfUrl={event.poster_url}
          title={`Locandina - ${event.title}`}
        />
      )}
    </>
  );
}
