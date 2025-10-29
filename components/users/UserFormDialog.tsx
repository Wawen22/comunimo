'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/api/supabase';
import type { Society, UserRole } from '@/types/database';
import type { UserWithSocieties } from '@/app/(dashboard)/dashboard/users/page';
import { createUserAccount, updateUserAccount } from '@/actions/users';
import { Loader2, ShieldAlert, ShieldCheck, Shield, Users } from 'lucide-react';
import clsx from 'clsx';

interface BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreateProps extends BaseProps {
  mode: 'create';
  user?: never;
}

interface EditProps extends BaseProps {
  mode: 'edit';
  user: UserWithSocieties;
}

type UserFormDialogProps = CreateProps | EditProps;

interface FormState {
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  societyIds: string[];
}

const roleOptions: Array<{ value: UserRole; label: string; description: string }> = [
  { value: 'super_admin', label: 'Super Amministratore', description: 'Accesso completo al sistema' },
  { value: 'admin', label: 'Amministratore', description: 'Gestione globale senza impostazioni di sistema' },
  { value: 'society_admin', label: 'Amministratore Società', description: 'Accesso limitato alle società assegnate' },
];

export function UserFormDialog(props: UserFormDialogProps) {
  const { open, mode, onOpenChange, onSuccess } = props;
  const editingUser = mode === 'edit' ? props.user : null;
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [societySearch, setSocietySearch] = useState('');
  const [formState, setFormState] = useState<FormState>(() => ({
    email: '',
    fullName: '',
    role: 'society_admin',
    isActive: true,
    societyIds: [],
  }));

  useEffect(() => {
    if (open) {
      fetchSocieties();
    }
  }, [open]);

  useEffect(() => {
    if (mode === 'edit' && editingUser) {
      setFormState({
        email: editingUser.email,
        fullName: editingUser.full_name ?? '',
        role: editingUser.role,
        isActive: editingUser.is_active,
        societyIds: editingUser.societies.map((society) => society.id),
      });
    } else if (mode === 'create') {
      setFormState({
        email: '',
        fullName: '',
        role: 'society_admin',
        isActive: true,
        societyIds: [],
      });
      setError(null);
    }
  }, [mode, editingUser, open]);

  const activeSocieties = useMemo(
    () => societies.filter((society) => society.is_active),
    [societies]
  );

  const filteredSocieties = useMemo(() => {
    const query = societySearch.trim().toLowerCase();
    if (!query) return activeSocieties;
    return activeSocieties.filter((society) => {
      const name = society.name?.toLowerCase() ?? '';
      const code = society.society_code?.toLowerCase() ?? '';
      return name.includes(query) || code.includes(query);
    });
  }, [activeSocieties, societySearch]);

  const selectedRole = formState.role;
  const requiresSocieties = selectedRole === 'society_admin';

  async function fetchSocieties() {
    try {
      setLoadingSocieties(true);
      const { data, error } = await supabase
        .from('societies')
        .select('id, name, society_code, is_active')
        .order('name', { ascending: true });

      if (error) throw error;
      setSocieties(data ?? []);
    } catch (fetchError) {
      console.error('[UserFormDialog] Errore nel caricamento società', fetchError);
      setError('Impossibile caricare l\'elenco delle società');
    } finally {
      setLoadingSocieties(false);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (requiresSocieties && formState.societyIds.length === 0) {
      setError('Seleziona almeno una società per gli amministratori di società');
      return;
    }

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createUserAccount({
          email: formState.email.trim(),
          fullName: formState.fullName.trim() || undefined,
          role: formState.role,
          isActive: formState.isActive,
          societyIds: formState.role === 'society_admin' ? formState.societyIds : [],
        });

        if (!result.success) {
          setError(result.error ?? 'Impossibile creare l\'utente');
          toast({
            title: 'Errore',
            description: result.error ?? 'Impossibile creare l\'utente',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Utente creato',
          description: result.message ?? 'L\'utente è stato creato correttamente',
          variant: 'success',
        });
        onSuccess();
        onOpenChange(false);
      } else if (mode === 'edit' && editingUser) {
        const result = await updateUserAccount({
          userId: editingUser.id,
          fullName: formState.fullName.trim() || '',
          role: formState.role,
          isActive: formState.isActive,
          societyIds: formState.role === 'society_admin' ? formState.societyIds : [],
        });

        if (!result.success) {
          setError(result.error ?? 'Impossibile aggiornare l\'utente');
          toast({
            title: 'Errore',
            description: result.error ?? 'Impossibile aggiornare il profilo utente',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Utente aggiornato',
          description: result.message ?? 'Il profilo è stato aggiornato correttamente',
          variant: 'success',
        });
        onSuccess();
        onOpenChange(false);
      }
    });
  };

  const dialogTitle =
    mode === 'create' ? 'Crea nuovo utente' : `Modifica ${editingUser?.full_name ?? editingUser?.email ?? 'utente'}`;
  const dialogDescription =
    mode === 'create'
      ? 'Invita un nuovo amministratore nel sistema e assegna i permessi appropriati.'
      : 'Aggiorna ruolo, stato e società assegnate dell\'utente selezionato.';
  const isActiveHelper = formState.isActive
    ? 'L\'utente potrà accedere all\'applicazione'
    : 'L\'utente non potrà accedere finché non verrà riattivato';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 whitespace-pre-line">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                disabled={mode === 'edit'}
                placeholder="nome@dominio.it"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                placeholder="Nome Cognome"
                value={formState.fullName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Ruolo</Label>
            <div className="space-y-2">
              <select
                id="role"
                value={formState.role}
                onChange={(event) => {
                  const value = event.target.value as UserRole;
                  setFormState((prev) => ({
                    ...prev,
                    role: value,
                    societyIds: value === 'society_admin' ? prev.societyIds : [],
                  }));
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {formState.role === 'super_admin' ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
                ) : formState.role === 'admin' ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span>
                  {roleOptions.find((option) => option.value === formState.role)?.description}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={formState.isActive}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, isActive: Boolean(checked) }))
                }
              />
              <div>
                <p className="font-medium text-gray-900">Utente attivo</p>
                <p className="text-xs text-gray-500">{isActiveHelper}</p>
              </div>
            </label>
          </div>

          {requiresSocieties && (
            <div className="space-y-3">
              <Label>Società assegnate</Label>
              <input
                type="text"
                value={societySearch}
                onChange={(event) => setSocietySearch(event.target.value)}
                placeholder="Cerca per nome o codice società..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div
                className={clsx(
                  'rounded-md border px-3 py-2',
                  loadingSocieties ? 'bg-gray-100' : 'bg-white'
                )}
              >
                {loadingSocieties ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Caricamento società...
                  </div>
                ) : activeSocieties.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nessuna società attiva disponibile. Aggiungi prima una società dal pannello dedicato.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredSocieties.length === 0 ? (
                      <p className="text-sm text-gray-500 px-1 py-2">
                        Nessuna società corrisponde alla ricerca.
                      </p>
                    ) : (
                      filteredSocieties.map((society) => {
                      const isChecked = formState.societyIds.includes(society.id);
                      return (
                        <label
                          key={society.id}
                          className="flex items-start gap-3 rounded-md border border-transparent px-2 py-1 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setFormState((prev) => {
                                const current = new Set(prev.societyIds);
                                if (checked) {
                                  current.add(society.id);
                                } else {
                                  current.delete(society.id);
                                }
                                return { ...prev, societyIds: Array.from(current) };
                              });
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{society.name}</p>
                            <p className="text-xs text-gray-500">{society.society_code ?? 'Senza codice'}</p>
                          </div>
                        </label>
                      );
                    }))
                    }
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Gli amministratori di società possono gestire solo le società selezionate.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio in corso...
                </>
              ) : mode === 'create' ? (
                'Crea utente'
              ) : (
                'Aggiorna utente'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
