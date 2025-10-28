import { Metadata } from 'next';
import { EventsCalendar } from '@/components/events/EventsCalendar';

export const metadata: Metadata = {
  title: 'Eventi | ComUniMo',
  description: 'Gestione eventi, tappe e gare',
};

export default function EventsPage() {
  return (
    <div className="space-y-6">
      {/* Modern Header - Soft Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 p-6 sm:p-8 shadow-lg border border-purple-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-purple-700 mb-3 sm:mb-4 border border-purple-200">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            GESTIONE EVENTI
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Calendario Eventi
          </h1>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-2xl">
            Visualizza e gestisci eventi, tappe, gare e riunioni del Comitato Unitario Modena
          </p>
        </div>
      </div>

      <EventsCalendar />
    </div>
  );
}

