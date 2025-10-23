'use client';

import { useState } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Member } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { AlertTriangle } from 'lucide-react';

interface DeleteMemberDialogProps {
  member: Member;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteMemberDialog({ member, onClose, onDeleted }: DeleteMemberDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Soft delete: set is_active to false
      const { error } = await supabase
        .from('members')
        // @ts-expect-error - Supabase type inference issue
        .update({ is_active: false })
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Atleta eliminato con successo',
        variant: 'default',
      });

      onDeleted();
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'atleta',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">
            Elimina Atleta
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Sei sicuro di voler eliminare l'atleta{' '}
              <span className="font-medium text-gray-900">
                {member.first_name} {member.last_name}
              </span>
              ? Questa azione può essere annullata ripristinando l'atleta.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Eliminazione...' : 'Elimina'}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isDeleting}
        >
          Annulla
        </Button>
      </div>
    </Dialog>
  );
}

