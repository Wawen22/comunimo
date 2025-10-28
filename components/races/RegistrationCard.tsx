'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  Hash, 
  Building2, 
  CreditCard,
  MoreVertical,
  UserX,
  Trophy,
  Flag,
  Cake
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface RegistrationCardProps {
  registration: any;
  onCancel?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * Modern card component for displaying athlete registrations
 * Features:
 * - Clean card design with visual hierarchy
 * - Color-coded organization badges
 * - Prominent bib number display
 * - Hover effects and animations
 * - Quick actions dropdown
 * - Responsive layout
 */
export function RegistrationCard({ 
  registration, 
  onCancel, 
  showActions = true,
  compact = false 
}: RegistrationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const member = registration.member as any;
  const society = registration.society as any;

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

  const age = calculateAge(member?.birth_date);

  if (compact) {
    return (
      <>
        {/* Desktop/Tablet Layout (≥768px) */}
        <div
          className={cn(
            'hidden md:flex group relative items-center gap-4 rounded-xl border-2 bg-white p-4 transition-all duration-300',
            isHovered ? 'border-brand-blue shadow-lg scale-[1.005]' : 'border-gray-200 shadow-sm'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Bib Number - Compact */}
          <div className="flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white shadow-md">
              <div className="text-center">
                <Hash className="h-3 w-3 text-blue-200 mx-auto mb-0.5" />
                <span className="text-lg font-bold font-mono">{registration.bib_number}</span>
              </div>
            </div>
          </div>

          {/* Main Info - Compact */}
          <div className="flex-1 min-w-0 grid grid-cols-12 gap-3">
            {/* Name & Organization - Col 1 */}
            <div className="col-span-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <h4 className="font-bold text-gray-900 text-base truncate">
                  {member?.first_name} {member?.last_name}
                </h4>
              </div>
              {registration.organization && (
                <Badge className={cn('text-xs font-semibold', getOrganizationColor(registration.organization))}>
                  {getOrganizationIcon(registration.organization)}
                  <span className="ml-1">{registration.organization}</span>
                </Badge>
              )}
            </div>

            {/* Birth Date - Col 2 */}
            <div className="col-span-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Calendar className="h-3.5 w-3.5 text-pink-500" />
                <p className="text-xs text-gray-500">Data di Nascita</p>
              </div>
              {member?.birth_date ? (
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
                {registration.category || '-'}
              </p>
            </div>

            {/* Membership Number - Col 4 */}
            <div className="col-span-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                <p className="text-xs text-gray-500">N° Tessera</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {member?.membership_number || '-'}
              </p>
            </div>

            {/* Society - Col 5 */}
            <div className="col-span-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Building2 className="h-3.5 w-3.5 text-green-500" />
                <p className="text-xs text-gray-500">Società</p>
              </div>
              {society ? (
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{society.name}</p>
                  {society.society_code && (
                    <p className="text-xs text-gray-600 font-mono">Cod. {society.society_code}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>
          </div>

          {/* Actions - Compact */}
          {showActions && onCancel && (
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onCancel(registration.id)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Annulla Iscrizione
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Layout (<768px) */}
        <div
          className={cn(
            'md:hidden group relative rounded-xl border-2 bg-white p-4 transition-all duration-300',
            isHovered ? 'border-brand-blue shadow-lg' : 'border-gray-200 shadow-sm'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header: Name + Bib Badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-base mb-1.5 truncate">
                {member?.first_name} {member?.last_name}
              </h4>
              {registration.organization && (
                <Badge className={cn('text-xs font-semibold', getOrganizationColor(registration.organization))}>
                  {getOrganizationIcon(registration.organization)}
                  <span className="ml-1">{registration.organization}</span>
                </Badge>
              )}
            </div>

            {/* Bib Number Badge - Top Right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white shadow-md">
                <Hash className="h-3.5 w-3.5" />
                <span className="text-base font-bold font-mono">{registration.bib_number}</span>
              </div>

              {/* Actions Menu */}
              {showActions && onCancel && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onCancel(registration.id)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Annulla Iscrizione
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              {member?.birth_date ? (
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
                {registration.category || '-'}
              </p>
            </div>

            {/* Membership Number */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <CreditCard className="h-3 w-3 text-purple-500" />
                <p className="text-xs text-gray-500 font-medium">Tessera</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {member?.membership_number || '-'}
              </p>
            </div>

            {/* Society */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Building2 className="h-3 w-3 text-green-500" />
                <p className="text-xs text-gray-500 font-medium">Società</p>
              </div>
              {society ? (
                <p className="text-sm font-semibold text-gray-900 truncate">{society.name}</p>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300',
        isHovered ? 'border-brand-blue shadow-2xl scale-[1.02]' : 'border-gray-200 shadow-md'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Organization Badge - Top Right */}
      {registration.organization && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className={cn('text-xs font-semibold shadow-sm', getOrganizationColor(registration.organization))}>
            {getOrganizationIcon(registration.organization)}
            <span className="ml-1">{registration.organization}</span>
          </Badge>
        </div>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Bib Number - Prominent */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className={cn(
                'flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg transition-all duration-300',
                'bg-gradient-to-br from-brand-blue to-brand-blue-dark',
                isHovered && 'scale-110 shadow-xl'
              )}>
                <div className="text-center">
                  <Hash className="h-4 w-4 text-blue-200 mx-auto mb-1" />
                  <span className="text-2xl font-bold text-white font-mono">{registration.bib_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && onCancel && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onCancel(registration.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Annulla Iscrizione
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Athlete Info */}
        <div className="space-y-3">
          {/* Name */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
              {member?.first_name} {member?.last_name}
            </h3>
            {member?.fiscal_code && (
              <p className="text-xs text-gray-500 font-mono mt-1">{member.fiscal_code}</p>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Birth Date & Age */}
            {member?.birth_date && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                  <Cake className="h-4 w-4 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Nato il</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(member.birth_date)}</p>
                  {age && <p className="text-xs text-gray-600">{age} anni</p>}
                </div>
              </div>
            )}

            {/* Category */}
            {registration.category && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Trophy className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Categoria</p>
                  <p className="text-sm font-semibold text-gray-900">{registration.category}</p>
                </div>
              </div>
            )}

            {/* Membership Number */}
            {member?.membership_number && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Tessera</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{member.membership_number}</p>
                </div>
              </div>
            )}

            {/* Society */}
            {society && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <Building2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Società</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{society.name}</p>
                  {society.society_code && (
                    <p className="text-xs text-gray-600 font-mono">{society.society_code}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Organization Badge - Full Width */}
          {registration.organization && (
            <div className="pt-3 border-t border-gray-100">
              <Badge className={cn('w-full justify-center py-2 text-sm font-semibold', getOrganizationColor(registration.organization))}>
                {getOrganizationIcon(registration.organization)}
                <span className="ml-2">{registration.organization}</span>
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

