'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  User,
  Edit,
  X,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/types/database';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/components/auth/RequireRole';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { SocietyEditModal } from './SocietyEditModal';

interface SocietyDetailModalProps {
  societyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocietyDetailModal({ societyId, open, onOpenChange }: SocietyDetailModalProps) {
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [society, setSociety] = useState<Society | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (open && societyId) {
      fetchSociety();
    }
  }, [open, societyId]);

  const fetchSociety = async () => {
    if (!societyId) return;

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchSociety(); // Refresh data
  };

  const getOrganizationColor = (org: string) => {
    switch (org) {
      case 'FIDAL':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'UISP':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CSI':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RUNCARD':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        {loading ? (
          <div className="flex h-96 items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
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
            {/* Header with soft gradient */}
            <div className="relative bg-gradient-to-br from-blue-500/90 via-indigo-500/90 to-purple-500/90 px-6 sm:px-8 py-6 sm:py-8">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Logo/Icon */}
                <div className="flex-shrink-0">
                  {society.logo_url ? (
                    <img
                      src={society.logo_url}
                      alt={society.name}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-white/40 shadow-xl"
                    />
                  ) : (
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg">
                      <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-sm" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm mb-2 truncate">
                    {society.name}
                  </DialogTitle>
                  
                  {/* Quick Info */}
                  <div className="flex flex-wrap items-center gap-2">
                    {society.society_code && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm font-medium">{society.society_code}</span>
                      </div>
                    )}
                    {society.organization && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <span className="text-xs sm:text-sm font-medium">{society.organization}</span>
                      </div>
                    )}
                    {society.is_active && (
                      <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-300/40 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm font-medium">Attiva</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isAdmin && (
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="sm"
                      className="bg-white/15 backdrop-blur-md border-white/40 text-white hover:bg-white/25 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Modifica</span>
                      <span className="sm:hidden">Modifica</span>
                    </Button>
                  )}
                  
                  <button
                    onClick={() => onOpenChange(false)}
                    className="rounded-full p-2 bg-white/15 backdrop-blur-md border border-white/40 text-white hover:bg-white/25 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    aria-label="Chiudi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white/50 p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                
                {/* Description */}
                {society.description && (
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-4 sm:p-6 border border-blue-100/60">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{society.description}</p>
                  </div>
                )}

                {/* Contact Info Section */}
                <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-2xl p-4 sm:p-6 border border-green-100/60">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Informazioni di Contatto</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <InfoField icon={MapPin} label="Indirizzo" value={society.address ? `${society.address}${society.city ? `, ${society.postal_code || ''} ${society.city}` : ''}${society.province ? ` (${society.province})` : ''}` : null} />
                    <InfoField icon={Phone} label="Telefono" value={society.phone} />
                    <InfoField icon={Mail} label="Email" value={society.email} />
                    <InfoField icon={Globe} label="Sito Web" value={society.website} />
                  </div>
                </div>

                {/* Legal Info Section */}
                <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-2xl p-4 sm:p-6 border border-purple-100/60">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Informazioni Legali</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <InfoField icon={Hash} label="Partita IVA" value={society.vat_number} />
                    <InfoField icon={Hash} label="Codice Fiscale" value={society.fiscal_code} />
                    <div className="md:col-span-2">
                      <InfoField icon={User} label="Rappresentante Legale" value={society.legal_representative} />
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">Creata il:</span>
                      <span>{formatDate(society.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">Ultima modifica:</span>
                      <span>{formatDate(society.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>

      {/* Edit Modal */}
      {societyId && (
        <SocietyEditModal
          societyId={societyId}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </Dialog>
  );
}

// Helper component for info fields
function InfoField({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 hover:border-blue-300/60 hover:shadow-md transition-all duration-200">
      <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </p>
      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{value || '-'}</p>
    </div>
  );
}

