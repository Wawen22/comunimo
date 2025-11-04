'use client';

import { useEffect } from 'react';
import { Edit, Trophy, CheckCircle2, AlertTriangle, Flag } from 'lucide-react';
import { Member } from '@/lib/types/database';
import { useToast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MemberFormInModal } from './MemberFormInModal';
import { useMember } from '@/lib/react-query/members';

interface MemberEditModalProps {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MemberEditModal({ memberId, open, onOpenChange, onSuccess }: MemberEditModalProps) {
  const { toast } = useToast();
  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useMember(open ? memberId : null);

  useEffect(() => {
    if (isError && error) {
      console.error('Error fetching member:', error);
      toast({
        title: 'Errore',
        description: "Impossibile caricare i dati dell'atleta",
        variant: 'destructive',
      });
      onOpenChange(false);
    }
  }, [isError, error, toast, onOpenChange]);

  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const membershipStatusStyles: Record<
    NonNullable<Member['membership_status']>,
    { label: string; className: string }
  > = {
    active: {
      label: 'Tesseramento attivo',
      className: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    },
    suspended: {
      label: 'Tesseramento sospeso',
      className: 'bg-amber-100 text-amber-700 ring-amber-200',
    },
    expired: {
      label: 'Tesseramento scaduto',
      className: 'bg-rose-100 text-rose-700 ring-rose-200',
    },
    cancelled: {
      label: 'Tesseramento annullato',
      className: 'bg-slate-200 text-slate-700 ring-slate-300',
    },
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 bg-slate-50">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
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
            <div className="border-b border-slate-200 bg-white px-6 sm:px-8 py-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1 md:pr-4">
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      Modifica atleta
                    </DialogTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {member.first_name} {member.last_name}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {member.category && (
                        <Badge className="flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          <Trophy className="h-3.5 w-3.5" />
                          {member.category}
                        </Badge>
                      )}

                      {member.membership_status && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                            membershipStatusStyles[member.membership_status]?.className,
                          )}
                        >
                          {member.membership_status === 'active' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                          {membershipStatusStyles[member.membership_status]?.label}
                        </Badge>
                      )}

                      {member.organization && (
                        <Badge className="flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-700 ring-1 ring-sky-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          <Flag className="h-3.5 w-3.5" />
                          {member.organization}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50">
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
