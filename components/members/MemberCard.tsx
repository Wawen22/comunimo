'use client';

import { useState } from 'react';
import { Member } from '@/lib/types/database';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Calendar,
  Building2,
  CreditCard,
  Trophy,
  Flag,
  Cake,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateDisplayCategory } from '@/lib/utils/categoryCalculator';

interface MemberCardProps {
  member: Member & {
    society?: {
      id: string;
      name: string;
      society_code: string | null;
    } | null;
  };
  onClick?: () => void;
  compact?: boolean;
}

/**
 * Modern card component for displaying members
 * Features:
 * - Clean card design with visual hierarchy
 * - Color-coded organization badges
 * - Hover effects and animations
 * - Responsive layout (desktop and mobile)
 * - Medical certificate status indicators
 */
export function MemberCard({ member, onClick, compact = true }: MemberCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getOrganizationColor = (org: string | null) => {
    switch (org) {
      case 'FIDAL':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600';
      case 'UISP':
        return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600';
      case 'CSI':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600';
      case 'RUNCARD':
        return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white border-gray-500';
    }
  };

  const getOrganizationIcon = (org: string | null) => {
    switch (org) {
      case 'FIDAL':
        return <Trophy className="h-3 w-3" />;
      case 'UISP':
        return <Flag className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'expiring';
    return 'valid';
  };

  const age = calculateAge(member.birth_date);
  const certStatus = getExpiryStatus(member.medical_certificate_expiry);
  const displayCategory = member.category || calculateDisplayCategory(member.birth_date, member.gender);

  if (compact) {
    return (
      <>
        {/* Desktop/Tablet Layout (≥768px) */}
        <div
          className={cn(
            'hidden md:flex group relative items-center gap-4 rounded-xl border-2 bg-white p-4 transition-all duration-300 cursor-pointer',
            isHovered ? 'border-brand-blue shadow-lg scale-[1.005]' : 'border-gray-200 shadow-sm'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
        >
          {/* Main Info - Compact */}
          <div className="flex-1 min-w-0 grid grid-cols-12 gap-3">
            {/* Name & Organization - Col 1 */}
            <div className="col-span-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <h4 className="font-bold text-gray-900 text-base truncate">
                  {member.first_name} {member.last_name}
                </h4>
              </div>
              {member.organization && (
                <Badge className={cn('text-xs font-semibold', getOrganizationColor(member.organization))}>
                  {getOrganizationIcon(member.organization)}
                  <span className="ml-1">{member.organization}</span>
                </Badge>
              )}
            </div>

            {/* Birth Date - Col 2 */}
            <div className="col-span-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Calendar className="h-3.5 w-3.5 text-pink-500" />
                <p className="text-xs text-gray-500">Data di Nascita</p>
              </div>
              {member.birth_date ? (
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(member.birth_date)}</p>
                  {age && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Cake className="h-3 w-3 text-pink-400" />
                      <span>{age} anni</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>

            {/* Category - Col 3 */}
            <div className="col-span-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Trophy className="h-3.5 w-3.5 text-blue-500" />
                <p className="text-xs text-gray-500">Categoria</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {displayCategory || '-'}
              </p>
            </div>

            {/* Membership Number - Col 4 */}
            <div className="col-span-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                <p className="text-xs text-gray-500">N° Tessera</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {member.membership_number || '-'}
              </p>
            </div>

            {/* Society - Col 5 */}
            <div className="col-span-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Building2 className="h-3.5 w-3.5 text-green-500" />
                <p className="text-xs text-gray-500">Società</p>
              </div>
              {member.society ? (
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{member.society.name}</p>
                  {member.society.society_code && (
                    <p className="text-xs text-gray-600 font-mono">Cod. {member.society.society_code}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>

            {/* Medical Certificate Status - Col 6 */}
            <div className="col-span-1 flex items-center justify-center">
              {certStatus === 'expired' && (
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-100" title={`Certificato scaduto il ${formatDate(member.medical_certificate_expiry)}`}>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              )}
              {certStatus === 'expiring' && (
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-100" title={`Certificato in scadenza il ${formatDate(member.medical_certificate_expiry)}`}>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
              )}
              {certStatus === 'valid' && (
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-100" title={`Certificato valido fino al ${formatDate(member.medical_certificate_expiry)}`}>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout (<768px) */}
        <div
          className={cn(
            'md:hidden group relative rounded-xl border-2 bg-white p-4 transition-all duration-300 cursor-pointer',
            isHovered ? 'border-brand-blue shadow-lg' : 'border-gray-200 shadow-sm'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
        >
          {/* Header: Name + Organization */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-base mb-1.5 truncate">
                {member.first_name} {member.last_name}
              </h4>
              {member.organization && (
                <Badge className={cn('text-xs font-semibold', getOrganizationColor(member.organization))}>
                  {getOrganizationIcon(member.organization)}
                  <span className="ml-1">{member.organization}</span>
                </Badge>
              )}
            </div>

            {/* Medical Certificate Status */}
            <div className="flex-shrink-0">
              {certStatus === 'expired' && (
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              )}
              {certStatus === 'expiring' && (
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
              )}
              {certStatus === 'valid' && (
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>
          </div>

          {/* Info Grid - 2 Columns */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Birth Date */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="h-3 w-3 text-pink-500" />
                <p className="text-xs text-gray-500 font-medium">Data Nascita</p>
              </div>
              {member.birth_date ? (
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(member.birth_date)}</p>
                  {age && (
                    <p className="text-xs text-gray-600">{age} anni</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Trophy className="h-3 w-3 text-blue-500" />
                <p className="text-xs text-gray-500 font-medium">Categoria</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {displayCategory || '-'}
              </p>
            </div>

            {/* Membership Number */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <CreditCard className="h-3 w-3 text-purple-500" />
                <p className="text-xs text-gray-500 font-medium">Tessera</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {member.membership_number || '-'}
              </p>
            </div>

            {/* Society */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Building2 className="h-3 w-3 text-green-500" />
                <p className="text-xs text-gray-500 font-medium">Società</p>
              </div>
              {member.society ? (
                <p className="text-sm font-semibold text-gray-900 truncate">{member.society.name}</p>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>
          </div>

          {/* Medical Certificate Info */}
          {member.medical_certificate_expiry && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className={cn(
                'flex items-center gap-2 text-xs px-2 py-1.5 rounded-md',
                certStatus === 'expired' && 'bg-red-50 text-red-700',
                certStatus === 'expiring' && 'bg-orange-50 text-orange-700',
                certStatus === 'valid' && 'bg-green-50 text-green-700'
              )}>
                {certStatus === 'expired' && <AlertCircle className="h-3 w-3" />}
                {certStatus === 'expiring' && <AlertCircle className="h-3 w-3" />}
                {certStatus === 'valid' && <CheckCircle2 className="h-3 w-3" />}
                <span>
                  Cert. {certStatus === 'expired' ? 'scaduto' : certStatus === 'expiring' ? 'in scadenza' : 'valido fino al'} {formatDate(member.medical_certificate_expiry)}
                </span>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Non-compact version (not used in this context, but kept for compatibility)
  return null;
}

