'use client';

import { useEffect, useState, useTransition } from 'react';
import type { Event } from '@/types/database';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Calendar, MapPin, Clock, FileText, Loader2 } from 'lucide-react';
import { updateCustomEvent } from '@/actions/events';

interface EditCustomEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedEvent: Event) => void;
}

function formatDateForInput(date: string | null): string {
  if (!date) return '';
  try {
    return date.split('T')[0] || date;
  } catch {
    return date;
  }
}

function formatTimeForInput(time: string | null): string {
  if (!time) return '';
  const segments = time.split(':');
  if (segments.length >= 2) {
    return `${segments[0].padStart(2, '0')}:${segments[1].padStart(2, '0')}`;
  }
  return time;
}

export function EditCustomEventDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: EditCustomEventDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_participants: '',
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!event || !open) return;

    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: formatDateForInput(event.event_date ?? ''),
      event_time: formatTimeForInput(event.event_time ?? ''),
      location: event.location || '',
      max_participants: event.max_participants ? String(event.max_participants) : '',
    });
  }, [event, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!formData.title || !formData.event_date) {
      toast({
        title: 'Errore',
        description: 'Titolo e data sono obbligatori',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await updateCustomEvent({
        id: event.id,
        title: formData.title,
        description: formData.description || undefined,
        event_date: formData.event_date,
        event_time: formData.event_time || undefined,
        location: formData.location || undefined,
        max_participants: formData.max_participants ? parseInt(formData.max_participants, 10) : undefined,
      });

      if (!result.success) {
        toast({
          title: 'Errore',
          description: result.error || 'Impossibile aggiornare l\'evento',
          variant: 'destructive',
        });
        return;
      }

      const updatedEvent: Event = {
        ...event,
        title: formData.title,
        description: formData.description ? formData.description : null,
        event_date: formData.event_date,
        event_time: formData.event_time ? formData.event_time : null,
        location: formData.location ? formData.location : null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants, 10) : null,
      };

      toast({
        title: 'Evento aggiornato',
        description: 'Le modifiche sono state salvate con successo.',
        variant: 'success',
      });

      onOpenChange(false);
      onSuccess(updatedEvent);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Modifica Evento</DialogTitle>
          <DialogDescription>
            Aggiorna i dettagli dell&apos;evento personalizzato selezionato.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-semibold text-gray-700">
              Titolo Evento *
            </Label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="es. Riunione Comitato..."
                className="h-11 border-2 pl-10"
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">
              Descrizione
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descrizione dettagliata dell'evento..."
              className="min-h-[100px] border-2"
              rows={4}
              disabled={isPending}
            />
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-event-date" className="text-sm font-semibold text-gray-700">
                Data *
              </Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="edit-event-date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                  className="h-11 border-2 pl-10"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-time" className="text-sm font-semibold text-gray-700">
                Ora
              </Label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="edit-event-time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, event_time: e.target.value }))}
                  className="h-11 border-2 pl-10"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="edit-location" className="text-sm font-semibold text-gray-700">
              Località
            </Label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="es. Sede Comitato, Via Roma 123, Modena"
                className="h-11 border-2 pl-10"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="edit-max-participants" className="text-sm font-semibold text-gray-700">
              Partecipanti massimi
            </Label>
            <Input
              id="edit-max-participants"
              type="number"
              min={0}
              value={formData.max_participants}
              onChange={(e) => setFormData((prev) => ({ ...prev, max_participants: e.target.value }))}
              placeholder="Numero massimo di partecipanti"
              className="h-11 border-2"
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                'Salva Modifiche'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
