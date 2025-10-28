'use client';

import { useState } from 'react';
import { Championship } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, Trophy, Calendar, Users, Sparkles } from 'lucide-react';
import ChampionshipRegistrationsList from './ChampionshipRegistrationsList';
import MemberSelectionDialog from './MemberSelectionDialog';

interface ChampionshipRegistrationsProps {
  championship: Championship;
  societyId: string;
  isAdmin?: boolean;
  totalRegistrations?: number;
  onlyHeader?: boolean;
  onNewRegistration?: () => void;
}

export default function ChampionshipRegistrations({
  championship,
  societyId,
  isAdmin = false,
  totalRegistrations = 0,
  onlyHeader = false,
  onNewRegistration,
}: ChampionshipRegistrationsProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRegistrationSuccess = () => {
    // Refresh the list
    setRefreshKey((prev) => prev + 1);
  };

  // If onlyHeader is true, render only the header card
  if (onlyHeader) {
    return (
      <Card className="overflow-hidden border border-blue-100 shadow-lg">
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full -ml-48 -mb-48 blur-3xl" />

          {/* Desktop Layout (≥768px) */}
          <div className="hidden md:flex items-start justify-between gap-4 relative z-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-blue-700 mb-3 border border-blue-200 shadow-md">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                GESTIONE ISCRIZIONI
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-gray-900" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Iscrizioni Campionato</h1>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mt-3">
                <Calendar className="h-4 w-4" />
                <p className="text-base sm:text-lg font-semibold">
                  {championship.name} {championship.season && `- ${championship.season}`}
                </p>
              </div>
            </div>

            {/* Right side: Total Registrations Badge + Button */}
            <div className="flex items-start gap-3">
              {/* Totale Iscritti - Enhanced Badge */}
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-xl border border-blue-200 shadow-md">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold leading-none text-gray-900">{totalRegistrations}</div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">Iscritti</div>
                </div>
              </div>

              {/* Nuova Iscrizione button - only if societyId is not 'all' and callback provided */}
              {societyId && societyId !== 'all' && onNewRegistration && (
                <div className="relative">
                  {/* Step 2 Badge - Floating above button */}
                  <div className="absolute -top-3 -left-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    STEP 2
                  </div>
                  <Button
                    onClick={onNewRegistration}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold ring-2 ring-green-300 ring-offset-2"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Nuova Iscrizione
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout (<768px) */}
          <div className="md:hidden space-y-4 relative z-10">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-blue-700 mb-3 border border-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                GESTIONE ISCRIZIONI
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-gray-900" />
                <h1 className="text-2xl font-bold text-gray-900">Iscrizioni</h1>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <p className="text-sm font-semibold">
                  {championship.name} {championship.season && `- ${championship.season}`}
                </p>
              </div>
            </div>

            {/* Stats and Action - Horizontal on mobile */}
            <div className="flex items-center justify-between gap-3">
              {/* Totale Iscritti - Compact */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-lg border border-blue-200 shadow-md">
                <Users className="h-4 w-4" />
                <div>
                  <span className="text-xl font-bold">{totalRegistrations}</span>
                  <span className="text-xs text-blue-100 ml-1">iscritti</span>
                </div>
              </div>

              {/* Nuova Iscrizione button - Compact */}
              {societyId && societyId !== 'all' && onNewRegistration && (
                <div className="relative">
                  {/* Step 2 Badge - Floating above button */}
                  <div className="absolute -top-2 -left-2 z-10 bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    STEP 2
                  </div>
                  <Button
                    onClick={onNewRegistration}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg ring-2 ring-green-300"
                  >
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Iscrivi
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Full component with list
  return (
    <div className="space-y-6">
      {/* Registrations List */}
      <ChampionshipRegistrationsList
        key={refreshKey}
        championshipId={championship.id}
        societyId={societyId}
        onUpdate={() => setRefreshKey((prev) => prev + 1)}
      />

      {/* Member Selection Dialog - only render if specific society selected */}
      {societyId !== 'all' && (
        <MemberSelectionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          championship={championship}
          societyId={societyId}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}

