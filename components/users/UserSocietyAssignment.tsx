'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Building2, Check } from 'lucide-react';
import { assignUserToSociety, removeUserFromSociety } from '@/lib/utils/userSocietyUtils';
import type { UserWithSocieties } from '@/app/(dashboard)/dashboard/users/page';
import type { Society } from '@/types/database';

interface UserSocietyAssignmentProps {
  user: UserWithSocieties;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserSocietyAssignment({ user, onClose, onUpdate }: UserSocietyAssignmentProps) {
  const [allSocieties, setAllSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>('');

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAllSocieties(data || []);
    } catch (err) {
      console.error('Error fetching societies:', err);
      setError('Errore nel caricamento delle società');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSociety = async () => {
    if (!selectedSocietyId) return;

    try {
      setSaving(true);
      setError(null);

      await assignUserToSociety(user.id, selectedSocietyId);

      setSelectedSocietyId('');
      onUpdate();
    } catch (err) {
      console.error('Error assigning society:', err);
      setError(err instanceof Error ? err.message : 'Errore nell\'assegnazione');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSociety = async (societyId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questa assegnazione?')) return;

    try {
      setSaving(true);
      setError(null);

      await removeUserFromSociety(user.id, societyId);

      onUpdate();
    } catch (err) {
      console.error('Error removing society:', err);
      setError(err instanceof Error ? err.message : 'Errore nella rimozione');
    } finally {
      setSaving(false);
    }
  };

  // Societies not yet assigned to user
  const availableSocieties = allSocieties.filter(
    society => !user.societies.some(us => us.id === society.id)
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black bg-opacity-50 px-4 !mt-0">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestisci Società</h2>
            <p className="mt-1 text-sm text-gray-600">
              {user.full_name || user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Add Society Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Aggiungi Società</h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="sm:flex-1 sm:min-w-0">
                <select
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  disabled={loading || saving || availableSocieties.length === 0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loading ? 'Caricamento...' : availableSocieties.length === 0 ? 'Tutte le società già assegnate' : 'Seleziona una società'}
                  </option>
                  {availableSocieties.map((society) => (
                    <option key={society.id} value={society.id}>
                      {society.society_code} - {society.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAssignSociety}
                disabled={!selectedSocietyId || saving}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi
              </Button>
            </div>
          </div>

          {/* Assigned Societies List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">
              Società Assegnate ({user.societies.length})
            </h3>

            {user.societies.length === 0 ? (
              <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
                <Building2 className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-amber-800 font-medium">
                  Nessuna società assegnata
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Questo utente non potrà accedere a nessun dato finché non gli viene assegnata almeno una società
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {user.societies.map((society) => (
                  <div
                    key={society.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {society.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {society.society_code}
                          </Badge>
                          {society.is_active && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              Attiva
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSociety(society.id)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Informazioni</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• L'utente potrà vedere e gestire SOLO i dati delle società assegnate</li>
              <li>• Puoi assegnare più società allo stesso utente (es. FIDAL + UISP)</li>
              <li>• Le modifiche hanno effetto immediato</li>
              <li>• Senza società assegnate, l'utente non vedrà alcun dato</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Chiudi
          </Button>
        </div>
      </div>
    </div>
  );
}
