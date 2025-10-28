'use client';

import { Race } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Flag, CheckCircle2, Circle, Users } from 'lucide-react';
import { getRaceStatus, getStatusLabel, getDaysUntilRace } from '@/lib/utils/raceUtils';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface ChampionshipStagesModalProps {
  races: Race[];
  championshipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationCounts?: Record<string, number>;
}

export function ChampionshipStagesModal({ 
  races, 
  championshipId, 
  open, 
  onOpenChange,
  registrationCounts = {}
}: ChampionshipStagesModalProps) {
  const sortedRaces = [...races].sort((a, b) => {
    if (a.event_number && b.event_number) {
      return a.event_number - b.event_number;
    }
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'open':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'closed':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const formatTime = (timeString: string) => {
    // event_time è già in formato "HH:MM:SS" o "HH:MM"
    // Estraiamo solo ore e minuti
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
              <Flag className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Tappe del Campionato</DialogTitle>
          </div>
          <DialogDescription>
            {races.length} {races.length === 1 ? 'tappa' : 'tappe'} in questo campionato
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sortedRaces.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Nessuna tappa</h3>
              <p className="text-gray-500 mt-2">Non ci sono ancora tappe in questo campionato</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedRaces.map((race, index) => {
                const status = getRaceStatus(race);
                const statusLabel = getStatusLabel(status);
                const statusColor = getStatusColor(status);
                const daysUntil = getDaysUntilRace(race);
                const registrationCount = registrationCounts[race.id] || 0;

                return (
                  <Link
                    key={race.id}
                    href={`/dashboard/races/championships/${championshipId}/races/${race.id}`}
                    className="block"
                  >
                    <div className="group relative bg-white hover:bg-gradient-to-br hover:from-orange-50/50 hover:to-yellow-50/50 border-2 border-gray-200 hover:border-orange-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg cursor-pointer">
                      {/* Tappa Number Badge */}
                      <div className="absolute -top-3 -left-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg border-2 border-white">
                        {race.event_number || index + 1}
                      </div>

                      <div className="ml-6 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                              {race.title}
                            </h3>
                            {race.subtitle && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{race.subtitle}</p>
                            )}
                          </div>
                          <Badge className={`${statusColor} border shadow-sm flex items-center gap-1 flex-shrink-0`}>
                            {getStatusIcon(status)}
                            {statusLabel}
                          </Badge>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {/* Data */}
                          <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                            <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Data</p>
                              <p className="font-semibold text-gray-900 truncate">
                                {formatDate(race.event_date)}
                              </p>
                            </div>
                          </div>

                          {/* Ora */}
                          {race.event_time && (
                            <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Ora</p>
                                <p className="font-semibold text-gray-900 truncate">
                                  {formatTime(race.event_time)}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Località */}
                          {race.location && (
                            <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Località</p>
                                <p className="font-semibold text-gray-900 truncate">
                                  {race.location}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Iscritti */}
                          <div className="flex items-center gap-2 text-sm bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg px-3 py-2">
                            <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Iscritti</p>
                              <p className="font-bold text-purple-900">
                                {registrationCount}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Days Until Badge */}
                        {daysUntil !== null && daysUntil >= 0 && status !== 'completed' && (
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                              <Clock className="h-3 w-3" />
                              {daysUntil === 0 ? 'Oggi!' : `Tra ${daysUntil} ${daysUntil === 1 ? 'giorno' : 'giorni'}`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

