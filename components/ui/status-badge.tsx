import type { ComponentProps, ReactNode } from 'react';
import { CheckCircle2, CircleSlash, AlertTriangle, XCircle, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusBadgeSize = 'sm' | 'md';
type StatusBadgeVariant = 'success' | 'inactive' | 'warning' | 'danger' | 'info' | 'neutral';

interface VariantConfig {
  className: string;
  defaultLabel: string;
  DefaultIcon: typeof CheckCircle2;
}

const VARIANT_STYLES: Record<StatusBadgeVariant, VariantConfig> = {
  success: {
    className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 border-transparent',
    defaultLabel: 'Attiva',
    DefaultIcon: CheckCircle2,
  },
  inactive: {
    className: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 border-transparent',
    defaultLabel: 'Inattiva',
    DefaultIcon: CircleSlash,
  },
  warning: {
    className: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 border-transparent',
    defaultLabel: 'Attenzione',
    DefaultIcon: AlertTriangle,
  },
  danger: {
    className: 'bg-red-100 text-red-700 ring-1 ring-red-200 border-transparent',
    defaultLabel: 'Errore',
    DefaultIcon: XCircle,
  },
  info: {
    className: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 border-transparent',
    defaultLabel: 'Info',
    DefaultIcon: Info,
  },
  neutral: {
    className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 border-transparent',
    defaultLabel: 'Stato',
    DefaultIcon: Info,
  },
};

const SIZE_STYLES: Record<StatusBadgeSize, string> = {
  sm: 'text-xs py-1',
  md: 'text-sm py-1.5',
};

export interface StatusBadgeProps
  extends Omit<ComponentProps<typeof Badge>, 'variant' | 'children'> {
  /** Tipo di stato da visualizzare */
  variant: StatusBadgeVariant;
  /** Testo del badge; se omesso usa il default della variante */
  label?: ReactNode;
  /** Override icona di default */
  icon?: ReactNode;
  /** Nasconde l'icona mantenendo lo spazio testuale */
  showIcon?: boolean;
  /** Dimensione del badge */
  size?: StatusBadgeSize;
  /** Contenuto alternativo; prevale su `label` */
  children?: ReactNode;
}

export function StatusBadge({
  variant,
  label,
  icon,
  showIcon = true,
  size = 'sm',
  className,
  children,
  ...rest
}: StatusBadgeProps) {
  const config = VARIANT_STYLES[variant] ?? VARIANT_STYLES.neutral;
  const content = children ?? label ?? config.defaultLabel;
  const Icon = config.DefaultIcon;

  return (
    <Badge
      {...rest}
      variant="secondary"
      className={cn(
        'gap-1.5 rounded-full font-semibold uppercase tracking-wide',
        config.className,
        SIZE_STYLES[size],
        showIcon ? 'pl-2.5 pr-3' : 'px-3',
        className,
      )}
    >
      {showIcon && (
        <span className="flex items-center">
          {icon ?? <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
      )}
      <span className="leading-none">{content}</span>
    </Badge>
  );
}

StatusBadge.displayName = 'StatusBadge';
