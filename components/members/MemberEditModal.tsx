'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Member } from '@/lib/types/database';
import { useToast } from '@/components/ui/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Edit, X } from 'lucide-react';
import { MemberFormInModal } from './MemberFormInModal';

interface MemberEditModalProps {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MemberEditModal({ memberId, open, onOpenChange, onSuccess }: MemberEditModalProps) {
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (memberId && open) {
      fetchMember();
    }
  }, [memberId, open]);

  const fetchMember = async () => {
    if (!memberId) return;
    
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setMember(data);
    } catch (error: any) {
      console.error('Error fetching member:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dati dell\'atleta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
              <p className="text-sm font-medium text-gray-600">Caricamento...</p>
            </div>
          </div>
        ) : !member ? (
          <div className="flex h-96 items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Atleta non trovato</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header with soft gradient */}
            <div className="relative bg-gradient-to-br from-green-500/90 via-emerald-500/90 to-teal-500/90 px-6 sm:px-8 py-5 sm:py-6">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg">
                    <Edit className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">
                      Modifica Atleta
                    </DialogTitle>
                    <p className="text-xs sm:text-sm text-white/90 mt-0.5 font-medium truncate">
                      {member.first_name} {member.last_name}
                    </p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-2 bg-white/15 backdrop-blur-md border border-white/40 text-white hover:bg-white/25 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  aria-label="Chiudi"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white/50">
              <MemberFormInModal 
                member={member} 
                mode="edit" 
                onSuccess={handleSuccess}
                onCancel={() => onOpenChange(false)}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

