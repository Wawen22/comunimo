'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Member } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  User, 
  Calendar, 
  Building2, 
  CreditCard, 
  Trophy,
  FileText,
  Mail,
  Phone,
  MapPin,
  Edit,
  X,
  Cake,
  Flag,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { MemberEditModal } from './MemberEditModal';

interface MemberWithRelations extends Member {
  society?: {
    id: string;
    name: string;
    society_code: string | null;
  } | null;
}

interface MemberDetailModalProps {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = 'personal' | 'athletic' | 'documents';

export function MemberDetailModal({ memberId, open, onOpenChange }: MemberDetailModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [member, setMember] = useState<MemberWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [showEditModal, setShowEditModal] = useState(false);

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
        .select(`
          *,
          society:societies(id, name, society_code)
        `)
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

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const formatGender = (gender: string | null) => {
    if (!gender) return '-';
    switch (gender) {
      case 'M': return 'Maschio';
      case 'F': return 'Femmina';
      default: return gender;
    }
  };

  const getOrganizationColor = (org: string) => {
    switch (org) {
      case 'FIDAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'UISP': return 'bg-green-100 text-green-700 border-green-200';
      case 'CSI': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'LIBERTAS': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Refresh member data after successful edit
    fetchMember();
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'personal', label: 'Dati Personali', icon: User },
    { id: 'athletic', label: 'Dati Atletici & Tesseramento', icon: Trophy },
    { id: 'documents', label: 'Documenti', icon: FileText },
  ];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
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
            <div className="relative bg-gradient-to-br from-blue-500/90 via-indigo-500/90 to-purple-500/90 px-6 sm:px-8 py-6 sm:py-8">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg">
                      <User className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-xl sm:text-2xl font-bold text-white mb-1.5 drop-shadow-sm truncate">
                        {member.first_name} {member.last_name}
                      </DialogTitle>
                      {member.organization && (
                        <Badge className={cn('text-xs font-semibold border shadow-sm', getOrganizationColor(member.organization))}>
                          <Flag className="h-3 w-3 mr-1" />
                          {member.organization}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="mt-4 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                    {member.category && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-medium">{member.category}</span>
                      </div>
                    )}
                    {member.birth_date && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <Cake className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-medium">{formatDate(member.birth_date)}</span>
                      </div>
                    )}
                    {member.society && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-medium truncate max-w-[150px]">{member.society.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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

            {/* Tabs */}
            <div className="border-b border-gray-200/60 bg-gradient-to-r from-white via-blue-50/30 to-white px-4 sm:px-6">
              <nav className="flex -mb-px gap-3 sm:gap-6 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-2 sm:px-3 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap',
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/50'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 bg-white/50">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 animate-in fade-in duration-300">
                  <InfoField icon={User} label="Nome" value={member.first_name} />
                  <InfoField icon={User} label="Cognome" value={member.last_name} />
                  <InfoField icon={CreditCard} label="Codice Fiscale" value={member.fiscal_code} />
                  <InfoField icon={Cake} label="Data di Nascita" value={formatDate(member.birth_date)} />
                  <InfoField icon={MapPin} label="Luogo di Nascita" value={member.birth_place} />
                  <InfoField icon={Users} label="Sesso" value={formatGender(member.gender)} />
                  <InfoField icon={Mail} label="Email" value={member.email} />
                  <InfoField icon={Phone} label="Telefono" value={member.phone} />
                  <InfoField icon={Phone} label="Cellulare" value={member.mobile} />
                  <div className="md:col-span-2">
                    <InfoField
                      icon={MapPin}
                      label="Indirizzo"
                      value={`${member.address || '-'}${member.city ? `, ${member.city}` : ''}${member.province ? ` (${member.province})` : ''}${member.postal_code ? ` - ${member.postal_code}` : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Athletic & Membership Tab (UNIFIED) */}
              {activeTab === 'athletic' && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                  {/* Dati Atletici Section */}
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-4 sm:p-6 border border-blue-100/60">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Trophy className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Dati Atletici</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                      <InfoField icon={Flag} label="Ente" value={member.organization} />
                      <InfoField
                        icon={Calendar}
                        label="Anno"
                        value={member.year !== null && member.year !== undefined ? String(member.year) : null}
                      />
                      <InfoField icon={CreditCard} label="Codice Regionale" value={member.regional_code} />
                      <InfoField icon={Trophy} label="Categoria" value={member.category} />
                      <InfoField icon={Building2} label="Codice Società" value={member.society_code} />
                      <InfoField
                        icon={Flag}
                        label="Atleta Straniero"
                        value={member.is_foreign ? 'Sì' : 'No'}
                      />
                    </div>
                  </div>

                  {/* Tesseramento Section */}
                  <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-2xl p-4 sm:p-6 border border-green-100/60">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <span>Tesseramento</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                      <InfoField icon={CreditCard} label="Numero Tessera" value={member.membership_number} />
                      <InfoField icon={Calendar} label="Data Tesseramento" value={formatDate(member.membership_date)} />
                      <InfoField icon={FileText} label="Tipo Tesseramento" value={member.membership_type} />
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60">
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          <span>Stato</span>
                        </p>
                        <Badge className={cn(
                          'text-sm font-semibold px-3 py-1',
                          member.membership_status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        )}>
                          {member.membership_status === 'active' ? 'Attivo' : member.membership_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <InfoField
                      icon={Calendar}
                      label="Data Certificato Medico"
                      value={formatDate(member.medical_certificate_date)}
                    />
                    <InfoField
                      icon={AlertCircle}
                      label="Data Scadenza Certificato"
                      value={formatDate(member.medical_certificate_expiry)}
                    />
                  </div>

                  {member.notes && (
                    <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl p-4 sm:p-6 border border-amber-100/60">
                      <p className="text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <span>Note</span>
                      </p>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{member.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>

      {/* Edit Modal */}
      {memberId && (
        <MemberEditModal
          memberId={memberId}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </Dialog>
  );
}

// Helper component for info fields
function InfoField({ icon: Icon, label, value }: { icon: any; label: string; value?: ReactNode }) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    (!(typeof value === 'string') || value.trim() !== '');
  const displayValue = hasValue ? value : '-';

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 hover:border-blue-300/60 hover:shadow-md transition-all duration-200">
      <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </p>
      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{displayValue}</p>
    </div>
  );
}
