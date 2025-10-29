'use client';

import { useState } from 'react';
import { supabase } from '@/lib/api/supabase';
import { useUser } from '@/lib/hooks/useUser';
import { Event, Championship } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Calendar, MapPin, Clock, Users, Trophy, Edit, Trash2, ExternalLink, Loader2, FileText, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EventWithChampionship extends Event {
  championship?: Championship | null;
}

interface EventDetailDialogProps {
  event: EventWithChampionship;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onEdit?: (event: EventWithChampionship) => void;
}

export function EventDetailDialog({ event, open, onOpenChange, onUpdate, onEdit }: EventDetailDialogProps) {
  const { profile } = useUser();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = profile?.role === 'super_admin' || profile?.role === 'admin';
  const isCustomEvent = !event.championship_id;
  const eventDate = parseISO(event.event_date);
  const isPastEvent = eventDate < new Date();

  const handleDelete = async () => {
    if (!isCustomEvent) {
      toast({
        title: 'Errore',
        description: 'Non puoi eliminare gare o tappe di campionati',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDeleting(true);

      const { error } = await (supabase
        .from('events') as any)
        .update({ is_active: false })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Evento eliminato con successo',
      });

      setShowDeleteDialog(false);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'evento',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => onOpenChange(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" hideClose>
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={cn(
                    "font-semibold text-sm",
                    event.championship_id 
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  )}>
                    {event.championship_id ? (
                      <>
                        <Trophy className="h-4 w-4 mr-1" />
                        Gara/Tappa
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-1" />
                        Evento Personalizzato
                      </>
                    )}
                  </Badge>
                  {isPastEvent && (
                    <Badge variant="outline" className="text-gray-600">
                      Concluso
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-3xl font-bold text-gray-900">
                  {event.title}
                </DialogTitle>
              </div>

              <div className="flex gap-2">
                {canEdit && isCustomEvent && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 border-2"
                      onClick={() => {
                        handleClose();
                        onEdit?.(event);
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                      className="h-10 w-10 border-2 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClose}
                  className="h-10 w-10 border-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Championship Info */}
            {event.championship && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2">
                    <Trophy className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-800">Campionato</p>
                    <p className="text-lg font-bold text-orange-900">{event.championship.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
                <div className="rounded-full bg-purple-100 p-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">Data</p>
                  <p className="text-lg font-bold text-purple-900">
                    {format(eventDate, 'dd MMMM yyyy', { locale: it })}
                  </p>
                </div>
              </div>

              {/* Time */}
              {event.event_time && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Orario</p>
                    <p className="text-lg font-bold text-blue-900">{event.event_time}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border-2 border-green-200">
                  <div className="rounded-full bg-green-100 p-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Località</p>
                    <p className="text-lg font-bold text-green-900">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Max Participants */}
              {event.max_participants && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-pink-50 border-2 border-pink-200">
                  <div className="rounded-full bg-pink-100 p-2">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pink-800">Partecipanti Max</p>
                    <p className="text-lg font-bold text-pink-900">{event.max_participants}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="p-4 rounded-lg bg-gray-50 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Descrizione</h3>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Additional Info for Championship Events */}
            {event.championship_id && (
              <div className="space-y-3">
                {event.poster_url && (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-2 hover:border-orange-400 hover:bg-orange-50"
                    onClick={() => window.open(event.poster_url!, '_blank')}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Visualizza Locandina
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {event.results_url && (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-2 hover:border-green-400 hover:bg-green-50"
                    onClick={() => window.open(event.results_url!, '_blank')}
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Visualizza Classifiche
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {/* Registration Info */}
            {event.registration_start_date && event.registration_end_date && (
              <div className="p-4 rounded-lg bg-indigo-50 border-2 border-indigo-200">
                <h3 className="font-semibold text-indigo-900 mb-2">Periodo Iscrizioni</h3>
                <p className="text-sm text-indigo-700">
                  Dal {format(parseISO(event.registration_start_date), 'dd/MM/yyyy', { locale: it })} al{' '}
                  {format(parseISO(event.registration_end_date), 'dd/MM/yyyy', { locale: it })}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare l'evento "{event.title}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                'Elimina'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
