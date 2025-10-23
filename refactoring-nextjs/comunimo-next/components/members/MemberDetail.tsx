'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/api/supabase';
import { Member } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { MemberCard } from './MemberCard';
import { DeleteMemberDialog } from './DeleteMemberDialog';
import { PhotoUpload } from './PhotoUpload';

interface MemberWithRelations extends Member {
  society?: {
    id: string;
    name: string;
    society_code: string | null;
  } | null;
}

interface MemberDetailProps {
  memberId: string;
}

type TabType = 'personal' | 'membership' | 'athletic' | 'documents';

export function MemberDetail({ memberId }: MemberDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  
  const [member, setMember] = useState<MemberWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
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

  const handlePhotoChange = (photoUrl: string | null) => {
    // Update local state
    if (member) {
      setMember({ ...member, photo_url: photoUrl });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Atleta non trovato</p>
          <Link href="/dashboard/members">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'personal', label: 'Dati Personali' },
    { id: 'membership', label: 'Tesseramento' },
    { id: 'athletic', label: 'Dati Atletici' },
    { id: 'documents', label: 'Documenti' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/members">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla lista
          </Button>
        </Link>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/dashboard/members/${memberId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Modifica
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </Button>
          </div>
        )}
      </div>

      {/* Member Card */}
      <MemberCard member={member} />

      {/* Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="mt-1 text-sm text-gray-900">{member.first_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cognome</p>
                <p className="mt-1 text-sm text-gray-900">{member.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Codice Fiscale</p>
                <p className="mt-1 text-sm text-gray-900">{member.fiscal_code || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data di Nascita</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(member.birth_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Luogo di Nascita</p>
                <p className="mt-1 text-sm text-gray-900">{member.birth_place || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Sesso</p>
                <p className="mt-1 text-sm text-gray-900">{formatGender(member.gender)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{member.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Telefono</p>
                <p className="mt-1 text-sm text-gray-900">{member.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cellulare</p>
                <p className="mt-1 text-sm text-gray-900">{member.mobile || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Indirizzo</p>
                <p className="mt-1 text-sm text-gray-900">
                  {member.address || '-'}
                  {member.city && `, ${member.city}`}
                  {member.province && ` (${member.province})`}
                  {member.postal_code && ` - ${member.postal_code}`}
                </p>
              </div>
            </div>
          )}

          {/* Membership Tab */}
          {activeTab === 'membership' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Numero Tessera</p>
                <p className="mt-1 text-sm text-gray-900">{member.membership_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data Tesseramento</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(member.membership_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo Tesseramento</p>
                <p className="mt-1 text-sm text-gray-900">{member.membership_type || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stato</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{member.membership_status}</p>
              </div>
            </div>
          )}

          {/* Athletic Info Tab */}
          {activeTab === 'athletic' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Ente</p>
                <p className="mt-1 text-sm text-gray-900">{member.organization || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Anno</p>
                <p className="mt-1 text-sm text-gray-900">{member.year || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Codice Regionale</p>
                <p className="mt-1 text-sm text-gray-900">{member.regional_code || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Categoria</p>
                <p className="mt-1 text-sm text-gray-900">{member.category || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Codice Società</p>
                <p className="mt-1 text-sm text-gray-900">{member.society_code || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Atleta Straniero</p>
                <p className="mt-1 text-sm text-gray-900">{member.is_foreign ? 'Sì' : 'No'}</p>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Data Certificato Medico</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(member.medical_certificate_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data Scadenza Certificato</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(member.medical_certificate_expiry)}</p>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Foto Atleta</h3>
                <PhotoUpload
                  currentPhotoUrl={member.photo_url}
                  memberId={member.id}
                  societyCode={member.society_code || undefined}
                  onPhotoChange={handlePhotoChange}
                  disabled={!isAdmin}
                />
              </div>

              {member.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Note</p>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{member.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <DeleteMemberDialog
          member={member}
          onClose={() => setShowDeleteDialog(false)}
          onDeleted={() => router.push('/dashboard/members')}
        />
      )}
    </div>
  );
}

