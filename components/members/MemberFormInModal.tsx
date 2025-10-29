'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/api/supabase';
import { Member, Society } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { assignCategory, getCategoriesByGender, type Gender } from '@/lib/utils/categoryAssignment';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

// Validation schema
const memberSchema = z.object({
  first_name: z.string().min(1, 'Nome obbligatorio'),
  last_name: z.string().min(1, 'Cognome obbligatorio'),
  fiscal_code: z
    .string()
    .regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/, 'Codice fiscale non valido (16 caratteri)')
    .optional()
    .or(z.literal('')),
  birth_date: z.string().min(1, 'Data di nascita obbligatoria'),
  birth_place: z.string().optional(),
  gender: z.enum(['M', 'F', 'other'], { required_error: 'Genere obbligatorio' }),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().max(2, 'Provincia deve essere di 2 caratteri').optional(),
  postal_code: z.string().max(5, 'CAP deve essere di 5 cifre').optional(),
  society_id: z.string().min(1, 'Società obbligatoria'),
  society_code: z.string().min(1, 'Codice società obbligatorio'),
  membership_number: z.string().optional(),
  membership_date: z.string().optional(),
  membership_type: z.string().optional(),
  membership_status: z.enum(['active', 'suspended', 'expired', 'cancelled']).default('active'),
  year: z.number().optional().or(z.string().optional()),
  regional_code: z.string().optional(),
  category: z.string().optional(),
  is_foreign: z.boolean().default(false),
  medical_certificate_date: z.string().optional(),
  medical_certificate_expiry: z.string().optional(),
  photo_url: z.string().url('URL non valido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormInModalProps {
  member?: Member;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Dati personali',
    description: 'Anagrafica di base dell’atleta',
  },
  {
    id: 2,
    title: 'Contatti e indirizzo',
    description: 'Dove e come contattare l’atleta',
  },
  {
    id: 3,
    title: 'Tesseramento',
    description: 'Stato di iscrizione e società di riferimento',
  },
  {
    id: 4,
    title: 'Dati atletici e documenti',
    description: 'Categoria, certificato medico e note interne',
  },
] as const;

export function MemberFormInModal({ member, mode = 'create', onSuccess, onCancel }: MemberFormInModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [justChangedStep, setJustChangedStep] = useState(false);
  const totalSteps = steps.length;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          first_name: member.first_name,
          last_name: member.last_name,
          fiscal_code: member.fiscal_code || '',
          birth_date: member.birth_date || '',
          birth_place: member.birth_place || '',
          gender: (member.gender as MemberFormData['gender']) || 'M',
          email: member.email || '',
          phone: member.phone || '',
          mobile: member.mobile || '',
          address: member.address || '',
          city: member.city || '',
          province: member.province || '',
          postal_code: member.postal_code || '',
          society_id: member.society_id || '',
          society_code: member.society_code || '',
          membership_number: member.membership_number || '',
          membership_date: member.membership_date || '',
          membership_type: member.membership_type || '',
          membership_status: member.membership_status || 'active',
          year: member.year || '',
          regional_code: member.regional_code || '',
          category: member.category || '',
          is_foreign: member.is_foreign || false,
          medical_certificate_date: member.medical_certificate_date || '',
          medical_certificate_expiry: member.medical_certificate_expiry || '',
          photo_url: member.photo_url || '',
          notes: member.notes || '',
        }
      : {
          first_name: '',
          last_name: '',
          fiscal_code: '',
          birth_date: '',
          birth_place: '',
          gender: 'M',
          email: '',
          phone: '',
          mobile: '',
          address: '',
          city: '',
          province: '',
          postal_code: '',
          society_id: '',
          society_code: '',
          membership_number: '',
          membership_date: '',
          membership_type: '',
          membership_status: 'active',
          year: '',
          regional_code: '',
          category: '',
          is_foreign: false,
          medical_certificate_date: '',
          medical_certificate_expiry: '',
          photo_url: '',
          notes: '',
        },
  });

  const watchedSocietyId = watch('society_id');
  const watchedBirthDate = watch('birth_date');
  const watchedGender = watch('gender');

  useEffect(() => {
    fetchSocieties();
  }, []);

  useEffect(() => {
    if (justChangedStep) {
      setJustChangedStep(false);
      return;
    }

    const selectedSociety = societies.find((s) => s.id === watchedSocietyId);
    if (selectedSociety) {
      setValue('society_code', selectedSociety.society_code || '');
    }
  }, [watchedSocietyId, societies, setValue, justChangedStep]);

  useEffect(() => {
    if (justChangedStep) {
      setJustChangedStep(false);
      return;
    }

    if (watchedBirthDate && watchedGender) {
      const category = assignCategory(watchedBirthDate, watchedGender as Gender);
      if (category) {
        setValue('category', category);
      }
    }
  }, [watchedBirthDate, watchedGender, setValue, justChangedStep]);

  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSocieties(data || []);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const nextStep = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
    }
    setJustChangedStep(true);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
    }
    setJustChangedStep(true);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const sanitizeValue = (value: any) => {
    if (value === '' || value === null || value === undefined) return null;
    return value;
  };

  const onSubmit = async (data: MemberFormData) => {
    try {
      setIsLoading(true);

      const yearValue =
        data.year != null && data.year !== ''
          ? typeof data.year === 'string'
            ? parseInt(data.year, 10)
            : data.year
          : null;

      const memberData = {
        first_name: data.first_name,
        last_name: data.last_name,
        fiscal_code: sanitizeValue(data.fiscal_code),
        birth_date: data.birth_date,
        birth_place: sanitizeValue(data.birth_place),
        gender: data.gender,
        email: sanitizeValue(data.email),
        phone: sanitizeValue(data.phone),
        mobile: sanitizeValue(data.mobile),
        address: sanitizeValue(data.address),
        city: sanitizeValue(data.city),
        province: sanitizeValue(data.province),
        postal_code: sanitizeValue(data.postal_code),
        society_id: data.society_id,
        society_code: data.society_code,
        membership_number: sanitizeValue(data.membership_number),
        membership_date: sanitizeValue(data.membership_date),
        membership_type: sanitizeValue(data.membership_type),
        membership_status: data.membership_status,
        organization: societies.find((s) => s.id === data.society_id)?.organization || null,
        year: yearValue,
        regional_code: sanitizeValue(data.regional_code),
        category: sanitizeValue(data.category),
        is_foreign: data.is_foreign,
        medical_certificate_date: sanitizeValue(data.medical_certificate_date),
        medical_certificate_expiry: sanitizeValue(data.medical_certificate_expiry),
        photo_url: sanitizeValue(data.photo_url),
        notes: sanitizeValue(data.notes),
        user_id: user?.id,
      };

      if (mode === 'create') {
        const { error } = await supabase
          .from('members')
          .insert([memberData] as any)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Successo',
          description: 'Atleta creato con successo',
          variant: 'success',
        });

        if (onSuccess) onSuccess();
      } else if (member) {
        const { error } = await supabase
          .from('members')
          // @ts-expect-error - Supabase type inference issue
          .update({
            ...memberData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', member.id);

        if (error) throw error;

        toast({
          title: 'Successo',
          description: 'Atleta aggiornato con successo',
          variant: 'success',
        });

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving member:', error);

      toast({
        title: 'Errore',
        description: "Impossibile salvare l'atleta",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = () => {
    toast({
      title: 'Errore di validazione',
      description: 'Controlla i campi obbligatori e riprova',
      variant: 'destructive',
    });
  };

  const categoriesForGender = watchedGender ? getCategoriesByGender(watchedGender as Gender) : [];

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="flex min-h-full flex-col">
      <StepIndicator currentStep={currentStep} />

      <div className="flex-1 space-y-6 p-6">
        {currentStep === 1 && (
          <FormSection title="Anagrafica atleta" description="Inserisci i dati identificativi principali.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="first_name" label="Nome" required error={errors.first_name?.message}>
                <Input id="first_name" {...register('first_name')} placeholder="Mario" />
              </Field>

              <Field id="last_name" label="Cognome" required error={errors.last_name?.message}>
                <Input id="last_name" {...register('last_name')} placeholder="Rossi" />
              </Field>

              <Field id="fiscal_code" label="Codice Fiscale" error={errors.fiscal_code?.message}>
                <Input
                  id="fiscal_code"
                  {...register('fiscal_code')}
                  placeholder="RSSMRA80A01H501Z"
                  maxLength={16}
                />
              </Field>

              <Field id="birth_date" label="Data di nascita" required error={errors.birth_date?.message}>
                <Input id="birth_date" type="date" {...register('birth_date')} />
              </Field>

              <Field id="birth_place" label="Luogo di nascita" error={errors.birth_place?.message}>
                <Input id="birth_place" {...register('birth_place')} placeholder="Modena" />
              </Field>

              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Field id="gender" label="Genere" required error={errors.gender?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Seleziona genere" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Maschio</SelectItem>
                        <SelectItem value="F">Femmina</SelectItem>
                        <SelectItem value="other">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>
          </FormSection>
        )}

        {currentStep === 2 && (
          <FormSection
            title="Contatti e indirizzo"
            description="Mantieni aggiornati i riferimenti per comunicare con l’atleta."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="email" label="Email" error={errors.email?.message}>
                <Input id="email" {...register('email')} type="email" placeholder="mario.rossi@email.it" />
              </Field>

              <Field id="phone" label="Telefono" error={errors.phone?.message}>
                <Input id="phone" {...register('phone')} placeholder="059 123456" />
              </Field>

              <Field id="mobile" label="Cellulare" error={errors.mobile?.message}>
                <Input id="mobile" {...register('mobile')} placeholder="+39 333 1234567" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field id="address" label="Indirizzo" error={errors.address?.message}>
                <Input id="address" {...register('address')} placeholder="Via Roma, 123" />
              </Field>

              <Field id="city" label="Città" error={errors.city?.message}>
                <Input id="city" {...register('city')} placeholder="Modena" />
              </Field>

              <Field id="province" label="Provincia" error={errors.province?.message}>
                <Input id="province" {...register('province')} maxLength={2} placeholder="MO" />
              </Field>

              <Field id="postal_code" label="CAP" error={errors.postal_code?.message}>
                <Input id="postal_code" {...register('postal_code')} maxLength={5} placeholder="41121" />
              </Field>
            </div>
          </FormSection>
        )}

        {currentStep === 3 && (
          <FormSection title="Tesseramento" description="Associa l’atleta alla società e aggiorna il suo stato.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="society_id" label="Società" required error={errors.society_id?.message}>
                <select
                  id="society_id"
                  {...register('society_id')}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">Seleziona società</option>
                  {societies.map((society) => (
                    <option key={society.id} value={society.id}>
                      {society.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="society_code" label="Codice società" required error={errors.society_code?.message}>
                <Input id="society_code" {...register('society_code')} placeholder="MO001F" />
              </Field>

              <Field id="membership_number" label="Numero tessera" error={errors.membership_number?.message}>
                <Input id="membership_number" {...register('membership_number')} placeholder="12345" />
              </Field>

              <Field id="membership_date" label="Data tesseramento" error={errors.membership_date?.message}>
                <Input id="membership_date" type="date" {...register('membership_date')} />
              </Field>

              <Field id="membership_type" label="Tipo tesseramento" error={errors.membership_type?.message}>
                <Input id="membership_type" {...register('membership_type')} placeholder="Agonistico" />
              </Field>

              <Controller
                control={control}
                name="membership_status"
                render={({ field }) => (
                  <Field id="membership_status" label="Stato tesseramento" error={errors.membership_status?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="membership_status">
                        <SelectValue placeholder="Seleziona stato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Attivo</SelectItem>
                        <SelectItem value="suspended">Sospeso</SelectItem>
                        <SelectItem value="expired">Scaduto</SelectItem>
                        <SelectItem value="cancelled">Annullato</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>
          </FormSection>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <FormSection
              title="Dati atletici"
              description="Calcola automaticamente la categoria e definisci le informazioni sportive."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="category" label="Categoria" error={errors.category?.message}>
                  <select
                    id="category"
                    {...register('category')}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">Seleziona categoria</option>
                    {categoriesForGender.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="year" label="Anno" error={errors.year?.toString()}>
                  <Input id="year" {...register('year')} type="number" placeholder="2024" />
                </Field>

                <Field id="regional_code" label="Codice regionale" error={errors.regional_code?.message}>
                  <Input id="regional_code" {...register('regional_code')} placeholder="REG123" />
                </Field>

                <Controller
                  control={control}
                  name="is_foreign"
                  render={({ field }) => (
                    <Field id="is_foreign" label="Atleta straniero">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            'rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2',
                            field.value
                              ? 'border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-200'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus:ring-slate-200',
                          )}
                        >
                          {field.value ? 'Sì' : 'No'}
                        </button>
                        <span className="text-xs text-slate-500">
                          {field.value
                            ? 'L’atleta è registrato come straniero.'
                            : 'L’atleta è registrato come italiano.'}
                        </span>
                      </div>
                    </Field>
                  )}
                />
              </div>
            </FormSection>

            <FormSection
              title="Certificato medico & note"
              description="Tieni traccia della validità del certificato medico e annota informazioni utili."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="medical_certificate_date"
                  label="Data certificato"
                  error={errors.medical_certificate_date?.message}
                >
                  <Input id="medical_certificate_date" type="date" {...register('medical_certificate_date')} />
                </Field>

                <Field
                  id="medical_certificate_expiry"
                  label="Scadenza certificato"
                  error={errors.medical_certificate_expiry?.message}
                >
                  <Input id="medical_certificate_expiry" type="date" {...register('medical_certificate_expiry')} />
                </Field>
              </div>

              <Field id="photo_url" label="URL foto" error={errors.photo_url?.message}>
                <Input id="photo_url" {...register('photo_url')} placeholder="https://esempio.it/foto.jpg" />
              </Field>

              <Field id="notes" label="Note interne" error={errors.notes?.message}>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  rows={4}
                  placeholder="Annotazioni utili per lo staff..."
                />
              </Field>
            </FormSection>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Step {currentStep} di {totalSteps}
          </div>

          <div className="flex items-center justify-end gap-3">
            {onCancel && (
              <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
                Annulla
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="hidden sm:inline-flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Indietro
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                Avanti
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Salvataggio...' : 'Salva atleta'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-start gap-4 overflow-x-auto">
        {steps.map((step) => (
          <div key={step.id} className="flex min-w-[180px] flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition',
                  step.id <= currentStep
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600',
                )}
              >
                {step.id}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  step.id <= currentStep ? 'text-slate-900' : 'text-slate-500',
                )}
              >
                {step.title}
              </span>
            </div>
            <p className="text-xs text-slate-500">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
  error,
  required,
}: {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
