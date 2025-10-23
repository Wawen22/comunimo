'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Race, Championship } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  ArrowLeft,
  FileText,
  Trophy,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { getRaceStatus, getStatusColor, getStatusLabel, formatRaceDate } from '@/lib/utils/raceUtils';
import { DeleteRaceDialog } from './DeleteRaceDialog';

interface RaceDetailProps {
  race: Race;
  championship?: Championship;
}

export function RaceDetail({ race, championship }: RaceDetailProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const status = getRaceStatus(race);
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  const handleDeleteSuccess = () => {
    router.push(`/dashboard/races/championships/${race.championship_id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/races/championships/${race.championship_id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al Campionato
            </Button>
          </Link>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/races/championships/${race.championship_id}/races/${race.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina
            </Button>
          </div>
        )}
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Tappa {race.event_number}</Badge>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
              <CardTitle className="text-2xl">{race.title}</CardTitle>
              {championship && (
                <CardDescription className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  {championship.name}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {race.description && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descrizione
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {race.description}
              </p>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Gara
              </h3>
              <p className="text-sm">
                {formatRaceDate(race)}
                {race.event_time && ` alle ${race.event_time}`}
              </p>
            </div>

            {race.location && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Luogo
                </h3>
                <p className="text-sm">{race.location}</p>
              </div>
            )}
          </div>

          {/* Registration Info */}
          {(race.registration_start_date || race.registration_end_date || race.max_participants) && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Iscrizioni
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {race.registration_start_date && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Inizio:</span>{' '}
                    {new Date(race.registration_start_date).toLocaleDateString('it-IT')}
                  </div>
                )}
                {race.registration_end_date && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Fine:</span>{' '}
                    {new Date(race.registration_end_date).toLocaleDateString('it-IT')}
                  </div>
                )}
                {race.max_participants && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Max Partecipanti:</span>{' '}
                    {race.max_participants}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Links */}
          {(race.poster_url || race.results_url) && (
            <div>
              <h3 className="text-sm font-medium mb-3">Media e Risultati</h3>
              <div className="flex flex-wrap gap-2">
                {race.poster_url && (
                  <a 
                    href={race.poster_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Locandina
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </a>
                )}
                {race.results_url && (
                  <a 
                    href={race.results_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      Classifiche
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="pt-4 border-t">
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Visibilità:</span>
                <Badge variant={race.is_public ? 'default' : 'secondary'}>
                  {race.is_public ? 'Pubblica' : 'Privata'}
                </Badge>
              </div>
              {race.has_specialties && (
                <div className="flex items-center justify-between">
                  <span>Specialità Multiple:</span>
                  <Badge variant="outline">Sì</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Creata il:</span>
                <span>{new Date(race.created_at).toLocaleDateString('it-IT')}</span>
              </div>
              {race.updated_at !== race.created_at && (
                <div className="flex items-center justify-between">
                  <span>Ultima modifica:</span>
                  <span>{new Date(race.updated_at).toLocaleDateString('it-IT')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Iscrizioni
              </CardTitle>
              <CardDescription>
                {championship
                  ? 'Le iscrizioni a questa gara sono gestite tramite il campionato'
                  : 'Gestisci le iscrizioni degli atleti a questa gara'}
              </CardDescription>
            </div>
            {!championship && (
              <Link href={`/dashboard/races/events/${race.id}/registrations`}>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Gestisci Iscrizioni
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {championship ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                Questa gara fa parte del campionato <strong>{championship.name}</strong>
              </p>
              <Link href={`/dashboard/races/championships/${championship.id}/registrations`}>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Vai alle Iscrizioni del Campionato
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                Clicca sul pulsante sopra per gestire le iscrizioni a questa gara
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <DeleteRaceDialog
          race={race}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

