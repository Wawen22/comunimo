'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

// Validation schema
const societySchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  society_code: z.string().optional(),
  organization: z.enum(['FIDAL', 'UISP', 'CSI', 'RUNCARD'], {
    required_error: 'Ente obbligatorio'
  }),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().max(2, 'La provincia deve essere di 2 caratteri').optional(),
  postal_code: z.string().max(5, 'Il CAP deve essere di 5 cifre').optional(),
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
      
      if (error.code === '23505') {
        if (error.message.includes('vat_number')) {
          errorMessage = 'Partita IVA già esistente';
        }
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
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
      {/* Basic Information */}
      <div className="space-y-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-4 sm:p-6 border border-blue-100/60">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>Informazioni Base</span>
        </h3>

        <div>
          <Label htmlFor="name">
            Nome Società <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Es: ASD Modena Calcio"
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="society_code">Codice Società</Label>
            <Input
              id="society_code"
              {...register('society_code')}
              placeholder="Es: MO001F"
              className="mt-1"
            />
            {errors.society_code && (
              <p className="mt-1 text-sm text-red-600">{errors.society_code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="organization">
              Ente <span className="text-red-500">*</span>
            </Label>
            <select
              id="organization"
              {...register('organization')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="FIDAL">FIDAL</option>
              <option value="UISP">UISP</option>
              <option value="CSI">CSI</option>
              <option value="RUNCARD">RUNCARD</option>
            </select>
            {errors.organization && (
              <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrizione</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="Breve descrizione della società..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="logo_url">URL Logo</Label>
          <Input
            id="logo_url"
            {...register('logo_url')}
            placeholder="https://esempio.it/logo.png"
            className="mt-1"
          />
          {errors.logo_url && (
            <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4 bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-2xl p-4 sm:p-6 border border-green-100/60">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Indirizzo</h3>

        <div>
          <Label htmlFor="address">Via</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Es: Via Roma, 123"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="city">Città</Label>
            <Input id="city" {...register('city')} placeholder="Es: Modena" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="province">Provincia</Label>
            <Input
              id="province"
              {...register('province')}
              placeholder="Es: MO"
              maxLength={2}
              className="mt-1"
            />
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postal_code">CAP</Label>
            <Input
              id="postal_code"
              {...register('postal_code')}
              placeholder="Es: 41121"
              maxLength={5}
              className="mt-1"
            />
            {errors.postal_code && (
              <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-2xl p-4 sm:p-6 border border-purple-100/60">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Contatti</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              {...register('phone')}
              type="tel"
              placeholder="Es: 059 123456"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register('email')}
              type="email"
              placeholder="Es: info@societa.it"
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="website">Sito Web</Label>
          <Input
            id="website"
            {...register('website')}
            type="url"
            placeholder="Es: https://www.societa.it"
            className="mt-1"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>
      </div>

      {/* Legal Information */}
      <div className="space-y-4 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl p-4 sm:p-6 border border-amber-100/60">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Dati Fiscali</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="vat_number">Partita IVA</Label>
            <Input
              id="vat_number"
              {...register('vat_number')}
              placeholder="Es: 12345678901"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fiscal_code">Codice Fiscale</Label>
            <Input
              id="fiscal_code"
              {...register('fiscal_code')}
              placeholder="Es: 12345678901"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="legal_representative">Rappresentante Legale</Label>
          <Input
            id="legal_representative"
            {...register('legal_representative')}
            placeholder="Es: Mario Rossi"
            className="mt-1"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6"
        >
          {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </div>
    </form>
  );
}

