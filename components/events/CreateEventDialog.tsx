'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { Calendar, MapPin, Clock, FileText, Loader2, Bell } from 'lucide-react';
import { createCustomEvent } from '@/actions/events';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_participants: '',
  });
  const [sendNotification, setSendNotification] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.event_date) {
      toast({
        title: 'Errore',
        description: 'Titolo e data sono obbligatori',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await createCustomEvent({
        title: formData.title,
        description: formData.description || undefined,
        event_date: formData.event_date,
        event_time: formData.event_time || undefined,
        location: formData.location || undefined,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        sendNotification,
      });

      if (!result.success) {
        toast({
          title: 'Errore',
          description: result.error || 'Impossibile creare l\'evento',
          variant: 'destructive',
        });
        return;
      }

      // Success message with notification info
      let description = 'Evento creato con successo';
      if (sendNotification && result.recipients) {
        description += `\nNotifica inviata a ${result.recipients} utenti.`;
        if (result.emailsSent) {
          description += ` Email inviate: ${result.emailsSent}`;
        }
        if (result.emailsFailed) {
          description += `, errori: ${result.emailsFailed}`;
        }
      }

      toast({
        title: 'Successo',
        description,
        variant: 'success',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        max_participants: '',
      });
      setSendNotification(true);

      onOpenChange(false);
      onSuccess();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Crea Nuovo Evento
          </DialogTitle>
          <DialogDescription>
            Crea un evento personalizzato come riunioni, assemblee o altri eventi del comitato
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Titolo Evento *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="es. Riunione Società, Assemblea Generale..."
                className="pl-10 h-11 border-2"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Descrizione
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrizione dettagliata dell'evento..."
              className="min-h-[100px] border-2"
              rows={4}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date" className="text-sm font-semibold text-gray-700">
                Data *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="pl-10 h-11 border-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_time" className="text-sm font-semibold text-gray-700">
                Ora
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="pl-10 h-11 border-2"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
              Località
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="es. Sede Comitato, Via Roma 123, Modena"
                className="pl-10 h-11 border-2"
              />
            </div>
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="max_participants" className="text-sm font-semibold text-gray-700">
              Numero Massimo Partecipanti
            </Label>
            <Input
              id="max_participants"
              type="number"
              min="1"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              placeholder="Lascia vuoto per nessun limite"
              className="h-11 border-2"
            />
          </div>

          {/* Send Notification */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <Checkbox
                id="send_notification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="send_notification"
                  className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center gap-2"
                >
                  <Bell className="h-4 w-4 text-purple-600" />
                  Invia notifica a tutti gli utenti
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Tutti gli utenti attivi riceveranno una notifica in-app e via email con i dettagli dell'evento
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 border-2"
              disabled={isPending}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creazione...
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 mr-2" />
                  Crea Evento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

