'use client';

import { useEffect, useState } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { getUserSocieties } from '@/lib/utils/userSocietyUtils';
import { Badge } from '@/components/ui/badge';
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
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="h-4 w-4 animate-pulse" />
          <span>Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Building2 className="h-4 w-4" />
        <span>Società Gestite</span>
      </div>

      {societies.length === 0 ? (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium">Nessuna società assegnata</p>
              <p className="mt-1 text-yellow-700">
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
              className="rounded-lg bg-blue-50 border border-blue-200 p-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {society.name}
                  </p>
                  {society.society_code && (
                    <p className="text-xs text-blue-700 mt-0.5">
                      {society.society_code}
                    </p>
                  )}
                </div>
                {society.is_active && (
                  <Badge
                    variant="default"
                    className="text-xs bg-green-100 text-green-800 border-green-200 flex-shrink-0"
                  >
                    Attiva
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {societies.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          Gestisci {societies.length} {societies.length === 1 ? 'società' : 'società'}
        </p>
      )}
    </div>
  );
}

