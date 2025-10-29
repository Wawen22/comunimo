'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, CircleSlash } from 'lucide-react';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/lib/types/database';
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

// Validation schema
const societySchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  society_code: z.string().optional(),
  organization: z.enum(['FIDAL', 'UISP', 'CSI', 'RUNCARD'], {
    required_error: 'Ente obbligatorio',
  }),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z
    .string()
    .max(2, 'La provincia deve essere di 2 caratteri')
    .optional(),
  postal_code: z
    .string()
    .max(5, 'Il CAP deve essere di 5 cifre')
    .optional(),
  phone: z.string().optional(),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  website: z.string().url('URL non valido').optional().or(z.literal('')),
  vat_number: z.string().optional(),
  fiscal_code: z.string().optional(),
  legal_representative: z.string().optional(),
  logo_url: z.string().url('URL non valido').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

type SocietyFormData = z.infer<typeof societySchema>;

interface SocietyFormInModalProps {
  society: Society;
  onSuccess: () => void;
}

export function SocietyFormInModal({ society, onSuccess }: SocietyFormInModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SocietyFormData>({
    resolver: zodResolver(societySchema),
    defaultValues: {
      name: society.name,
      society_code: society.society_code || '',
      organization: society.organization || 'FIDAL',
      description: society.description || '',
      address: society.address || '',
      city: society.city || '',
      province: society.province || '',
      postal_code: society.postal_code || '',
      phone: society.phone || '',
      email: society.email || '',
      website: society.website || '',
      vat_number: society.vat_number || '',
      fiscal_code: society.fiscal_code || '',
      legal_representative: society.legal_representative || '',
      logo_url: society.logo_url || '',
      is_active: society.is_active,
    },
  });

  const onSubmit = async (data: SocietyFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('societies')
        // @ts-expect-error - Supabase type inference issue
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', society.id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Società aggiornata con successo',
        variant: 'success',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving society:', error);

      let errorMessage = 'Impossibile salvare la società';

      if (error.code === '23505' && error.message.includes('vat_number')) {
        errorMessage = 'Partita IVA già esistente';
      }

      toast({
        title: 'Errore',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-full flex-col">
      <div className="flex-1 space-y-6 p-6">
        <FormSection
          step={1}
          title="Informazioni principali"
          description="Nome, ente e stato complessivo della società."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="name"
              label="Nome Società"
              required
              error={errors.name?.message}
            >
              <Input
                id="name"
                {...register('name')}
                placeholder="Es: ASD Modena Calcio"
              />
            </Field>

            <Field
              id="society_code"
              label="Codice Società"
              error={errors.society_code?.message}
            >
              <Input
                id="society_code"
                {...register('society_code')}
                placeholder="Es: MO001F"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="organization"
              render={({ field }) => (
                <Field
                  id="organization"
                  label="Ente di Affiliazione"
                  required
                  error={errors.organization?.message}
                >
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="organization">
                      <SelectValue placeholder="Seleziona ente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIDAL">FIDAL</SelectItem>
                      <SelectItem value="UISP">UISP</SelectItem>
                      <SelectItem value="CSI">CSI</SelectItem>
                      <SelectItem value="RUNCARD">RUNCARD</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <StatusPanel
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
          </div>

          <Field
            id="description"
            label="Descrizione"
            description="Condividi una descrizione breve che aiuti gli altri utenti a riconoscere la società."
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Breve descrizione della società..."
            />
          </Field>

          <Field
            id="logo_url"
            label="URL Logo"
            description="Inserisci l'indirizzo assoluto dell'immagine (PNG o JPG)."
            error={errors.logo_url?.message}
          >
            <Input
              id="logo_url"
              {...register('logo_url')}
              placeholder="https://esempio.it/logo.png"
            />
          </Field>
        </FormSection>

        <FormSection
          step={2}
          title="Sede e indirizzo"
          description="Informazioni logistiche per contatto e documentazione."
        >
          <Field
            id="address"
            label="Indirizzo"
            description="Via e numero civico della sede principale."
            error={errors.address?.message}
          >
            <Input
              id="address"
              {...register('address')}
              placeholder="Es: Via Roma, 123"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="city"
              label="Città"
              error={errors.city?.message}
            >
              <Input
                id="city"
                {...register('city')}
                placeholder="Es: Modena"
              />
            </Field>

            <Field
              id="province"
              label="Provincia"
              description="Due lettere, es. MO"
              error={errors.province?.message}
            >
              <Input
                id="province"
                {...register('province')}
                placeholder="Es: MO"
                maxLength={2}
              />
            </Field>

            <Field
              id="postal_code"
              label="CAP"
              error={errors.postal_code?.message}
            >
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder="Es: 41121"
                maxLength={5}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          step={3}
          title="Contatti"
          description="Dati per telefonate, email o sito web."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Telefono" error={errors.phone?.message}>
              <Input
                id="phone"
                {...register('phone')}
                type="tel"
                placeholder="Es: 059 123456"
              />
            </Field>

            <Field id="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                {...register('email')}
                type="email"
                placeholder="Es: info@societa.it"
              />
            </Field>
          </div>

          <Field
            id="website"
            label="Sito Web"
            error={errors.website?.message}
          >
            <Input
              id="website"
              {...register('website')}
              type="url"
              placeholder="https://www.societa.it"
            />
          </Field>
        </FormSection>

        <FormSection
          step={4}
          title="Dati fiscali"
          description="Informazioni per fatturazione e documenti ufficiali."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="vat_number"
              label="Partita IVA"
              error={errors.vat_number?.message}
            >
              <Input
                id="vat_number"
                {...register('vat_number')}
                placeholder="Es: 12345678901"
              />
            </Field>

            <Field
              id="fiscal_code"
              label="Codice Fiscale"
              error={errors.fiscal_code?.message}
            >
              <Input
                id="fiscal_code"
                {...register('fiscal_code')}
                placeholder="Es: 12345678901"
              />
            </Field>
          </div>

          <Field
            id="legal_representative"
            label="Rappresentante Legale"
            error={errors.legal_representative?.message}
          >
            <Input
              id="legal_representative"
              {...register('legal_representative')}
              placeholder="Es: Mario Rossi"
            />
          </Field>
        </FormSection>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[160px] bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
          {step}
        </span>
        {title}
      </legend>
      {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  children,
  error,
  required,
  description,
}: {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function StatusPanel({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-emerald-50/40 p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-700">Stato della società</p>
        <p className="text-xs text-slate-500">
          Controlla la visibilità pubblica all’interno del portale.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        disabled={disabled}
        aria-pressed={value}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${
          value
            ? 'border-transparent bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-200'
            : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-200'
        }`}
      >
        {value ? <CheckCircle2 className="h-4 w-4" /> : <CircleSlash className="h-4 w-4" />}
        {value ? 'Attiva' : 'Inattiva'}
      </button>
    </div>
  );
}
