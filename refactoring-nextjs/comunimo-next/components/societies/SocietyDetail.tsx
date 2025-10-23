'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  User,
  Hash,
} from 'lucide-react';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/components/auth/RequireRole';
import { DeleteSocietyDialog } from './DeleteSocietyDialog';
import { formatDate } from '@/lib/utils';

interface SocietyDetailProps {
  societyId: string;
}

export function SocietyDetail({ societyId }: SocietyDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [society, setSociety] = useState<Society | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchSociety();
  }, [societyId]);

  const fetchSociety = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('id', societyId)
        .single();

      if (error) throw error;

      setSociety(data);
    } catch (error) {
      console.error('Error fetching society:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare la società',
        variant: 'destructive',
      });
      router.push('/dashboard/societies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!society) return;

    try {
      const { error } = await supabase
        .from('societies')
        // @ts-expect-error - Supabase type inference issue
        .update({ is_active: false })
        .eq('id', society.id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Società eliminata con successo',
        variant: 'success',
      });

      router.push('/dashboard/societies');
    } catch (error) {
      console.error('Error deleting society:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la società',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!society) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/societies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla lista
            </Button>
          </Link>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/societies/${society.id}/edit`}>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Modifica
              </Button>
            </Link>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </Button>
          </div>
        )}
      </div>

      {/* Society Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{society.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              {society.society_code && (
                <Badge variant="outline" className="text-base">
                  {society.society_code}
                </Badge>
              )}
              {society.organization && (
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
                  society.organization === 'FIDAL' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                  society.organization === 'UISP' ? 'bg-green-100 text-green-800 border-green-200' :
                  society.organization === 'CSI' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  society.organization === 'RUNCARD' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {society.organization}
                </span>
              )}
            </div>
            {society.description && (
              <p className="mt-2 text-gray-600">{society.description}</p>
            )}
          </div>
          <Badge variant={society.is_active ? 'success' : 'secondary'}>
            {society.is_active ? 'Attiva' : 'Inattiva'}
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Society Code */}
          {society.society_code && (
            <div className="flex gap-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Codice Società</p>
                <p className="mt-1 text-sm text-gray-600 font-mono">{society.society_code}</p>
              </div>
            </div>
          )}

          {/* Address */}
          {(society.address || society.city) && (
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Indirizzo</p>
                <p className="mt-1 text-sm text-gray-600">
                  {society.address && <>{society.address}<br /></>}
                  {society.city && (
                    <>
                      {society.postal_code && `${society.postal_code} `}
                      {society.city}
                      {society.province && ` (${society.province})`}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {society.phone && (
            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Telefono</p>
                <p className="mt-1 text-sm text-gray-600">{society.phone}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {society.email && (
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <a
                  href={`mailto:${society.email}`}
                  className="mt-1 text-sm text-blue-600 hover:underline"
                >
                  {society.email}
                </a>
              </div>
            </div>
          )}

          {/* Website */}
          {society.website && (
            <div className="flex gap-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Sito Web</p>
                <a
                  href={society.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-blue-600 hover:underline"
                >
                  {society.website}
                </a>
              </div>
            </div>
          )}

          {/* VAT Number */}
          {society.vat_number && (
            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Partita IVA</p>
                <p className="mt-1 text-sm text-gray-600">{society.vat_number}</p>
              </div>
            </div>
          )}

          {/* Fiscal Code */}
          {society.fiscal_code && (
            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Codice Fiscale</p>
                <p className="mt-1 text-sm text-gray-600">{society.fiscal_code}</p>
              </div>
            </div>
          )}

          {/* Legal Representative */}
          {society.legal_representative && (
            <div className="flex gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Rappresentante Legale</p>
                <p className="mt-1 text-sm text-gray-600">{society.legal_representative}</p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-6 border-t pt-6">
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 md:grid-cols-2">
            <div>
              <span className="font-medium">Creata il:</span>{' '}
              {formatDate(society.created_at)}
            </div>
            <div>
              <span className="font-medium">Ultima modifica:</span>{' '}
              {formatDate(society.updated_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteSocietyDialog
        open={deleteDialogOpen}
        society={society}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}

