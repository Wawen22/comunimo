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
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email non valida'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
      }

      // Always show success to prevent email enumeration
      setEmailSent(true);
      toast({
        title: 'Email inviata',
        description: 'Controlla la tua email per il link di reset password',
        variant: 'success',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Errore',
        description: 'Errore di connessione, riprova',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Ti abbiamo inviato un'email con le istruzioni per reimpostare la
            password.
          </p>
        </div>
        <Link
          href="/login"
          className="block text-sm text-blue-600 hover:underline"
        >
          Torna al login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Invio in corso...' : 'Invia email di reset'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Ricordi la password?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}

