'use client';

import { useState } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Race } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { AlertTriangle } from 'lucide-react';

interface DeleteRaceDialogProps {
  race: Race;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteRaceDialog({
  race,
  open,
  onOpenChange,
  onSuccess,
}: DeleteRaceDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Soft delete: set is_active to false
      const { error } = await supabase
        .from('events')
        // @ts-expect-error - Supabase type inference issue
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', race.id);

      if (error) throw error;

      toast({
        title: 'Gara eliminata',
        description: 'La gara è stata eliminata con successo.',
      });

      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deleting race:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la gara. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Elimina Gara
          </DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare questa gara?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-medium">{race.title}</p>
            <p className="text-sm text-muted-foreground">
              Tappa {race.event_number} - {new Date(race.event_date).toLocaleDateString('it-IT')}
            </p>
          </div>

          <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive font-medium mb-2">
              ⚠️ Attenzione
            </p>
            <p className="text-sm text-muted-foreground">
              Questa azione eliminerà la gara. Le iscrizioni associate (se presenti) 
              non verranno eliminate ma non saranno più visibili.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Annulla
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminazione...' : 'Elimina Gara'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

