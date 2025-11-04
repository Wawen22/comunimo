'use client';

import { useEffect, useState } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { getUserSocieties } from '@/lib/utils/userSocietyUtils';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Society } from '@/types/database';

/**
 * Widget that displays the societies managed by the current user
 * Only visible to society_admin users
 */
export function ManagedSocietiesWidget() {
  const { profile } = useUser();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'society_admin') {
      loadSocieties();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const loadSocieties = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const userSocieties = await getUserSocieties(profile.id);
      setSocieties(userSocieties);
    } catch (error) {
      console.error('Error loading managed societies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only show for society_admin users
  if (!profile || profile.role !== 'society_admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="relative z-10 border-t border-blue-100/50 bg-white/30 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building2 className="h-4 w-4 animate-pulse" />
          <span>Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 border-t border-blue-100/50 bg-white/30 backdrop-blur-sm p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600/70">
        <Building2 className="h-4 w-4" />
        <span>Società Gestite</span>
        <div className="h-px flex-1 bg-gradient-to-r from-blue-300/50 to-transparent" />
      </div>

      {societies.length === 0 ? (
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/50 p-3 shadow-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <p className="font-medium">Nessuna società assegnata</p>
              <p className="mt-1 text-amber-700/80">
                Contatta un amministratore per richiedere l'accesso alle società.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {societies.map((society) => (
            <div
              key={society.id}
              className="group rounded-xl bg-gradient-to-br from-blue-50 to-purple-50/30 border border-blue-200/50 p-2.5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent truncate">
                    {society.name}
                  </p>
                  {society.society_code && (
                    <p className="text-xs text-blue-600/70 mt-0.5">
                      {society.society_code}
                    </p>
                  )}
                </div>
                {society.is_active && (
                  <StatusBadge variant="success" size="sm" showIcon={false} className="flex-shrink-0 shadow-sm" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {societies.length > 0 && (
        <p className="mt-3 text-xs text-slate-500/80">
          Gestisci {societies.length} {societies.length === 1 ? 'società' : 'società'}
        </p>
      )}
    </div>
  );
}
