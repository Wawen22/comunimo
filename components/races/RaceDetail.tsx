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
  registrationsCount?: number;
}

export function RaceDetail({ race, championship, registrationsCount = 0 }: RaceDetailProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const status = getRaceStatus(race);
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  const handleDeleteSuccess = () => {
    router.push(`/dashboard/races/championships/${race.championship_id}/registrations`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/races/championships/${race.championship_id}/registrations`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle Iscrizioni
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
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-sm font-semibold">
                  Tappa {race.event_number}
                </Badge>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{race.title}</h1>
              {championship && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">{championship.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <CardContent className="space-y-6 pt-6">
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
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Data Gara</h3>
              </div>
              <p className="text-base font-medium text-orange-800 dark:text-orange-200">
                {formatRaceDate(race)}
              </p>
              {race.event_time && (
                <div className="flex items-center gap-2 mt-2 text-sm text-orange-700 dark:text-orange-300">
                  <Clock className="h-4 w-4" />
                  <span>{race.event_time}</span>
                </div>
              )}
            </div>

            {race.location && (
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-100">Luogo</h3>
                </div>
                <p className="text-base font-medium text-teal-800 dark:text-teal-200">{race.location}</p>
              </div>
            )}
          </div>

          {/* Championship Info with Registrations */}
          {championship && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Informazioni Campionato
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Campionato</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{championship.name}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Iscrizioni Totali</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{registrationsCount}</p>
                </div>

                {race.max_participants && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Posti Disponibili</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {Math.max(0, race.max_participants - registrationsCount)} / {race.max_participants}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration Info */}
          {(race.registration_start_date || race.registration_end_date) && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Periodo Iscrizioni
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
              </div>
            </div>
          )}

          {/* Media Links */}
          {(race.poster_url || race.results_url) && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Media e Risultati
              </h3>
              <div className="flex flex-wrap gap-3">
                {race.poster_url && (
                  <a
                    href={race.poster_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="default" className="shadow-sm hover:shadow-md transition-all">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Visualizza Locandina
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
                    <Button variant="outline" size="default" className="shadow-sm hover:shadow-md transition-all">
                      <Trophy className="h-4 w-4 mr-2" />
                      Visualizza Classifiche
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

      {/* Registrations Section - Modern CTA */}
      {championship ? (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Gestisci Iscrizioni</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Questa gara fa parte del campionato <strong>{championship.name}</strong>.
                  Gestisci tutte le iscrizioni degli atleti al campionato.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                <Link href={`/dashboard/races/championships/${championship.id}/registrations`}>
                  <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
                    <Users className="h-5 w-5 mr-2" />
                    Vai alle Iscrizioni del Campionato
                  </Button>
                </Link>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{registrationsCount}</div>
                  <div className="text-xs text-muted-foreground">Iscritti Totali</div>
                </div>
                {race.max_participants && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.max(0, race.max_participants - registrationsCount)}
                      </div>
                      <div className="text-xs text-muted-foreground">Posti Disponibili</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {race.max_participants > 0
                          ? Math.round((registrationsCount / race.max_participants) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Riempimento</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Gestisci Iscrizioni</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Gestisci le iscrizioni degli atleti a questa gara singola.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                <Link href={`/dashboard/races/events/${race.id}/registrations`}>
                  <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
                    <Users className="h-5 w-5 mr-2" />
                    Gestisci Iscrizioni
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

