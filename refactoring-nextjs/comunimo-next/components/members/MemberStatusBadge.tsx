'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Ban } from 'lucide-react';
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
          variant: 'destructive' as const,
          icon: XCircle,
        };
      case 'cancelled':
        return {
          label: 'Annullato',
          variant: 'secondary' as const,
          icon: Ban,
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

