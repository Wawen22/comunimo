import { Metadata } from 'next';
import { ChampionshipsList } from '@/components/races/ChampionshipsList';

export const metadata: Metadata = {
  title: 'Campionati | ComUniMo',
  description: 'Gestione campionati e gare',
};

export default function ChampionshipsPage() {
  return (
    <div className="space-y-6">
      {/* Modern Header - Soft Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 sm:p-8 shadow-lg border border-orange-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-orange-700 mb-3 sm:mb-4 border border-orange-200">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            GESTIONE CAMPIONATI
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Campionati
          </h1>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-2xl">
            Gestisci i campionati e le relative gare del Comitato Unitario Modena
          </p>
        </div>
      </div>

      {/* Championships List */}
      <ChampionshipsList />
    </div>
  );
}

