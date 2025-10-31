'use client';

import { useEffect, useMemo, useState, type UIEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/api/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import type { AllSociety } from '@/types/database';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Nome deve essere almeno 2 caratteri'),
    email: z.string().email('Email non valida'),
    password: z.string().min(6, 'Password deve essere almeno 6 caratteri'),
    confirmPassword: z.string(),
    societyIds: z
      .array(z.string().uuid('Società non valida'))
      .min(1, 'Seleziona almeno una società'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non corrispondono',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;
type SocietyOption = Pick<AllSociety, 'id' | 'name' | 'society_code'>;

const SOCIETY_PAGE_SIZE = 30;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      societyIds: [],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [societySearch, setSocietySearch] = useState('');
  const [societyOptions, setSocietyOptions] = useState<SocietyOption[]>([]);
  const [societyLookup, setSocietyLookup] = useState<Record<string, SocietyOption>>({});
  const [isSocietyLoading, setIsSocietyLoading] = useState(false);
  const [isSocietyLoadingMore, setIsSocietyLoadingMore] = useState(false);
  const [societyError, setSocietyError] = useState<string | null>(null);
  const [hasMoreSocieties, setHasMoreSocieties] = useState(true);
  const [societyPage, setSocietyPage] = useState(0);
  const [isSocietyDialogOpen, setIsSocietyDialogOpen] = useState(false);

  const handleSocietyDialogChange = (open: boolean) => {
    setIsSocietyDialogOpen(open);
    if (open) {
      setSocietyPage(0);
      setHasMoreSocieties(true);
      setSocietyOptions([]);
      setSocietyError(null);
      setIsSocietyLoading(false);
      setIsSocietyLoadingMore(false);
    } else {
      setSocietyOptions([]);
      setSocietyError(null);
      setIsSocietyLoading(false);
      setIsSocietyLoadingMore(false);
      setSocietyPage(0);
      setHasMoreSocieties(true);
    }
  };

  const selectedSocietyIds = watch('societyIds');
  const selectedSocieties = useMemo(
    () =>
      (selectedSocietyIds ?? [])
        .map((id) => societyLookup[id])
        .filter((society): society is SocietyOption => Boolean(society)),
    [selectedSocietyIds, societyLookup]
  );

  useEffect(() => {
    if (!isSocietyDialogOpen) {
      return undefined;
    }

    let isCancelled = false;
    const isInitialPage = societyPage === 0;

    if (isInitialPage) {
      setIsSocietyLoading(true);
    } else {
      setIsSocietyLoadingMore(true);
    }
    setSocietyError(null);

    const handler = setTimeout(async () => {
      try {
        const searchTerm = societySearch.trim();
        const rangeStart = societyPage * SOCIETY_PAGE_SIZE;
        const rangeEnd = rangeStart + SOCIETY_PAGE_SIZE - 1;

        let query = supabase
          .from('all_societies')
          .select('id, name, society_code')
          .order('name', { ascending: true })
          .range(rangeStart, rangeEnd);

        if (searchTerm) {
          const sanitized = searchTerm.replace(/[%_]/g, (char) => `\\${char}`);
          query = query.or(
            `name.ilike.%${sanitized}%,society_code.ilike.%${sanitized}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;
        if (isCancelled) return;

        const mappedSocieties = (data ?? []) as SocietyOption[];

        setSocietyOptions((prev) => {
          if (isInitialPage) {
            return mappedSocieties;
          }

          if (!mappedSocieties.length) {
            return prev;
          }

          const existingIds = new Set(prev.map((society) => society.id));
          const merged = mappedSocieties.filter((society) => !existingIds.has(society.id));
          return merged.length ? [...prev, ...merged] : prev;
        });

        setSocietyLookup((prev) => {
          if (!mappedSocieties.length) return prev;
          const next = { ...prev };
          mappedSocieties.forEach((society) => {
            next[society.id] = society;
          });
          return next;
        });

        setHasMoreSocieties(mappedSocieties.length === SOCIETY_PAGE_SIZE);
      } catch (error) {
        if (isCancelled) return;
        console.error('Society fetch error:', error);
        if (isInitialPage) {
          setSocietyOptions([]);
        }
        setHasMoreSocieties(false);
        setSocietyError('Impossibile caricare le società. Riprova.');
      } finally {
        if (!isCancelled) {
          if (isInitialPage) {
            setIsSocietyLoading(false);
          } else {
            setIsSocietyLoadingMore(false);
          }
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(handler);
    };
  }, [societySearch, societyPage, isSocietyDialogOpen]);

  const handleSocietyListScroll = (event: UIEvent<HTMLUListElement>) => {
    const target = event.currentTarget;
    if (!hasMoreSocieties || isSocietyLoading || isSocietyLoadingMore) {
      return;
    }

    const threshold = 64;
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= threshold) {
      setIsSocietyLoadingMore(true);
      setSocietyPage((prev) => prev + 1);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              requested_society_ids: data.societyIds,
            },
          },
        });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: 'Errore',
            description: 'Email già registrata',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Errore',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      if (authData.user) {
        const response = await fetch('/api/register/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authData.user.id,
            email: data.email,
            fullName: data.fullName,
            societyIds: data.societyIds,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message =
            (payload && typeof payload.error === 'string' && payload.error.trim().length > 0
              ? payload.error
              : null) ?? 'Registrazione completata ma non è stato possibile notificare gli amministratori.';
          toast({
            title: 'Attenzione',
            description: message,
            variant: 'destructive',
          });
        }

        toast({
          title: 'Successo',
          description: 'Registrazione completata con successo',
          variant: 'success',
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Errore',
        description: 'Errore di connessione, riprova',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Mario Rossi"
          {...register('fullName')}
          disabled={isLoading}
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nome@esempio.it"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Conferma password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="society-selector">Società da associare</Label>
        <p className="text-sm text-gray-600">
          Seleziona le società a cui desideri avere accesso; un amministratore approverà la richiesta.
        </p>
        <Controller
          name="societyIds"
          control={control}
          render={({ field }) => {
            const toggleSelection = (societyId: string, checked: boolean) => {
              const base = Array.isArray(field.value) ? field.value : [];
              if (checked) {
                field.onChange(Array.from(new Set([...base, societyId])));
              } else {
                field.onChange(base.filter((id) => id !== societyId));
              }
            };

            const selectedCount = Array.isArray(field.value) ? field.value.length : 0;

            return (
              <>
                <div className="flex flex-wrap gap-2">
                  {selectedSocieties.length > 0 ? (
                    selectedSocieties.map((society) => (
                      <span
                        key={society.id}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                      >
                        {society.society_code
                          ? `${society.society_code} — ${society.name}`
                          : society.name}
                        <button
                          type="button"
                          className="text-blue-600 transition hover:text-blue-800"
                          onClick={() => toggleSelection(society.id, false)}
                          aria-label={`Rimuovi ${society.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      Nessuna società selezionata.
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    id="society-selector"
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleSocietyDialogChange(true)}
                    disabled={isLoading}
                  >
                    {selectedCount > 0
                      ? `Modifica selezione (${selectedCount})`
                      : 'Seleziona società'}
                  </Button>

                  {selectedCount > 0 && (
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
                      onClick={() => field.onChange([])}
                    >
                      Svuota selezione
                    </button>
                  )}
                </div>

                <Dialog open={isSocietyDialogOpen} onOpenChange={handleSocietyDialogChange}>
                  <DialogContent className="max-w-2xl space-y-6">
                    <DialogHeader>
                      <DialogTitle>Seleziona società</DialogTitle>
                      <DialogDescription>
                        Cerca per nome o codice società e seleziona una o più opzioni da associare al tuo account.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Input
                        id="societies-search"
                        type="text"
                        placeholder="Cerca per nome o codice società"
                        autoComplete="off"
                        value={societySearch}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSocietySearch(value);
                          setSocietyPage(0);
                          setHasMoreSocieties(true);
                          setSocietyOptions([]);
                          setIsSocietyLoading(false);
                          setIsSocietyLoadingMore(false);
                          setSocietyError(null);
                        }}
                        autoFocus
                        disabled={isLoading}
                      />

                      <div className="max-h-72 overflow-hidden rounded-xl border border-gray-200">
                        {isSocietyLoading ? (
                          <div className="flex items-center justify-center px-6 py-10 text-sm text-gray-500">
                            Caricamento società...
                          </div>
                        ) : societyOptions.length > 0 ? (
                          <ul
                            className="max-h-72 overflow-y-auto divide-y divide-gray-100"
                            onScroll={handleSocietyListScroll}
                          >
                            {societyOptions.map((option) => {
                              const checked = Array.isArray(field.value)
                                ? field.value.includes(option.id)
                                : false;
                              return (
                                <li key={option.id}>
                                  <label
                                    htmlFor={`society-${option.id}`}
                                    className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-gray-50"
                                  >
                                    <Checkbox
                                      id={`society-${option.id}`}
                                      checked={checked}
                                      onCheckedChange={(next) =>
                                        toggleSelection(option.id, Boolean(next))
                                      }
                                      disabled={isLoading}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-gray-900">
                                        {option.name}
                                      </span>
                                      {option.society_code && (
                                        <span className="text-xs text-gray-500">
                                          {option.society_code}
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                </li>
                              );
                            })}
                            {societyError && (
                              <li
                                key="society-error"
                                className="px-4 py-3 text-xs text-red-600"
                              >
                                {societyError}
                              </li>
                            )}
                            {isSocietyLoadingMore && (
                              <li
                                key="loading-more"
                                className="flex justify-center px-4 py-3 text-xs text-gray-500"
                              >
                                Caricamento altre società...
                              </li>
                            )}
                            {!hasMoreSocieties && societyOptions.length > 0 && !isSocietyLoadingMore && (
                              <li
                                key="end-of-results"
                                className="px-4 py-3 text-xs text-gray-400"
                              >
                                Fine dell'elenco. Usa la ricerca per altre società.
                              </li>
                            )}
                          </ul>
                        ) : (
                          <div className="px-6 py-10 text-sm text-gray-500">
                            {societyError
                              ? societyError
                              : societySearch.trim()
                              ? 'Nessuna società trovata per questa ricerca.'
                              : 'Digita per filtrare e selezionare la tua società.'}
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange([])}
                        disabled={selectedCount === 0}
                      >
                        Svuota selezione
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleSocietyDialogChange(false)}
                      >
                        Conferma selezione
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            );
          }}
        />
        {errors.societyIds && (
          <p className="text-sm text-red-600">{errors.societyIds.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Registrazione in corso...' : 'Registrati'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Hai già un account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
