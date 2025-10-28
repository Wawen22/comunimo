'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { getRegistrationStatusText, getRegistrationStatusColor } from '@/lib/utils/registrationUtils';

interface RegistrationStatusBadgeProps {
  isOpen: boolean;
  className?: string;
}

/**
 * Badge component to display registration status (open/closed)
 * Uses color AND icon to ensure accessibility (not relying on color alone)
 */
export function RegistrationStatusBadge({ isOpen, className = '' }: RegistrationStatusBadgeProps) {
  const statusText = getRegistrationStatusText(isOpen);
  const colors = getRegistrationStatusColor(isOpen);
  const Icon = isOpen ? CheckCircle2 : XCircle;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-semibold ${colors.bg} ${colors.text} ${colors.border} ${className}`}
      role="status"
      aria-label={`Stato iscrizioni: ${statusText}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{statusText}</span>
    </div>
  );
}

