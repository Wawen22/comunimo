'use client';

import { Member } from '@/lib/types/database';
import { MemberStatusBadge } from './MemberStatusBadge';
import { User, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MemberCardProps {
  member: Member & {
    society?: {
      id: string;
      name: string;
      society_code: string | null;
    } | null;
  };
}

export function MemberCard({ member }: MemberCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
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

  const certStatus = getExpiryStatus(member.medical_certificate_expiry);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start gap-6">
        {/* Photo */}
        <div className="flex-shrink-0">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={`${member.first_name} ${member.last_name}`}
              className="h-32 w-32 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {member.first_name} {member.last_name}
            </h2>
            {member.fiscal_code && (
              <p className="text-sm text-gray-500">{member.fiscal_code}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Society */}
            <div>
              <p className="text-sm font-medium text-gray-500">Società</p>
              <p className="mt-1 text-sm text-gray-900">
                {member.society?.name || '-'}
                {member.society_code && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({member.society_code})
                  </span>
                )}
              </p>
            </div>

            {/* Organization */}
            <div>
              <p className="text-sm font-medium text-gray-500">Ente</p>
              <p className="mt-1 text-sm text-gray-900">
                {member.organization || '-'}
              </p>
            </div>

            {/* Category */}
            <div>
              <p className="text-sm font-medium text-gray-500">Categoria</p>
              <p className="mt-1 text-sm text-gray-900">
                {member.category || '-'}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-sm font-medium text-gray-500">Stato</p>
              <div className="mt-1">
                <MemberStatusBadge status={member.membership_status} />
              </div>
            </div>
          </div>

          {/* Expiry Warnings */}
          {(certStatus === 'expired' || certStatus === 'expiring') && (
            <div className="mt-4 space-y-2">
              {/* Certificate Expiry */}
              {member.medical_certificate_expiry && (certStatus === 'expired' || certStatus === 'expiring') && (
                <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  certStatus === 'expired'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-orange-50 text-orange-800'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Certificato medico {certStatus === 'expired' ? 'scaduto' : 'in scadenza'} il{' '}
                    {formatDate(member.medical_certificate_expiry)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Valid Status */}
          {certStatus === 'valid' && member.medical_certificate_expiry && (
            <div className="mt-4">
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Certificato medico valido fino al {formatDate(member.medical_certificate_expiry)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

