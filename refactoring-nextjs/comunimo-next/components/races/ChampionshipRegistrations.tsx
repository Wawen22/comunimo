'use client';

import { useState } from 'react';
import { Championship } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, Trophy, Calendar, Users } from 'lucide-react';
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
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-4 sm:p-6 text-white">
          {/* Desktop Layout (≥768px) */}
          <div className="hidden md:flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6" />
                <h1 className="text-3xl font-bold">Gestione Iscrizioni</h1>
              </div>
              <div className="flex items-center gap-2 text-blue-100 mt-3">
                <Calendar className="h-4 w-4" />
                <p className="text-lg font-medium">
                  {championship.name} - {championship.season}
                </p>
              </div>
            </div>

            {/* Right side: Total Registrations Badge + Button */}
            <div className="flex items-start gap-3">
              {/* Totale Iscritti - Minimal Badge */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                <Users className="h-5 w-5" />
                <div className="text-right">
                  <div className="text-2xl font-bold leading-none">{totalRegistrations}</div>
                  <div className="text-xs text-blue-100 mt-1">iscritti</div>
                </div>
              </div>

              {/* Nuova Iscrizione button - only if societyId is not 'all' and callback provided */}
              {societyId && societyId !== 'all' && onNewRegistration && (
                <Button
                  onClick={onNewRegistration}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Nuova Iscrizione
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Layout (<768px) */}
          <div className="md:hidden space-y-4">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5" />
                <h1 className="text-2xl font-bold">Gestione Iscrizioni</h1>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Calendar className="h-4 w-4" />
                <p className="text-sm font-medium">
                  {championship.name} - {championship.season}
                </p>
              </div>
            </div>

            {/* Stats and Action - Horizontal on mobile */}
            <div className="flex items-center justify-between gap-3">
              {/* Totale Iscritti - Compact */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Users className="h-4 w-4" />
                <div>
                  <span className="text-xl font-bold">{totalRegistrations}</span>
                  <span className="text-xs text-blue-100 ml-1">iscritti</span>
                </div>
              </div>

              {/* Nuova Iscrizione button - Compact */}
              {societyId && societyId !== 'all' && onNewRegistration && (
                <Button
                  onClick={onNewRegistration}
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Iscrivi
                </Button>
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

