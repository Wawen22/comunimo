'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Race } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  FileText,
  Trophy,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock as ClockIcon,
  Flag,
  Download
} from 'lucide-react';
import { 
  getRaceStatus, 
  getStatusColor, 
  getStatusLabel,
  getDaysUntilRace,
  isRacePast 
} from '@/lib/utils/raceUtils';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface RaceTimelineProps {
  races: Race[];
  championshipId: string;
  registrationCounts?: Record<string, number>;
}

/**
 * Modern timeline component for displaying championship races
 * Features:
 * - Visual timeline with connecting lines
 * - Status indicators (completed/current/upcoming)
 * - Smooth animations and hover effects
 * - Responsive design
 * - Quick actions (view poster, results)
 */
export function RaceTimeline({ races, championshipId, registrationCounts = {} }: RaceTimelineProps) {
  const [hoveredRace, setHoveredRace] = useState<string | null>(null);

  // Sort races by event_number or date (REVERSED - latest first)
  const sortedRaces = [...races].sort((a, b) => {
    if (a.event_number && b.event_number) {
      return b.event_number - a.event_number; // Reversed
    }
    return new Date(b.event_date).getTime() - new Date(a.event_date).getTime(); // Reversed
  });

  // Find the next upcoming race (first non-completed race in chronological order)
  const nextRace = [...races]
    .sort((a, b) => {
      if (a.event_number && b.event_number) {
        return a.event_number - b.event_number;
      }
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    })
    .find(race => {
      const status = getRaceStatus(race);
      return status === 'open' || status === 'upcoming' || status === 'closed';
    });

  const getTimelineIcon = (race: Race) => {
    const status = getRaceStatus(race);
    
    if (status === 'completed') {
      return <CheckCircle2 className="h-6 w-6 text-white" />;
    } else if (status === 'open') {
      return <Flag className="h-6 w-6 text-white animate-pulse" />;
    } else {
      return <Circle className="h-6 w-6 text-white" />;
    }
  };

  const getTimelineColor = (race: Race) => {
    const status = getRaceStatus(race);
    
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'open':
        return 'bg-gradient-to-br from-brand-blue to-brand-red';
      case 'closed':
        return 'bg-gradient-to-br from-yellow-500 to-orange-500';
      case 'upcoming':
        return 'bg-gradient-to-br from-gray-400 to-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getCardStyle = (race: Race) => {
    const status = getRaceStatus(race);
    const isHovered = hoveredRace === race.id;
    const isNextRace = nextRace?.id === race.id;

    // Special styling for next race
    if (isNextRace) {
      return cn(
        'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-500 shadow-2xl ring-4 ring-orange-500/30',
        isHovered && 'shadow-3xl scale-[1.03] ring-orange-500/50'
      );
    }

    if (status === 'completed') {
      return cn(
        'bg-gradient-to-br from-green-50 to-white border-green-200',
        isHovered && 'shadow-xl scale-[1.02] border-green-400'
      );
    } else if (status === 'open') {
      return cn(
        'bg-gradient-to-br from-blue-50 via-white to-red-50 border-brand-blue shadow-md ring-2 ring-brand-blue/20',
        isHovered && 'shadow-2xl scale-[1.02] ring-brand-blue/40'
      );
    } else if (status === 'closed') {
      return cn(
        'bg-gradient-to-br from-yellow-50 to-white border-yellow-200',
        isHovered && 'shadow-xl scale-[1.02] border-yellow-400'
      );
    } else {
      return cn(
        'bg-white border-gray-200',
        isHovered && 'shadow-xl scale-[1.02] border-brand-blue/50'
      );
    }
  };

  const getDaysText = (race: Race) => {
    const days = getDaysUntilRace(race);
    
    if (days < 0) {
      return 'Completata';
    } else if (days === 0) {
      return 'Oggi!';
    } else if (days === 1) {
      return 'Domani';
    } else if (days <= 7) {
      return `Tra ${days} giorni`;
    } else if (days <= 30) {
      return `Tra ${Math.ceil(days / 7)} settimane`;
    } else {
      return `Tra ${Math.ceil(days / 30)} mesi`;
    }
  };

  if (sortedRaces.length === 0) {
    return null;
  }

  return (
    <div className="relative space-y-8">
      {sortedRaces.map((race, index) => {
        const status = getRaceStatus(race);
        const isLast = index === sortedRaces.length - 1;
        const registrationCount = registrationCounts[race.id] || 0;
        const daysText = getDaysText(race);

        const isNextRace = nextRace?.id === race.id;

        return (
          <div key={race.id} className="relative">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 -mb-8"
                style={{ height: 'calc(100% + 2rem)' }}
              />
            )}

            {/* Timeline Item */}
            <div className="flex gap-6">
              {/* Timeline Icon */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300',
                    getTimelineColor(race),
                    hoveredRace === race.id && 'scale-110 shadow-xl',
                    isNextRace && 'ring-4 ring-orange-500/50 animate-pulse'
                  )}
                >
                  {getTimelineIcon(race)}
                </div>

                {/* Event Number Badge */}
                {race.event_number && (
                  <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-gray-200 text-xs font-bold text-gray-700 shadow-sm">
                    {race.event_number}
                  </div>
                )}
              </div>

              {/* Race Card */}
              <Link
                href={`/dashboard/races/championships/${championshipId}/races/${race.id}`}
                className="flex-1"
              >
                <div
                  className={cn(
                    'group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer',
                    getCardStyle(race)
                  )}
                  onMouseEnter={() => setHoveredRace(race.id)}
                  onMouseLeave={() => setHoveredRace(null)}
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Header */}
                  <div className="relative flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {isNextRace && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-lg animate-pulse">
                            🔥 PROSSIMA TAPPA
                          </Badge>
                        )}
                        {race.event_number && (
                          <Badge variant="outline" className="font-bold text-sm">
                            Tappa {race.event_number}
                          </Badge>
                        )}
                        <Badge className={getStatusColor(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                        {status === 'open' && !isNextRace && (
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse">
                            🔥 Iscrizioni Aperte
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                        {race.title}
                      </h3>
                    </div>

                    {/* Days Until Race */}
                    <div className="flex-shrink-0 ml-4">
                      <div className={cn(
                        'rounded-lg px-3 py-2 text-sm font-semibold text-center min-w-[100px]',
                        status === 'completed' ? 'bg-green-100 text-green-800' :
                        status === 'open' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {daysText}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {race.description && (
                    <p className="relative text-sm text-gray-600 mb-4 line-clamp-2">
                      {race.description}
                    </p>
                  )}

                  {/* Info Grid */}
                  <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10">
                        <Calendar className="h-4 w-4 text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(race.event_date, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    {race.event_time && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                          <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Orario</p>
                          <p className="font-semibold text-gray-900">{race.event_time}</p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {race.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                          <MapPin className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Luogo</p>
                          <p className="font-semibold text-gray-900 line-clamp-1">{race.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Registrations */}
                    {registrationCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Iscritti</p>
                          <p className="font-semibold text-gray-900">{registrationCount}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="relative flex items-center gap-2 pt-4 border-t border-gray-200">
                    {race.poster_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(race.poster_url!, '_blank');
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Locandina
                      </Button>
                    )}
                    
                    {race.results_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(race.results_url!, '_blank');
                        }}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Risultati
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto group-hover:bg-brand-blue group-hover:text-white transition-colors"
                    >
                      Dettagli
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

