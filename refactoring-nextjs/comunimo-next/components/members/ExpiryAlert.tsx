'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { getExpiryStatus, formatExpiryDate, getDaysUntilExpiry } from '@/lib/utils/expiryCheck';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExpiryAlertProps {
  expiryDate: Date | string | null;
  label: string;
  warningDays?: number;
  showTooltip?: boolean;
  compact?: boolean;
}

export function ExpiryAlert({
  expiryDate,
  label,
  warningDays = 30,
  showTooltip = true,
  compact = false,
}: ExpiryAlertProps) {
  const status = getExpiryStatus(expiryDate, warningDays);
  const daysRemaining = getDaysUntilExpiry(expiryDate);
  const formattedDate = formatExpiryDate(expiryDate);

  const getStatusConfig = () => {
    switch (status) {
      case 'valid':
        return {
          label: compact ? '✓' : 'Valido',
          variant: 'success' as const,
          icon: CheckCircle2,
          tooltipText: `${label}: ${formattedDate}`,
        };
      case 'expiring':
        return {
          label: compact ? '!' : `Scade tra ${daysRemaining} gg`,
          variant: 'warning' as const,
          icon: AlertTriangle,
          tooltipText: `${label}: Scade il ${formattedDate} (${daysRemaining} giorni)`,
        };
      case 'expired':
        return {
          label: compact ? '✗' : 'Scaduto',
          variant: 'destructive' as const,
          icon: XCircle,
          tooltipText: `${label}: Scaduto il ${formattedDate}`,
        };
      case 'unknown':
      default:
        return {
          label: compact ? '?' : 'N/D',
          variant: 'secondary' as const,
          icon: HelpCircle,
          tooltipText: `${label}: Data non disponibile`,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const badgeContent = (
    <Badge variant={config.variant} className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block cursor-help">
            {badgeContent}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

