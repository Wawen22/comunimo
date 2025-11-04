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
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const getOrganizationColor = (org: string) => {
    switch (org) {
      case 'FIDAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'UISP':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CSI':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RUNCARD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/dashboard/societies">
          <Button variant="ghost" size="sm" className="hover:bg-brand-blue/10 hover:text-brand-blue">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla lista
          </Button>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/societies/${society.id}/edit`}>
              <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
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

      {/* Hero Card with Society Info */}
      <Card className="border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-transparent" />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {society.logo_url ? (
                <img
                  src={society.logo_url}
                  alt={society.name}
                  className="h-24 w-24 rounded-xl object-cover ring-4 ring-brand-blue/20 shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white ring-4 ring-brand-blue/20 shadow-lg">
                  <Building2 className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
                    {society.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {society.society_code && (
                      <Badge variant="outline" className="text-sm font-mono border-brand-blue/30 text-brand-blue">
                        <Hash className="mr-1 h-3 w-3" />
                        {society.society_code}
                      </Badge>
                    )}
                    {society.organization && (
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${getOrganizationColor(society.organization)}`}>
                        {society.organization}
                      </span>
                    )}
                    <StatusBadge
                      variant={society.is_active ? 'success' : 'inactive'}
                      label={society.is_active ? 'Attiva' : 'Inattiva'}
                      size="md"
                      showIcon={false}
                    />
                  </div>
                  {society.description && (
                    <p className="mt-4 text-gray-600 leading-relaxed">{society.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">{/* Contact Info Card */}
        <Card className="border-2 border-gray-200 hover:border-brand-blue/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-brand-blue/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-brand-blue">
              <Mail className="h-5 w-5" />
              Informazioni di Contatto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">

            {/* Address */}
            {(society.address || society.city) && (
              <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Indirizzo</p>
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
              <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Telefono</p>
                  <a href={`tel:${society.phone}`} className="mt-1 text-sm text-brand-blue hover:underline">
                    {society.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {society.email && (
              <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <a
                    href={`mailto:${society.email}`}
                    className="mt-1 text-sm text-brand-blue hover:underline break-all"
                  >
                    {society.email}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {society.website && (
              <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Globe className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Sito Web</p>
                  <a
                    href={society.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-brand-blue hover:underline break-all"
                  >
                    {society.website}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Info Card */}
        <Card className="border-2 border-gray-200 hover:border-brand-blue/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-brand-blue/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-brand-blue">
              <Building2 className="h-5 w-5" />
              Informazioni Legali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* VAT Number */}
            {society.vat_number && (
              <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Hash className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Partita IVA</p>
                  <p className="mt-1 text-sm text-gray-600 font-mono">{society.vat_number}</p>
                </div>
              </div>
            )}

            {/* Fiscal Code */}
            {society.fiscal_code && (
              <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Hash className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Codice Fiscale</p>
                  <p className="mt-1 text-sm text-gray-600 font-mono">{society.fiscal_code}</p>
                </div>
              </div>
            )}

            {/* Legal Representative */}
            {society.legal_representative && (
              <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Rappresentante Legale</p>
                  <p className="mt-1 text-sm text-gray-600">{society.legal_representative}</p>
                </div>
              </div>
            )}

            {!society.vat_number && !society.fiscal_code && !society.legal_representative && (
              <p className="text-sm text-gray-500 italic text-center py-4">
                Nessuna informazione legale disponibile
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata Card */}
      <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold text-gray-900">Creata il:</span>
              <span>{formatDate(society.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold text-gray-900">Ultima modifica:</span>
              <span>{formatDate(society.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
