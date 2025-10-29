'use client';

import { useState, useEffect } from 'react';
import { Edit, Hash, MapPin, CheckCircle2, CircleSlash } from 'lucide-react';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/types/database';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { SocietyFormInModal } from './SocietyFormInModal';

interface SocietyEditModalProps {
  societyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SocietyEditModal({ societyId, open, onOpenChange, onSuccess }: SocietyEditModalProps) {
  const { toast } = useToast();
  const [society, setSociety] = useState<Society | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && societyId) {
      fetchSociety();
    }
  }, [open, societyId]);

  const fetchSociety = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('id', societyId)
        .single();

      if (error) throw error;

      setSociety(data);
    } catch (error: any) {
      console.error('Error fetching society:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile caricare la società',
        variant: 'destructive',
      });
      onOpenChange(false);
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

  const getOrganizationBadgeStyles = (org: string) => {
    switch (org) {
      case 'FIDAL':
        return 'bg-orange-100 text-orange-700 ring-1 ring-orange-200';
      case 'UISP':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
      case 'CSI':
        return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200';
      case 'RUNCARD':
        return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 bg-slate-50">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
              <p className="text-sm font-medium text-gray-600">Caricamento...</p>
            </div>
          </div>
        ) : !society ? (
          <div className="flex h-96 items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Società non trovata</p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-200 bg-white px-6 sm:px-8 py-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-green-200 bg-emerald-50 text-emerald-600 shadow-sm">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      Modifica Società
                    </DialogTitle>
                    <p className="mt-1 text-sm text-slate-500">{society.name}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {society.society_code && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
                        >
                          <Hash className="h-3.5 w-3.5" />
                          {society.society_code}
                        </Badge>
                      )}

                      {society.organization && (
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getOrganizationBadgeStyles(
                            society.organization,
                          )}`}
                        >
                          {society.organization}
                        </Badge>
                      )}

                      <Badge
                        variant="secondary"
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          society.is_active
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                        }`}
                      >
                        {society.is_active ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Attiva
                          </>
                        ) : (
                          <>
                            <CircleSlash className="h-3.5 w-3.5" />
                            Inattiva
                          </>
                        )}
                      </Badge>

                      {society.city && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {society.city}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50">
              <SocietyFormInModal society={society} onSuccess={handleSuccess} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
