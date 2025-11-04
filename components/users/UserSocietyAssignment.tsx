'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Trash2, Building2, Search } from 'lucide-react';
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
  const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([]);
  const [societySearch, setSocietySearch] = useState('');

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
    if (selectedSocietyIds.length === 0) return;

    try {
      setSaving(true);
      setError(null);
      for (const societyId of selectedSocietyIds) {
        const result = await assignUserToSociety(user.id, societyId);
        if (!result.success) {
          throw new Error(result.error ?? 'Errore nell\'assegnazione');
        }
      }

      setSelectedSocietyIds([]);
      setSocietySearch('');
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

  const societyLookup = useMemo(() => {
    const map: Record<string, Society> = {};
    allSocieties.forEach((society) => {
      map[society.id] = society;
    });
    return map;
  }, [allSocieties]);

  const selectedSocieties = useMemo(() =>
    selectedSocietyIds
      .map((id) => societyLookup[id])
      .filter((society): society is Society => Boolean(society)),
  [selectedSocietyIds, societyLookup]);

  const filteredSocieties = useMemo(() => {
    const query = societySearch.trim().toLowerCase();
    if (!query) return availableSocieties;

    return availableSocieties.filter((society) => {
      const name = society.name?.toLowerCase() ?? '';
      const code = society.society_code?.toLowerCase() ?? '';
      return name.includes(query) || code.includes(query);
    });
  }, [availableSocieties, societySearch]);

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
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-gray-900">Aggiungi Società</h3>
                {selectedSocieties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSocieties.map((society) => (
                      <Badge
                        key={society.id}
                        variant="secondary"
                        className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <span className="text-xs font-medium">
                          {society.society_code ? `${society.society_code} · ${society.name}` : society.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSocietyIds((current) => current.filter((id) => id !== society.id))
                          }
                          className="ml-1 rounded-full p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                          aria-label={`Rimuovi ${society.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {selectedSocieties.length > 0 && (
                <p className="text-xs text-blue-600">
                  Selezionate {selectedSocieties.length} società
                </p>
              )}
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={societySearch}
                  onChange={(event) => setSocietySearch(event.target.value)}
                  placeholder="Cerca per nome o codice..."
                  className="pl-9"
                  disabled={loading || saving || availableSocieties.length === 0}
                />
              </div>
              <div className="rounded-md border border-gray-200 bg-white max-h-52 overflow-y-auto divide-y divide-gray-100">
                {loading ? (
                  <div className="px-4 py-8 text-sm text-gray-500 text-center">Caricamento società...</div>
                ) : availableSocieties.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-amber-600 text-center">
                    Tutte le società risultano già assegnate a questo utente
                  </div>
                ) : filteredSocieties.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-gray-500 text-center">
                    Nessuna società trovata per "{societySearch}"
                  </div>
                ) : (
                  filteredSocieties.map((society) => {
                    const isSelected = selectedSocietyIds.includes(society.id);
                    return (
                      <label
                        key={society.id}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50/60"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            setSelectedSocietyIds((current) => {
                              if (checked) {
                                if (current.includes(society.id)) return current;
                                return [...current, society.id];
                              }
                              return current.filter((id) => id !== society.id);
                            });
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{society.name}</span>
                          <span className="text-xs text-gray-500">{society.society_code ?? 'N/A'}</span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Button
                  onClick={handleAssignSociety}
                  disabled={selectedSocietyIds.length === 0 || saving}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Assegna {selectedSocietyIds.length > 0 ? `(${selectedSocietyIds.length})` : ''}
                </Button>
                {selectedSocietyIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSocietyIds([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Annulla selezione
                  </button>
                )}
              </div>
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
                            <StatusBadge variant="success" label="Attiva" size="sm" />
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
