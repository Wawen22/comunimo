import * as XLSX from 'xlsx';
import type { ChampionshipRegistrationWithDetails } from '@/types/database';

const SPECIALTY_LABELS: Record<string, string> = {
  cross_country: 'Corsa Campestre',
  road: 'Corsa su strada',
  track: 'Pista',
  other: 'Altro',
};

function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('it-IT');
}

function formatMembershipNumber(
  registrationOrg?: string | null,
  memberOrg?: string | null,
  membershipNumber?: string | null,
  fallbackNumber?: string | null
): string {
  const organization = registrationOrg || memberOrg;
  const number = membershipNumber || fallbackNumber;
  if (!organization && !number) return '';
  if (!organization || !number) {
    return number || organization || '';
  }
  return `${organization}: ${number}`;
}

function formatMemberName(lastName?: string | null, firstName?: string | null, birthDate?: string | null): string {
  const parts = [lastName, firstName].filter(Boolean).join(', ');
  if (!parts) return '';
  if (!birthDate) return parts;
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return parts;
  return `${parts} (${parsed.getFullYear()})`;
}

function formatSocietyDetails(
  societyCode?: string | null,
  societyName?: string | null,
  societyProvince?: string | null,
  memberSocietyCode?: string | null
): string {
  const code = societyCode || memberSocietyCode;
  const values = [code, societyName, societyProvince].filter(Boolean);
  return values.join(', ');
}

function getSpecialtyLabel(type?: string | null): string {
  if (!type) return '';
  return SPECIALTY_LABELS[type] || type;
}

function compareBibNumbers(a: string | null | undefined, b: string | null | undefined): number {
  const normalize = (value: string | null | undefined) => {
    if (!value) return { numeric: Number.POSITIVE_INFINITY, original: value ?? '' };
    const numericPart = Number.parseInt(value, 10);
    if (Number.isNaN(numericPart)) {
      return { numeric: Number.POSITIVE_INFINITY, original: value };
    }
    return { numeric: numericPart, original: value };
  };

  const aNorm = normalize(a);
  const bNorm = normalize(b);

  if (aNorm.numeric !== bNorm.numeric) {
    return aNorm.numeric - bNorm.numeric;
  }

  return aNorm.original.localeCompare(bNorm.original);
}

export function exportChampionshipRegistrationsToExcel(
  registrations: ChampionshipRegistrationWithDetails[],
  filename?: string
): boolean {
  if (!registrations.length) {
    return false;
  }

  const sorted = [...registrations].sort((a, b) => compareBibNumbers(a.bib_number, b.bib_number));

  const header = [
    'GARA',
    'Specialità',
    'Numero Tessera',
    'Cognome e Nome',
    'Codice Società',
    'Sesso',
    'Categoria',
    'Pettorale',
    'Scadenza',
    'Data di nascita',
    'Scadenza tessera',
    'Anno in corso',
    'Data iscrizione',
  ];

  const rows = sorted.map((registration) => {
    const championship = registration.championship;
    const member = registration.member;
    const society = registration.society;

    const extendedMember = (member ?? {}) as {
      membership_card_number?: string | null;
      card_expiry_date?: string | null;
      society_code?: string | null;
    };

    const membershipNumberFormatted = formatMembershipNumber(
      registration.organization,
      member?.organization,
      member?.membership_number,
      extendedMember.membership_card_number ?? member?.membership_number ?? null
    );

    return [
      championship?.name ?? '',
      getSpecialtyLabel(championship?.championship_type ?? null),
      membershipNumberFormatted,
      formatMemberName(member?.last_name, member?.first_name, member?.birth_date),
      formatSocietyDetails(society?.society_code, society?.name, society?.province, extendedMember.society_code ?? null),
      member?.gender && member.gender !== 'other' ? member.gender : '',
      registration.category ?? member?.category ?? '',
      registration.bib_number ?? '',
      formatDate(member?.medical_certificate_expiry),
      formatDate(member?.birth_date),
      formatDate(extendedMember.card_expiry_date ?? null),
      championship?.year ? String(championship.year) : '',
      formatDate(registration.registration_date),
    ];
  });

  const data = [header, ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Iscritti');

  const defaultNameBase = sorted[0]?.championship?.slug
    ? sorted[0].championship.slug
    : (sorted[0]?.championship?.name || 'campionato')
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_|_$/g, '') || 'campionato';

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const exportFilename = filename || `${defaultNameBase}_iscritti_${timestamp}`;

  XLSX.writeFile(workbook, `${exportFilename}.xlsx`);

  return true;
}
