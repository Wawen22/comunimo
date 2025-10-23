'use client';

import { useState } from 'react';
import { Championship } from '@/types/database';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import ChampionshipRegistrationsList from './ChampionshipRegistrationsList';
import MemberSelectionDialog from './MemberSelectionDialog';

interface ChampionshipRegistrationsProps {
  championship: Championship;
  societyId: string;
  isAdmin?: boolean;
}

export default function ChampionshipRegistrations({
  championship,
  societyId,
  isAdmin = false,
}: ChampionshipRegistrationsProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRegistrationSuccess = () => {
    // Refresh the list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestione Iscrizioni</h1>
          <p className="text-gray-600 mt-2">
            {championship.name} - {championship.season}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuova Iscrizione
        </Button>
      </div>

      {/* Registrations List */}
      <ChampionshipRegistrationsList
        key={refreshKey}
        championshipId={championship.id}
        societyId={societyId}
        onUpdate={() => setRefreshKey((prev) => prev + 1)}
      />

      {/* Member Selection Dialog */}
      <MemberSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        championship={championship}
        societyId={societyId}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}

