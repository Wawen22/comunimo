import { MembersList } from '@/components/members/MembersList';
import { MemberStats } from '@/components/members/MemberStats';

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Modern Header - Soft Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 sm:p-8 shadow-lg border border-green-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-green-700 mb-3 sm:mb-4 border border-green-200">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            GESTIONE ATLETI
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Atleti
          </h1>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-2xl">
            Gestisci gli atleti e le iscrizioni alle gare del campionato
          </p>
        </div>
      </div>

      {/* Statistics */}
      <MemberStats />

      {/* Members List */}
      <MembersList />
    </div>
  );
}

