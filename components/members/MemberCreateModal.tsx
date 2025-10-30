'use client';

import { UserPlus, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { MemberFormInModal } from './MemberFormInModal';

interface MemberCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MemberCreateModal({ open, onOpenChange, onSuccess }: MemberCreateModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-6 sm:px-8 py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 md:pr-4">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Nuovo atleta
                </DialogTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Compila il form multi-step per registrare un nuovo atleta nel sistema.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Gestione atleti
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <MemberFormInModal
            mode="create"
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
