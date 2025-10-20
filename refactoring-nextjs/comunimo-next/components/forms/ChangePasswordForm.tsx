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

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password attuale richiesta'),
    newPassword: z.string().min(6, 'Password deve essere almeno 6 caratteri'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Le password non corrispondono',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      // First verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          title: 'Errore',
          description: 'Utente non trovato',
          variant: 'destructive',
        });
        return;
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        toast({
          title: 'Errore',
          description: 'Password attuale non corretta',
          variant: 'destructive',
        });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        toast({
          title: 'Errore',
          description: 'Errore durante il cambio password',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Successo',
        description: 'Password aggiornata con successo',
        variant: 'success',
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Change password error:', error);
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
        <Label htmlFor="currentPassword">Password Attuale *</Label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="••••••••"
          {...register('currentPassword')}
          disabled={isLoading}
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nuova Password *</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          {...register('newPassword')}
          disabled={isLoading}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Conferma Nuova Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Aggiornamento...' : 'Cambia Password'}
      </Button>
    </form>
  );
}

