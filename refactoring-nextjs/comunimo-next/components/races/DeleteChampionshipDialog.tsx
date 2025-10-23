'use client';

import { useState } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Championship } from '@/types/database';
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

interface DeleteChampionshipDialogProps {
  championship: Championship & { race_count?: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteChampionshipDialog({
  championship,
  open,
  onOpenChange,
  onSuccess,
}: DeleteChampionshipDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Soft delete: set is_active to false
      const { error } = await supabase
        .from('championships')
        // @ts-expect-error - Supabase type inference issue
        .update({ is_active: false })
        .eq('id', championship.id);

      if (error) throw error;

      toast({
        title: 'Campionato eliminato',
        description: 'Il campionato è stato eliminato con successo',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting championship:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile eliminare il campionato',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasRaces = championship.race_count && championship.race_count > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Elimina Campionato
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Sei sicuro di voler eliminare il campionato{' '}
              <span className="font-semibold">{championship.name}</span>?
            </p>

            {hasRaces && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  <strong>Attenzione:</strong> Questo campionato contiene{' '}
                  {championship.race_count} {championship.race_count === 1 ? 'gara' : 'gare'}.
                  Le gare non verranno eliminate, ma non saranno più associate a questo campionato.
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-3">
              Questa azione può essere annullata riattivando il campionato dal database.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annulla
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminazione...' : 'Elimina'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

