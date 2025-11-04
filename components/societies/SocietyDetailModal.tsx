'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  User,
  Edit,
  Calendar,
  ExternalLink,
  Copy,
  Info,
} from 'lucide-react';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/types/database';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/components/auth/RequireRole';
import { formatDate } from '@/lib/utils';
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

  const handleCopy = async (label: string, value?: string | null) => {
    if (!value || !value.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: 'Copiato',
        description: `${label} copiato negli appunti`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Clipboard error:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile copiare il valore',
        variant: 'destructive',
      });
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

  const formatAddress = (value: Society | null) => {
    if (!value?.address) return null;

    const parts = [
      value.address?.trim() || '',
      value.city?.trim() ? `${value.postal_code || ''} ${value.city}`.trim() : '',
      value.province?.trim() ? `(${value.province})` : '',
    ].filter(Boolean);

    return parts.join(' ');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 bg-slate-50">
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
            {/* Header */}
            <div className="relative border-b border-slate-200 bg-gradient-to-r from-blue-600/10 via-indigo-500/5 to-transparent px-6 sm:px-8 py-6 sm:py-7">
              <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:pr-16">
                <div className="flex w-full items-start gap-4">
                  <div className="flex-shrink-0 rounded-2xl border border-white/50 bg-white shadow-sm ring-2 ring-blue-100/60">
                    {society.logo_url ? (
                      <img
                        src={society.logo_url}
                        alt={society.name}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        <Building2 className="h-7 w-7 sm:h-9 sm:w-9" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 md:pr-4">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                      {society.name}
                    </DialogTitle>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {society.society_code && (
                        <Badge variant="secondary" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
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

                      <StatusBadge
                        variant={society.is_active ? 'success' : 'inactive'}
                        label={society.is_active ? 'Attiva' : 'Inattiva'}
                        size="sm"
                      />

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

                {isAdmin && (
                  <div className="flex items-center justify-end md:self-start md:ml-auto md:mr-12">
                    <Button
                      onClick={handleEdit}
                      variant="secondary"
                      size="sm"
                      className="border border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-50"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifica
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="space-y-6">
                    {society.description && (
                      <SectionCard icon={Info} title="Descrizione" description="Breve panoramica della società">
                        <p className="text-sm leading-6 text-slate-700">{society.description}</p>
                      </SectionCard>
                    )}

                    <SectionCard
                      icon={Building2}
                      title="Informazioni Principali"
                      description="Dati identificativi e logistici"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoRow icon={MapPin} label="Indirizzo" value={formatAddress(society)} />
                        <InfoRow icon={Phone} label="Telefono" value={society.phone} />
                        <InfoRow icon={Mail} label="Email" value={society.email} />
                        <InfoRow icon={Globe} label="Sito web" value={society.website} />
                        <InfoRow icon={Hash} label="Codice Società" value={society.society_code} />
                        <InfoRow icon={Hash} label="Ente" value={society.organization} />
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={User}
                      title="Dati Legali e Fiscali"
                      description="Informazioni utili per documentazione e contrattualistica"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoRow icon={Hash} label="Partita IVA" value={society.vat_number} />
                        <InfoRow icon={Hash} label="Codice Fiscale" value={society.fiscal_code} />
                        <div className="md:col-span-2">
                          <InfoRow icon={User} label="Rappresentante Legale" value={society.legal_representative} />
                        </div>
                      </div>
                    </SectionCard>
                  </div>

                  <aside className="space-y-6">
                    <SectionCard
                      icon={Mail}
                      title="Contatti Rapidi"
                      description="Gestisci contatti con un click"
                    >
                      <div className="space-y-3">
                        <ContactRow
                          icon={Phone}
                          label="Telefono"
                          value={society.phone}
                          href={society.phone ? `tel:${society.phone}` : undefined}
                          onCopy={handleCopy}
                        />
                        <ContactRow
                          icon={Mail}
                          label="Email"
                          value={society.email}
                          href={society.email ? `mailto:${society.email}` : undefined}
                          onCopy={handleCopy}
                        />
                        <ContactRow
                          icon={Globe}
                          label="Sito web"
                          value={society.website}
                          href={society.website || undefined}
                          openInNewTab
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={Calendar}
                      title="Cronologia"
                      description="Date di creazione e ultimo aggiornamento"
                    >
                      <div className="space-y-3 text-sm text-slate-600">
                        <MetaRow
                          icon={Calendar}
                          label="Creata il"
                          value={formatDate(society.created_at)}
                        />
                        <MetaRow
                          icon={Calendar}
                          label="Ultima modifica"
                          value={formatDate(society.updated_at)}
                        />
                      </div>
                    </SectionCard>
                  </aside>
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

// Helper icon to avoid shadowed name
type IconType = LucideIcon;

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: IconType;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value?: ReactNode | null;
}) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    (!(typeof value === 'string') || value.trim() !== '');

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
      <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {hasValue ? (
          <p className="mt-1 text-sm font-medium text-slate-900 break-words">{value}</p>
        ) : (
          <p className="mt-1 text-sm italic text-slate-400">Non disponibile</p>
        )}
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  openInNewTab,
  onCopy,
}: {
  icon: IconType;
  label: string;
  value?: string | null;
  href?: string;
  openInNewTab?: boolean;
  onCopy?: (label: string, value?: string | null) => void;
}) {
  const hasValue = value && value.trim().length > 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          {hasValue ? (
            href ? (
              <a
                href={href}
                target={openInNewTab ? '_blank' : undefined}
                rel={openInNewTab ? 'noreferrer' : undefined}
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
              >
                {value}
                {openInNewTab && <ExternalLink className="h-3.5 w-3.5" />}
              </a>
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-900 break-words">{value}</p>
            )
          ) : (
            <p className="mt-1 text-sm italic text-slate-400">Non disponibile</p>
          )}
        </div>
      </div>

      {hasValue && onCopy && (
        <button
          type="button"
          onClick={() => onCopy(label, value)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          aria-label={`Copia ${label.toLowerCase()}`}
        >
          <Copy className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}
