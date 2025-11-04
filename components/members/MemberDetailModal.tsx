'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
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
  Cake,
  Flag,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ClipboardList,
  Activity,
  Globe,
} from 'lucide-react';
import { Member } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MemberEditModal } from './MemberEditModal';
import { useMemberDetail } from '@/lib/react-query/members';

interface MemberDetailModalProps {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailModal({ memberId, open, onOpenChange }: MemberDetailModalProps) {
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const {
    data: member,
    isLoading,
    isError,
    error,
    refetch,
  } = useMemberDetail(open ? memberId : null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const formatGender = (gender: string | null) => {
    if (!gender) return '-';
    switch (gender) {
      case 'M':
        return 'Maschio';
      case 'F':
        return 'Femmina';
      default:
        return gender;
    }
  };

  const getOrganizationColor = (org: string) => {
    switch (org) {
      case 'FIDAL':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'UISP':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CSI':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'LIBERTAS':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const membershipStatusStyles: Record<
    NonNullable<Member['membership_status']>,
    { label: string; className: string }
  > = {
    active: { label: 'Attivo', className: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
    suspended: { label: 'Sospeso', className: 'bg-amber-100 text-amber-700 ring-amber-200' },
    expired: { label: 'Scaduto', className: 'bg-rose-100 text-rose-700 ring-rose-200' },
    cancelled: { label: 'Annullato', className: 'bg-slate-200 text-slate-700 ring-slate-300' },
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    void refetch();
  };

  const handleCopy = async (label: string, value?: string | null) => {
    if (!value || !value.trim()) return;

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

  const formatAddress = (value: Member | null) => {
    if (!value) return null;

    const parts = [
      value.address?.trim() || '',
      value.city?.trim() ? `${value.postal_code || ''} ${value.city}`.trim() : '',
      value.province?.trim() ? `(${value.province})` : '',
    ].filter(Boolean);

    return parts.length ? parts.join(' ') : null;
  };

  const shouldShowDetail = open && !showEditModal;

  if (!open && !showEditModal) return null;

  return (
    <>
      {shouldShowDetail && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 bg-slate-50">
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
            <div className="relative border-b border-slate-200 bg-gradient-to-r from-sky-100 via-indigo-50 to-transparent px-6 sm:px-8 py-6 sm:py-7">
              <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:pr-16">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-slate-600 shadow-sm">
                    <User className="h-8 w-8" />
                  </div>
                  <div className="min-w-0 flex-1 md:pr-4">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                      {member.first_name} {member.last_name}
                    </DialogTitle>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {member.organization && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm',
                            getOrganizationColor(member.organization),
                          )}
                        >
                          <Flag className="h-3.5 w-3.5" />
                          {member.organization}
                        </Badge>
                      )}

                      {member.category && (
                        <Badge className="flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 ring-1 ring-blue-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          <Trophy className="h-3.5 w-3.5" />
                          {member.category}
                        </Badge>
                      )}

                      {member.birth_date && (
                        <Badge className="flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          <Cake className="h-3.5 w-3.5" />
                          {formatDate(member.birth_date)}
                        </Badge>
                      )}

                      {member.society && (
                        <Badge className="flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          <Building2 className="h-3.5 w-3.5" />
                          {member.society.name}
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

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="space-y-6">
                    <SectionCard
                      icon={User}
                      title="Dati personali"
                      description="Informazioni anagrafiche e contatti dell’atleta"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoRow icon={User} label="Nome" value={member.first_name} />
                        <InfoRow icon={User} label="Cognome" value={member.last_name} />
                        <InfoRow icon={CreditCard} label="Codice fiscale" value={member.fiscal_code} />
                        <InfoRow icon={Cake} label="Data di nascita" value={formatDate(member.birth_date)} />
                        <InfoRow icon={MapPin} label="Luogo di nascita" value={member.birth_place} />
                        <InfoRow icon={Users} label="Sesso" value={formatGender(member.gender)} />
                        <InfoRow icon={Mail} label="Email" value={member.email} />
                        <InfoRow icon={Phone} label="Telefono" value={member.phone} />
                        <InfoRow icon={Phone} label="Cellulare" value={member.mobile} />
                        <div className="md:col-span-2">
                          <InfoRow icon={MapPin} label="Indirizzo" value={formatAddress(member)} />
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={ClipboardList}
                      title="Tesseramento"
                      description="Stato e dettagli del tesseramento"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoRow
                          icon={CheckCircle2}
                          label="Stato tesseramento"
                          value={membershipStatusStyles[member.membership_status || 'active']?.label ?? 'N/D'}
                          highlightClass={
                            membershipStatusStyles[member.membership_status || 'active']?.className
                          }
                        />
                        <InfoRow icon={CreditCard} label="Numero tessera" value={member.membership_number} />
                        <InfoRow icon={Calendar} label="Data tesseramento" value={formatDate(member.membership_date)} />
                        <InfoRow icon={ClipboardList} label="Tipo tesseramento" value={member.membership_type} />
                        <InfoRow
                          icon={Building2}
                          label="Società"
                          value={
                            member.society
                              ? `${member.society.name}${member.society.society_code ? ` (${member.society.society_code})` : ''}`
                              : null
                          }
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={Activity}
                      title="Dati atletici"
                      description="Categoria di appartenenza e informazioni sportive"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoRow icon={Trophy} label="Categoria" value={member.category} />
                        <InfoRow icon={Calendar} label="Anno" value={member.year ? String(member.year) : null} />
                        <InfoRow icon={Flag} label="Codice regionale" value={member.regional_code} />
                        <InfoRow icon={Globe} label="Atleta straniero" value={member.is_foreign ? 'Sì' : 'No'} />
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={FileText}
                      title="Documenti"
                      description="Certificato medico e note aggiuntive"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoRow
                          icon={Calendar}
                          label="Data certificato"
                          value={formatDate(member.medical_certificate_date)}
                        />
                        <InfoRow
                          icon={AlertCircle}
                          label="Scadenza certificato"
                          value={formatDate(member.medical_certificate_expiry)}
                        />
                      </div>

                      {member.notes && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                            <FileText className="h-4 w-4" />
                            Note
                          </p>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                            {member.notes}
                          </p>
                        </div>
                      )}
                    </SectionCard>
                  </div>

                  <aside className="space-y-6">
                    <SectionCard
                      icon={Phone}
                      title="Contatti rapidi"
                      description="Collegamenti immediati per comunicare con l’atleta"
                    >
                      <div className="space-y-3">
                        <ContactRow
                          icon={Phone}
                          label="Telefono"
                          value={member.phone}
                          href={member.phone ? `tel:${member.phone}` : undefined}
                          onCopy={handleCopy}
                        />
                        <ContactRow
                          icon={Phone}
                          label="Cellulare"
                          value={member.mobile}
                          href={member.mobile ? `tel:${member.mobile}` : undefined}
                          onCopy={handleCopy}
                        />
                        <ContactRow
                          icon={Mail}
                          label="Email"
                          value={member.email}
                          href={member.email ? `mailto:${member.email}` : undefined}
                          onCopy={handleCopy}
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={Calendar}
                      title="Cronologia"
                      description="Date di creazione e ultimo aggiornamento"
                    >
                      <div className="space-y-3 text-sm text-slate-600">
                        <MetaRow icon={Calendar} label="Creato il" value={formatDate(member.created_at)} />
                        <MetaRow icon={Calendar} label="Ultima modifica" value={formatDate(member.updated_at)} />
                      </div>
                    </SectionCard>
                  </aside>
                </div>
              </div>
            </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      {memberId && (
        <MemberEditModal
          memberId={memberId}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

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
        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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
  highlightClass,
}: {
  icon: IconType;
  label: string;
  value?: ReactNode | null;
  highlightClass?: string;
}) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    (!(typeof value === 'string') || value.trim() !== '');

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm',
        highlightClass ? `ring-1 ${highlightClass}` : '',
      )}
    >
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
        <p className="text-sm font-medium text-slate-900">{value || '-'}</p>
      </div>
    </div>
  );
}
