'use client';

import { useState } from 'react';
import { Calendar, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { PDFViewerModal } from './PDFViewerModal';
import type { Event } from '@/types/database';
import { isPastEvent, isCurrentEvent } from '@/lib/utils/registrationUtils';

interface StageCardProps {
  stage: Event;
  allStages: Event[];
  className?: string;
}

/**
 * Card component for displaying a championship stage
 * Shows different visual states for past/current/future events
 */
export function StageCard({ stage, allStages, className = '' }: StageCardProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const isPast = isPastEvent(stage);
  const isCurrent = isCurrentEvent(stage, allStages);
  const eventDate = new Date(stage.event_date);
  const formattedDate = format(eventDate, "d MMM yyyy", { locale: it });

  // Determine card styling based on state
  const cardClasses = isPast
    ? 'bg-gray-50 border-gray-200 opacity-75'
    : isCurrent
    ? 'bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 border-brand-blue shadow-xl ring-2 ring-brand-blue/30'
    : 'bg-white border-gray-200 hover:border-brand-blue/50 hover:shadow-2xl hover:-translate-y-2';

  const titleClasses = isPast
    ? 'text-gray-600'
    : isCurrent
    ? 'text-brand-blue font-extrabold'
    : 'text-brand-blue-dark group-hover:text-brand-blue';

  return (
    <>
      <div
        className={`group relative flex h-full min-h-[340px] flex-col rounded-3xl border-2 p-5 transition-all duration-300 ${cardClasses} ${className}`}
      >
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-blue/0 to-brand-red/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

        {/* Status Badge - Top Right Corner */}
        <div className="absolute right-4 top-4 z-10">
          {isPast ? (
            <div className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">Completata</span>
            </div>
          ) : isCurrent ? (
            <div className="animate-pulse-scale flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-red px-3 py-1.5 shadow-xl">
              <span className="text-xs font-bold text-white">🔥 Prossima</span>
            </div>
          ) : null}
        </div>

        {/* Event Number Badge */}
        {stage.event_number && (
          <div className="relative z-10 mb-3 inline-flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark shadow-lg">
              <span className="text-base font-extrabold text-white">{stage.event_number}</span>
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className={`relative z-10 mb-3 text-lg font-bold leading-tight transition-colors ${titleClasses}`}>
          {stage.title}
        </h3>

        {/* Date & Location Container */}
        <div className="relative z-10 mb-3 space-y-1.5">
          {/* Date */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700">
            <Calendar className="h-3.5 w-3.5 text-brand-blue" />
            <span>{formattedDate}</span>
          </div>

          {/* Location */}
          {stage.location && (
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700">
              <MapPin className="h-3.5 w-3.5 text-brand-blue" />
              <span className="line-clamp-1">{stage.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {stage.description && (
          <p className="relative z-10 mb-3 line-clamp-2 flex-grow text-xs leading-relaxed text-muted-foreground">
            {stage.description}
          </p>
        )}

        {/* Action Buttons - Always at bottom */}
        <div className="relative z-10 mt-auto space-y-2">
          {/* Poster Button */}
          {stage.poster_url ? (
            <Button
              onClick={() => setPdfModalOpen(true)}
              variant="outline"
              size="sm"
              className="group/btn w-full overflow-hidden border-2 border-brand-blue/30 bg-white font-semibold transition-all hover:border-brand-blue hover:bg-brand-blue hover:text-white"
            >
              <FileText className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
              Visualizza Locandina
            </Button>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-3 text-xs font-medium text-muted-foreground">
              Locandina non disponibile
            </div>
          )}

          {/* Results Link (if available and event is past) */}
          {isPast && stage.results_url && (
            <Button
              onClick={() => window.open(stage.results_url!, '_blank')}
              variant="outline"
              size="sm"
              className="w-full border-2 border-green-500/30 bg-green-50 font-semibold text-green-700 transition-all hover:border-green-500 hover:bg-green-500 hover:text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Visualizza Risultati
            </Button>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {stage.poster_url && (
        <PDFViewerModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={stage.poster_url}
          title={`Locandina - ${stage.title}`}
        />
      )}
    </>
  );
}

