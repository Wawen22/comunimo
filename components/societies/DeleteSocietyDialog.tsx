'use client';

import { AlertTriangle } from 'lucide-react';
import { Society } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteSocietyDialogProps {
  open: boolean;
  society: Society | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteSocietyDialog({
  open,
  society,
  onOpenChange,
  onConfirm,
}: DeleteSocietyDialogProps) {
  if (!society) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Elimina Società</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            Sei sicuro di voler eliminare la società <strong>{society.name}</strong>?
            <br />
            <br />
            Questa azione disattiverà la società ma non eliminerà i dati associati.
            Potrai riattivarla in seguito se necessario.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

