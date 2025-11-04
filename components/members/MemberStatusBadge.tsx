'use client';

import { CheckCircle2, XCircle, AlertCircle, Ban } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { MembershipStatus } from '@/lib/types/database';

interface MemberStatusBadgeProps {
  status: MembershipStatus;
}

export function MemberStatusBadge({ status }: MemberStatusBadgeProps) {
  const getStatusConfig = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Attivo',
          variant: 'success' as const,
          icon: CheckCircle2,
        };
      case 'suspended':
        return {
          label: 'Sospeso',
          variant: 'warning' as const,
          icon: AlertCircle,
        };
      case 'expired':
        return {
          label: 'Scaduto',
          variant: 'danger' as const,
          icon: XCircle,
        };
      case 'cancelled':
        return {
          label: 'Annullato',
          variant: 'inactive' as const,
          icon: Ban,
        };
      default:
        return {
          label: status,
          variant: 'neutral' as const,
          icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <StatusBadge
      variant={config.variant}
      label={config.label}
      size="sm"
      icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      className="inline-flex"
    />
  );
}
