import { Metadata } from 'next';
import { SocietiesList } from '@/components/societies/SocietiesList';

export const metadata: Metadata = {
  title: 'Società | ComUniMo',
  description: 'Gestione società sportive',
};

export default function SocietiesPage() {
  return (
    <div className="space-y-6">
      {/* Modern Header - Soft Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 shadow-lg border border-blue-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-blue-700 mb-3 sm:mb-4 border border-blue-200">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            GESTIONE SOCIETÀ
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Società Sportive
          </h1>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-2xl">
            Gestisci le società sportive affiliate al Comitato Unitario Modena
          </p>
        </div>
      </div>

      <SocietiesList />
    </div>
  );
}

