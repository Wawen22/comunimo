'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/api/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import type { Profile } from '@/types/database';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve essere almeno 2 caratteri'),
  phone: z.string().optional(),
  fiscal_code: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: Profile;
  onSuccess?: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      fiscal_code: profile.fiscal_code || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue with profiles table
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
          fiscal_code: data.fiscal_code || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        toast({
          title: 'Errore',
          description: 'Errore durante l\'aggiornamento del profilo',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Successo',
        description: 'Profilo aggiornato con successo',
        variant: 'success',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Profile update error:', error);
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
        <Label htmlFor="full_name">Nome Completo *</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Mario Rossi"
          {...register('full_name')}
          disabled={isLoading}
        />
        {errors.full_name && (
          <p className="text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefono</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+39 123 456 7890"
          {...register('phone')}
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fiscal_code">Codice Fiscale</Label>
        <Input
          id="fiscal_code"
          type="text"
          placeholder="RSSMRA80A01H501U"
          {...register('fiscal_code')}
          disabled={isLoading}
        />
        {errors.fiscal_code && (
          <p className="text-sm text-red-600">{errors.fiscal_code.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </div>
    </form>
  );
}

